# AI Video Generator

A full-stack AI video generation starter with:
- FastAPI backend
- React frontend
- async job queue
- mock generation mode for local development
- optional real text-to-video generation via Replicate

## Overview

This project demonstrates a realistic AI video app workflow:
- user enters a prompt
- the frontend submits a generation request
- the backend queues the job and processes it asynchronously
- the frontend polls for status and downloads the finished video

## Tech stack

- Backend: FastAPI + Python
- Frontend: React + Vite
- Video generation: mock ffmpeg mode or Replicate API
- Storage: local disk under `output/`

## Project layout

```text
ai-video-generator/
├── app.py
├── requirements.txt
├── .env.example
├── README.md
├── services/
│   └── video_service.py
├── templates/
│   └── index.html
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── output/
└── .venv/
```

## Quick start

### 1) Python backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app:app --reload
```

### 2) React frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

Open the frontend in the browser at:
```text
http://localhost:5173
```

The backend is available at:
```text
http://localhost:8000
```

## Environment variables

```env
REPLICATE_API_TOKEN=
VIDEO_MODEL=genmo/mochi-1-preview
```

If no token is set, the app falls back to mock generation.

## Mock mode requirements

The mock generator uses ffmpeg, so you need `ffmpeg` installed:

- macOS: `brew install ffmpeg`
- Ubuntu/Debian: `sudo apt install ffmpeg`
- Windows: install from https://www.ffmpeg.org/download.html

## API endpoints

- `POST /api/jobs` creates a generation job
- `GET /api/jobs/{job_id}` checks the job status
- `POST /api/generate` runs a direct generation request
- `GET /download/{file_name}` downloads the generated video

## Example request

```bash
curl -X POST http://localhost:8000/api/jobs \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "a cinematic neon city at night",
    "duration": 5,
    "aspect_ratio": "16:9",
    "provider": "mock"
  }'
```

## Notes

This project is a strong starter for a real AI video SaaS, but you will still need:
- user authentication
- storage and object uploads
- a queue/worker service like Celery or Redis in production
- GPU-backed generation providers for real commercial outputs
- moderation and rate limiting
