import os
import subprocess
import uuid
from pathlib import Path

try:
    import replicate
except Exception:  # pragma: no cover
    replicate = None

OUTPUT_DIR = Path("output")
OUTPUT_DIR.mkdir(exist_ok=True)


def _safe_prompt(prompt: str) -> str:
    return prompt.replace("'", "\\'").replace("\n", " ").strip()


def _create_mock_video(prompt: str, duration: int = 5, aspect_ratio: str = "16:9", provider: str = "mock") -> str:
    width, height = {
        "16:9": (1280, 720),
        "1:1": (720, 720),
        "9:16": (720, 1280),
    }.get(aspect_ratio, (1280, 720))

    file_name = f"{uuid.uuid4()}.mp4"
    output_path = OUTPUT_DIR / file_name
    safe_prompt = _safe_prompt(prompt)[:180]

    filter_expr = (
        f"drawtext=text='{safe_prompt}':fontcolor=white:fontsize=42:"
        f"x=(w-text_w)/2:y=(h-text_h)/2"
    )

    ffmpeg_cmd = [
        "ffmpeg",
        "-y",
        "-f",
        "lavfi",
        "-i",
        f"color=c=0x111827:s={width}x{height}:d={duration}",
        "-vf",
        filter_expr,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        str(output_path),
    ]

    result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {result.stderr or result.stdout}")

    return file_name


def _generate_with_replicate(prompt: str, duration: int = 5, aspect_ratio: str = "16:9") -> str:
    token = os.getenv("REPLICATE_API_TOKEN")
    model = os.getenv("VIDEO_MODEL")

    if not token or not model:
        raise RuntimeError("REPLICATE_API_TOKEN and VIDEO_MODEL must be set in .env for real generation.")

    if replicate is None:
        raise RuntimeError("replicate package is not installed")

    client = replicate.Client(api_token=token)
    output = client.run(
        model,
        input={
            "prompt": prompt,
            "duration": duration,
            "aspect_ratio": aspect_ratio,
        },
    )

    if isinstance(output, (list, tuple)):
        output = output[0]

    if isinstance(output, str):
        if output.startswith("http://") or output.startswith("https://"):
            import httpx

            response = httpx.get(output, follow_redirects=True)
            response.raise_for_status()

            file_name = f"{uuid.uuid4()}.mp4"
            output_path = OUTPUT_DIR / file_name
            output_path.write_bytes(response.content)
            return file_name

        if os.path.exists(output):
            file_name = f"{uuid.uuid4()}.mp4"
            output_path = OUTPUT_DIR / file_name
            output_path.write_bytes(Path(output).read_bytes())
            return file_name

    if hasattr(output, "read"):
        file_name = f"{uuid.uuid4()}.mp4"
        output_path = OUTPUT_DIR / file_name
        output_path.write_bytes(output.read())
        return file_name

    raise RuntimeError(f"Unsupported output type from Replicate: {type(output)}")


def generate_video_from_prompt(prompt: str, duration: int = 5, aspect_ratio: str = "16:9", provider: str = "mock") -> str:
    provider_name = (provider or "mock").lower()

    if provider_name == "replicate":
        return _generate_with_replicate(prompt, duration=duration, aspect_ratio=aspect_ratio)

    if provider_name == "mock":
        return _create_mock_video(prompt, duration=duration, aspect_ratio=aspect_ratio, provider=provider_name)

    return _create_mock_video(prompt, duration=duration, aspect_ratio=aspect_ratio, provider="mock")
