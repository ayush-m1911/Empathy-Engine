from fastapi import APIRouter
from typing import Optional
from app.services.tts import generate_speech

router = APIRouter()

@router.post("/speak")
def speak(text: str, voice_id: Optional[str] = None):
    """
    POST /speak?text=...&voice_id=...
    voice_id  ─ ElevenLabs voice ID (optional; uses default when omitted)
    Returns: { emotion, intensity, file, voice_id }
    """
    result = generate_speech(text, voice_id=voice_id)
    return result