from transformers import pipeline

# ── Model (loaded once at startup) ────────────────────────────────────────────
_classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None,          # return ALL class scores
)

# Maps model labels → internal emotion keys
_LABEL_MAP = {
    "joy":      "joy",
    "sadness":  "sad",
    "anger":    "anger",
    "fear":     "fear",
    "surprise": "excited",
    "disgust":  "frustrated",
    "neutral":  "neutral",
}


def detect_emotion_with_intensity(text: str) -> dict:
    """
    Detect up to 2 emotions and return a blended emotion profile.

    Returns a dict:
    {
        "primary_emotion":   "joy",
        "secondary_emotion": "sad",          # or None if only 1 significant emotion
        "weights": {"joy": 0.67, "sad": 0.33},
        "intensity": 0.67,                   # primary emotion's normalised weight
        # ── backwards-compat fields ──
        "emotion":   "joy",
        "raw_scores": {"joy": 0.6, "sad": 0.3, ...}
    }
    """
    raw = _classifier(text)[0]           # list of {"label": ..., "score": ...}

    # Sort descending by score
    raw_sorted = sorted(raw, key=lambda x: x["score"], reverse=True)

    # Map to internal keys and collect all scores
    mapped = []
    for item in raw_sorted:
        key = _LABEL_MAP.get(item["label"], "neutral")
        mapped.append((key, item["score"]))

    raw_scores = {k: v for k, v in mapped}

    # ── Pick top-2 ────────────────────────────────────────────────────────────
    top2 = mapped[:2]

    primary_label,   primary_score   = top2[0]
    secondary_label, secondary_score = top2[1] if len(top2) > 1 else (None, 0.0)

    # Threshold: only include secondary if it has ≥15% of the primary score
    if secondary_label and secondary_score < primary_score * 0.15:
        secondary_label = None
        secondary_score = 0.0

    # ── Normalise weights ─────────────────────────────────────────────────────
    total = primary_score + secondary_score

    if total == 0:
        total = 1.0   # safeguard

    w_primary   = round(primary_score   / total, 4)
    w_secondary = round(secondary_score / total, 4) if secondary_label else 0.0

    weights = {primary_label: w_primary}
    if secondary_label:
        weights[secondary_label] = w_secondary

    print(
        f"[Empathy Engine] Emotions → primary={primary_label}({w_primary:.0%})"
        + (f"  secondary={secondary_label}({w_secondary:.0%})" if secondary_label else "")
    )

    return {
        "primary_emotion":   primary_label,
        "secondary_emotion": secondary_label,
        "weights":           weights,
        "intensity":         w_primary,          # dominant weight used for voice settings
        # backwards-compat so old callers still work
        "emotion":           primary_label,
        "raw_scores":        raw_scores,
    }