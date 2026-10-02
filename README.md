from __future__ import annotations

import asyncio
import os
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from services.video_service import generate_video_from_prompt

OUTPUT_DIR = Path("output")
OUTPUT_DIR.mkdir(exist_ok=True)

jobs: Dict[str, Dict[str, Any]] = {}
job_lock = asyncio.Lock()


class GenerationRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    duration: int = Field(default=5, ge=1, le=30)
    aspect_ratio: str = Field(default="16:9")
    provider: str = Field(default="mock")


class JobStatusResponse(BaseModel):
    id: str
    status: str
    prompt: str
    duration: int
    aspect_ratio: str
    provider: str
    file_name: str | None = None
    created_at: str
    updated_at: str
    error: str | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.jobs = jobs
    yield


app = FastAPI(title="AI Video Generator", version="1.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def _run_job(job_id: str, request: GenerationRequest) -> None:
    try:
        async with job_lock:
            jobs[job_id]["status"] = "processing"
            jobs[job_id]["updated_at"] = __import__("datetime").datetime.utcnow().isoformat() + "Z"

        file_name = await asyncio.to_thread(
            generate_video_from_prompt,
            request.prompt,
            request.duration,
            request.aspect_ratio,
            request.provider,
        )

        async with job_lock:
            jobs[job_id]["status"] = "completed"
            jobs[job_id]["file_name"] = file_name
            jobs[job_id]["updated_at"] = __import__("datetime").datetime.utcnow().isoformat() + "Z"
    except Exception as exc:  # pragma: no cover - defensive error handling
        async with job_lock:
            jobs[job_id]["status"] = "failed"
            jobs[job_id]["error"] = str(exc)
            jobs[job_id]["updated_at"] = __import__("datetime").datetime.utcnow().isoformat() + "Z"


@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/api/jobs")
async def create_job(request: GenerationRequest) -> Dict[str, Any]:
    job_id = str(uuid.uuid4())
    now = __import__("datetime").datetime.utcnow().isoformat() + "Z"

    jobs[job_id] = {
        "id": job_id,
        "status": "queued",
        "prompt": request.prompt,
        "duration": request.duration,
        "aspect_ratio": request.aspect_ratio,
        "provider": request.provider,
        "file_name": None,
        "created_at": now,
        "updated_at": now,
        "error": None,
    }

    asyncio.create_task(_run_job(job_id, request))
    return {"job_id": job_id, "status": "queued"}


@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str) -> Dict[str, Any]:
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.post("/api/generate")
async def direct_generate(request: GenerationRequest) -> Dict[str, Any]:
    # Simple synchronous wrapper for compatibility with older clients.
    file_name = await asyncio.to_thread(
        generate_video_from_prompt,
        request.prompt,
        request.duration,
        request.aspect_ratio,
        request.provider,
    )
    return {"status": "success", "file_name": file_name}


@app.get("/")
async def root() -> FileResponse:
    html_path = Path("frontend/dist/index.html")
    if html_path.exists():
        return FileResponse(html_path)
    return FileResponse("templates/index.html")


@app.get("/assets/{file_name}")
async def assets(file_name: str):
    asset_path = Path("frontend/dist/assets") / file_name
    if asset_path.exists():
        return FileResponse(asset_path)
    raise HTTPException(status_code=404, detail="Asset not found")


@app.get("/download/{file_name}")
async def download_video(file_name: str):
    file_path = OUTPUT_DIR / file_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(path=str(file_path), media_type="video/mp4", filename=file_name)
