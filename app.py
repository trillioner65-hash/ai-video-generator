from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path

from services.video_service import generate_video_from_prompt

app = FastAPI(title="AI Video Generator")

OUTPUT_DIR = Path("output")
OUTPUT_DIR.mkdir(exist_ok=True)


class GenerateRequest(BaseModel):
    prompt: str
    duration: int = 5
    aspect_ratio: str = "16:9"


@app.get("/")
async def index():
    return FileResponse("templates/index.html")


@app.post("/generate")
async def generate_video(request: GenerateRequest):
    prompt = request.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    try:
        file_name = generate_video_from_prompt(
            prompt=prompt,
            duration=request.duration,
            aspect_ratio=request.aspect_ratio,
        )
        return {"status": "success", "file_name": file_name}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/download/{file_name}")
async def download_video(file_name: str):
    file_path = OUTPUT_DIR / file_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")

    return FileResponse(
        path=str(file_path),
        media_type="video/mp4",
        filename=file_name,
    )
