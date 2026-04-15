# Empathy Engine: Emotion-Aware Speech Synthesis System

## 1. Overview

Empathy Engine is an AI-based system that converts text into emotionally expressive speech. Traditional text-to-speech systems often produce monotonic and emotionally flat output. This project addresses that limitation by dynamically modulating vocal characteristics based on the emotional content of the input text.

The system integrates transformer-based emotion detection with a parameter-driven speech synthesis pipeline to generate audio that reflects both the type and intensity of emotions present in the text.

---

## 2. Key Features

* Transformer-based emotion detection
* Multi-emotion handling (primary and secondary emotions)
* Dynamic modulation of speech parameters
* High-quality speech generation using ElevenLabs
* Web-based interface for interaction and playback

---

## 3. Project Structure

```bash
empathy-engine/
│
├── app/
│   ├── main.py
│   ├── routes/
│   │   └── speech.py
│   ├── services/
│   │   ├── emotion.py
│   │   ├── voice_mapper.py
│   │   └── tts.py
│
├── output/
├
│── index.html
│── style.css
│── script.js
│
├── requirements.txt
├── .env
└── README.md
```

---

## 4. Setup and Execution

### 4.1 Clone the Repository

```bash
git clone <repository-url>
cd empathy-engine
```

---

### 4.2 Create a Virtual Environment

```bash
python -m venv venv
```

Activate:

* Windows:

```bash
venv\Scripts\activate
```

* macOS/Linux:

```bash
source venv/bin/activate
```

---

### 4.3 Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 4.4 Configure Environment Variables

Create a `.env` file:

```env
ELEVENLABS_API_KEY=your_api_key_here
```

---

### 4.5 Run Backend

```bash
python run.py
```

API runs at:

```
http://127.0.0.1:8000
```

---

### 4.6 Serve Audio Files

Ensure this configuration exists in `main.py`:

```python
from fastapi.staticfiles import StaticFiles
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)

app.mount(
    "/output",
    StaticFiles(directory=os.path.join(ROOT_DIR, "output")),
    name="output"
)
```

---

### 4.7 Run Frontend

Open:

```
frontend/index.html
```

---

## 5. API Endpoints

### 5.1 Generate Emotional Speech

**Endpoint:**

```
POST /speak
```

**Query Parameters:**

| Parameter | Type   | Description                            |
| --------- | ------ | -------------------------------------- |
| text      | string | Input text to be converted into speech |
| voice_id  | string | Selected voice identifier              |

---

**Example Request:**

```
POST http://127.0.0.1:8000/speak?text=I am happy but nervous&voice_id=EXAVITQu4vr4xnSDxMaL
```

---

**Response Format:**

```json
{
  "emotion": "joy",
  "secondary_emotion": "fear",
  "intensity": 0.65,
  "file": "output/joy_0.65.mp3"
}
```

---

**Response Fields:**

| Field             | Description                       |
| ----------------- | --------------------------------- |
| emotion           | Primary detected emotion          |
| secondary_emotion | Secondary emotion (if applicable) |
| intensity         | Normalized intensity score (0–1)  |
| file              | Path to generated audio file      |

---

### 5.2 Audio Retrieval

Generated audio files are accessible via:

```
GET /output/{filename}
```

**Example:**

```
http://127.0.0.1:8000/output/joy_0.65.mp3
```

---

## 6. Usage

1. Enter input text
2. Submit request
3. System performs:

   * Emotion detection
   * Intensity computation
   * Voice parameter mapping
   * Speech generation
4. Output includes:

   * Emotion labels
   * Intensity visualization
   * Playable audio

---

## 7. Design Choices

### 7.1 Emotion Detection

Uses transformer model:

```
j-hartmann/emotion-english-distilroberta-base
```

This enables multi-class emotion classification with high accuracy.

---

### 7.2 Multi-Emotion Handling

Steps:

1. Extract all emotion scores
2. Select top 2
3. Normalize weights

Example:

```
joy: 0.6
sadness: 0.3

→ normalized:
joy: 0.67
sadness: 0.33
```

---

## 8. Emotion-to-Voice Mapping Logic

A deterministic mapping is defined to convert detected emotions into specific vocal parameter configurations.

---

### 8.1 Parameters

* Stability (S): controls variation vs steadiness
* Similarity Boost (B): preserves voice identity
* Style (T): controls expressiveness

---

### 8.2 Base Mapping

| Emotion  | Stability (S) | Similarity (B) | Style (T) |
| -------- | ------------- | -------------- | --------- |
| Joy      | 0.4           | 0.8            | 0.8       |
| Sadness  | 0.7           | 0.5            | 0.3       |
| Anger    | 0.8           | 0.5            | 0.4       |
| Fear     | 0.6           | 0.5            | 0.3       |
| Surprise | 0.4           | 0.8            | 0.9       |
| Neutral  | 0.5           | 0.6            | 0.3       |

---

### 8.3 Intensity Scaling

Each emotion has intensity ( I \in [0,1] ):

```
P_adjusted = P_base + (I × ΔP)
```

---

### 8.4 Multi-Emotion Blending

For two emotions:

```
P_final = (w1 × P(E1)) + (w2 × P(E2))
```

---

### 8.5 Key Principle

Voice identity is user-selected and remains constant.
Emotion influences only the vocal parameters, ensuring expressive yet consistent output.

---

## 9. Conclusion

Empathy Engine demonstrates how AI can produce emotionally expressive speech by combining transformer-based understanding with parameter-driven synthesis.

---
