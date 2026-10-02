# AI Video Generator

A minimal AI video generator app with:
- FastAPI backend
- Simple HTML/JS frontend
- mock video generation mode that works without an API key
- optional Replicate integration for real AI generation

## Features
- Enter a prompt
- Generate a video
- Download the result
- Works without external API services by default

## Quick start

1. Create and activate a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Copy environment variables

```bash
cp .env.example .env
```

4. Start the app

```bash
uvicorn app:app --reload
```

Open http://localhost:8000 in your browser.

## Optional real AI generation

If you want true AI-generated video instead of the built-in demo mode, add your token and model in `.env`:

```env
REPLICATE_API_TOKEN=your_token_here
VIDEO_MODEL=genmo/mochi-1-preview
```

Then restart the app.

## Mock mode

Without a Replicate token, the app creates a demo MP4 using ffmpeg with the prompt overlaid on a color background. This lets the app run locally even without GPU access.

## FFmpeg requirement

Mock mode requires `ffmpeg` to be installed:

- macOS: `brew install ffmpeg`
- Ubuntu/Debian: `sudo apt install ffmpeg`
- Windows: install from https://www.ffmpeg.org/download.html

## Project layout

```text
ai-video-generator/
├── app.py
├── requirements.txt
├── .env.example
├── .env
├── README.md
├── services/
│   └── video_service.py
├── templates/
│   └── index.html
└── output/
```
