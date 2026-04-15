def get_voice_settings(emotion: str, intensity: float) -> dict:
    """Return voice settings for a single emotion + intensity scalar."""

    if emotion == "joy":
        return {
            "stability":        0.3,
            "similarity_boost": 0.8,
            "style":            min(1.0, 0.6 + 0.4 * intensity),
        }
    elif emotion == "excited":
        return {
            "stability":        0.2,
            "similarity_boost": 0.9,
            "style":            min(1.0, 0.8 + 0.2 * intensity),
        }
    elif emotion == "sad":
        return {
            "stability":        0.7,
            "similarity_boost": 0.5,
            "style":            0.2,
        }
    elif emotion == "anger":
        return {
            "stability":        0.8,
            "similarity_boost": 0.4,
            "style":            min(1.0, 0.3 + 0.3 * intensity),
        }
    elif emotion == "fear":
        return {
            "stability":        0.6,
            "similarity_boost": 0.5,
            "style":            0.2,
        }
    elif emotion == "curious":
        return {
            "stability":        0.5,
            "similarity_boost": 0.7,
            "style":            0.5,
        }
    elif emotion == "frustrated":
        return {
            "stability":        0.65,
            "similarity_boost": 0.5,
            "style":            min(1.0, 0.35 + 0.2 * intensity),
        }
    else:  # neutral
        return {
            "stability":        0.5,
            "similarity_boost": 0.6,
            "style":            0.3,
        }


def get_blended_voice_settings(weights: dict) -> dict:
    """
    Linearly blend voice settings across multiple emotions.

    Args:
        weights: dict of {emotion_key: normalised_weight}
                 e.g. {"joy": 0.67, "sad": 0.33}

    Returns:
        Blended dict with stability / similarity_boost / style,
        each clamped to [0.0, 1.0].
    """
    blended = {"stability": 0.0, "similarity_boost": 0.0, "style": 0.0}

    for emotion, weight in weights.items():
        # Use intensity = weight so more dominant emotion drives style harder
        s = get_voice_settings(emotion, intensity=weight)
        blended["stability"]        += weight * s["stability"]
        blended["similarity_boost"] += weight * s["similarity_boost"]
        blended["style"]            += weight * s["style"]

    # Clamp each value to valid ElevenLabs range [0, 1]
    for k in blended:
        blended[k] = round(min(1.0, max(0.0, blended[k])), 4)

    print(f"[Empathy Engine] Blended voice settings: {blended}")
    return blended


def get_voice_id(emotion: str) -> str:
    """Fallback voice mapping (used only when user has not selected a voice)."""
    if emotion in ["joy", "excited"]:
        return "FGY2WhTYpPnrIDTdsKH5"   # Laura
    elif emotion in ["sad", "fear"]:
        return "VR6AewLTigWG4xSOukaG"   # River
    elif emotion == "anger":
        return "ErXwobaYiN019PkySvjV"   # Antoni
    elif emotion == "curious":
        return "TxGEqnHWrfWFTfGW9XjX"   # Josh
    else:
        return "JBFqnCBsd6RMkjVDRZzb"   # George