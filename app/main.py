from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes.speech import router as speech_router
import os

# ── Paths ──────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))   # .../app
ROOT_DIR = os.path.dirname(BASE_DIR)                    # project root
OUTPUT_DIR = os.path.join(ROOT_DIR, "output")

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)
print(f"[Empathy Engine] Serving static files from: {OUTPUT_DIR}")

# ── App ────────────────────────────────────────────────
app = FastAPI(title="Empathy Engine")

# Allow browser requests from any origin (needed for audio playback)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated audio files at /output/<filename>
app.mount(
    "/output",
    StaticFiles(directory=OUTPUT_DIR),
    name="output",
)

app.include_router(speech_router)