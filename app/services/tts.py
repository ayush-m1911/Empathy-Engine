from elevenlabs.client import ElevenLabs
from elevenlabs import VoiceSettings
from dotenv import load_dotenv
from app.services.voice_mapper import get_blended_voice_settings, get_voice_id
from app.services.emotion import detect_emotion_with_intensity
from app.services.ssml_generator import generate_ssml
import os

load_dotenv()

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))   # .../app/services
APP_DIR    = os.path.dirname(BASE_DIR)                    # .../app
ROOT_DIR   = os.path.dirname(APP_DIR)                     # project root
OUTPUT_DIR = os.path.join(ROOT_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))


def generate_speech(text: str, voice_id: str = None) -> dict:
    """
    Detect emotions, blend voice settings, synthesise speech with ElevenLabs.

    Args:
        text:     Input text.
        voice_id: ElevenLabs voice ID chosen by the user (overrides emotion mapping).

    Returns dict:
    {
        "emotion":           "joy",          # primary (backwards compat)
        "primary_emotion":   "joy",
        "secondary_emotion": "sad",          # or None
        "weights":           {"joy": 0.67, "sad": 0.33},
        "intensity":         0.67,
        "file":              "output/joy_0.67_EXAVIt.mp3",
        "voice_id":          "<active id>",
    }
    """
    # ── Emotion detection ─────────────────────────────────────────────────────
    emotion_data = detect_emotion_with_intensity(text)

    primary   = emotion_data["primary_emotion"]
    secondary = emotion_data["secondary_emotion"]
    weights   = emotion_data["weights"]
    intensity = emotion_data["intensity"]

    # ── Voice identity ────────────────────────────────────────────────────────
    if voice_id:
        active_voice_id = voice_id
        print(f"[Empathy Engine] Using user-selected voice: {active_voice_id}")
    else:
        active_voice_id = get_voice_id(primary)
        print(f"[Empathy Engine] Using emotion-mapped voice: {active_voice_id} ({primary})")

    # ── Blended voice settings ────────────────────────────────────────────────
    blended = get_blended_voice_settings(weights)

    voice_settings = VoiceSettings(
        stability=blended["stability"],
        similarity_boost=blended["similarity_boost"],
        style=blended["style"],
        use_speaker_boost=True,
    )

    # ── SSML generation (based on primary emotion) ────────────────────────────
    try:
        ssml_text = generate_ssml(text, primary, intensity)
        audio = client.text_to_speech.convert(
            text=ssml_text,
            voice_id=active_voice_id,
            model_id="eleven_multilingual_v2",
            voice_settings=voice_settings,
        )
    except Exception as e:
        print(f"[Empathy Engine] SSML failed, falling back to plain text: {e}")
        audio = client.text_to_speech.convert(
            text=text,
            voice_id=active_voice_id,
            model_id="eleven_multilingual_v2",
            voice_settings=voice_settings,
        )

    # ── Save file ─────────────────────────────────────────────────────────────
    voice_hint    = (voice_id[:6] if voice_id else "auto")
    sec_tag       = f"_{secondary}" if secondary else ""
    filename      = f"{primary}{sec_tag}_{intensity:.2f}_{voice_hint}.mp3"
    abs_file_path = os.path.join(OUTPUT_DIR, filename)
    rel_file_path = f"output/{filename}"

    with open(abs_file_path, "wb") as f:
        for chunk in audio:
            f.write(chunk)

    print(f"[Empathy Engine] Audio saved: {abs_file_path}")

    return {
        # backwards-compat
        "emotion":           primary,
        # new multi-emotion fields
        "primary_emotion":   primary,
        "secondary_emotion": secondary,
        "weights":           weights,
        "intensity":         intensity,
        "file":              rel_file_path,
        "voice_id":          active_voice_id,
    }