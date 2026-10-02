from __future__ import annotations

import os
import queue
import threading
import uuid
from datetime import datetime
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from auth import create_access_token, get_current_user
from database import Base, SessionLocal, engine
from models import GenerationJob, User, Video
from services.video_service import generate_video_from_prompt

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Video Generator", version="1.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)
JOB_QUEUE: queue.Queue[str] = queue.Queue()


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=3, max_length=120)
    password: str = Field(..., min_length=6, max_length=128)


class LoginRequest(BaseModel):
    username: str
    password: str


class GenerationRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=500)
    duration: int = Field(default=5, ge=1, le=30)
    aspect_ratio: str = Field(default="16:9")
    provider: str = Field(default="mock")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _job_to_dict(job: GenerationJob) -> dict[str, Any]:
    return {
        "id": job.id,
        "user_id": job.user_id,
        "prompt": job.prompt,
        "provider": job.provider,
        "duration": job.duration,
        "aspect_ratio": job.aspect_ratio,
        "status": job.status,
        "file_name": job.file_name,
        "error": job.error,
        "created_at": job.created_at.isoformat() if job.created_at else None,
        "updated_at": job.updated_at.isoformat() if job.updated_at else None,
    }


def _video_to_dict(video: Video) -> dict[str, Any]:
    return {
        "id": video.id,
        "user_id": video.user_id,
        "prompt": video.prompt,
        "provider": video.provider,
        "duration": video.duration,
        "aspect_ratio": video.aspect_ratio,
        "status": video.status,
        "file_name": video.file_name,
        "created_at": video.created_at.isoformat() if video.created_at else None,
        "updated_at": video.updated_at.isoformat() if video.updated_at else None,
        "download_url": f"/download/{video.file_name}",
    }


def process_job(job_id: str) -> None:
    db = SessionLocal()
    try:
        job = db.query(GenerationJob).filter(GenerationJob.id == job_id).first()
        if not job:
            return

        job.status = "processing"
        job.updated_at = datetime.utcnow()
        db.commit()

        file_name = generate_video_from_prompt(
            prompt=job.prompt,
            duration=job.duration,
            aspect_ratio=job.aspect_ratio,
            provider=job.provider,
        )

        job.status = "completed"
        job.file_name = file_name
        job.updated_at = datetime.utcnow()
        db.commit()

        video = Video(
            user_id=job.user_id,
            prompt=job.prompt,
            provider=job.provider,
            duration=job.duration,
            aspect_ratio=job.aspect_ratio,
            status="completed",
            file_name=file_name,
        )
        db.add(video)
        db.commit()
    except Exception as exc:  # pragma: no cover - defensive branch
        job = db.query(GenerationJob).filter(GenerationJob.id == job_id).first()
        if job:
            job.status = "failed"
            job.error = str(exc)
            job.updated_at = datetime.utcnow()
            db.commit()
    finally:
        db.close()


def worker_loop() -> None:
    while True:
        job_id = JOB_QUEUE.get()
        try:
            process_job(job_id)
        finally:
            JOB_QUEUE.task_done()


worker_thread = threading.Thread(target=worker_loop, daemon=True)
worker_thread.start()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/register")
async def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    existing = db.query(User).filter((User.username == payload.username) | (User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user)
    return {"token": token, "user": {"id": user.id, "username": user.username, "email": user.email}}


@app.post("/api/login")
async def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(user)
    return {"token": token, "user": {"id": user.id, "username": user.username, "email": user.email}}


@app.get("/api/me")
async def me(current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    return {"id": current_user.id, "username": current_user.username, "email": current_user.email}


@app.get("/api/videos")
async def list_videos(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    videos = db.query(Video).filter(Video.user_id == current_user.id).order_by(Video.created_at.desc()).all()
    return [_video_to_dict(video) for video in videos]


@app.post("/api/jobs")
async def create_job(
    payload: GenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    job = GenerationJob(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        prompt=payload.prompt,
        provider=payload.provider,
        duration=payload.duration,
        aspect_ratio=payload.aspect_ratio,
        status="queued",
    )
    db.add(job)
    db.commit()
    JOB_QUEUE.put(job.id)
    return {"job_id": job.id, "status": "queued"}


@app.get("/api/jobs")
async def list_jobs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    jobs = db.query(GenerationJob).filter(GenerationJob.user_id == current_user.id).order_by(GenerationJob.created_at.desc()).all()
    return [_job_to_dict(job) for job in jobs]


@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, Any]:
    job = db.query(GenerationJob).filter(GenerationJob.id == job_id, GenerationJob.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return _job_to_dict(job)


@app.get("/")
async def root() -> FileResponse:
    frontend_path = os.path.join("frontend", "dist", "index.html")
    if os.path.exists(frontend_path):
        return FileResponse(frontend_path)
    return FileResponse("templates/index.html")


@app.get("/assets/{file_name}")
async def assets(file_name: str):
    asset_dir = os.path.join("frontend", "dist", "assets")
    asset_path = os.path.join(asset_dir, file_name)
    if os.path.exists(asset_path):
        return FileResponse(asset_path)
    raise HTTPException(status_code=404, detail="Asset not found")


@app.get("/download/{file_name}")
async def download_video(file_name: str):
    output_path = os.path.join("output", file_name)
    if not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(path=output_path, media_type="video/mp4", filename=file_name)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
