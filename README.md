# Empathy Engine: Emotion-Aware Speech Synthesis System

## 1. Overview

Empathy Engine is an AI-based system that converts text into emotionally expressive speech. Traditional text-to-speech systems often produce monotonic and emotionally flat output. This project addresses that limitation by dynamically modulating vocal characteristics based on the emotional content of the input text.

The system integrates transformer-based emotion detection with a parameter-driven speech synthesis pipeline to generate audio that reflects both the type and intensity of emotions present in the text.

---

## 2. Key Features

* Transformer-based emotion detection using a pre-trained model
* Multi-emotion handling (primary and secondary emotions)
* Dynamic modulation of speech parameters
* High-quality speech generation using ElevenLabs
* Web-based interface for text input, emotion display, and audio playback

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

Activate the environment:

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

Create a `.env` file in the root directory:

```env
ELEVENLABS_API_KEY=your_api_key_here
```

---

### 4.5 Run the Backend Server

```bash
python run.py
```

The API will be available at:

```
http://127.0.0.1:8000
```

---

### 4.6 Serve Generated Audio Files

Ensure the following configuration exists in `main.py`:

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

### 4.7 Run the Frontend

Open the following file in a browser:

```
frontend/index.html
```

---

## 5. Usage

1. Enter input text in the interface
2. Submit the request
3. The system performs:

   * Emotion detection
   * Intensity estimation
   * Voice parameter modulation
   * Speech generation
4. The output includes:

   * Detected emotion(s)
   * Intensity visualization
   * Playable audio

---

## 6. Design Choices

### 6.1 Emotion Detection

The system uses a transformer-based model:

```
j-hartmann/emotion-english-distilroberta-base
```

This model provides classification across multiple emotional categories such as joy, sadness, anger, fear, surprise, and neutral, enabling more nuanced analysis than rule-based approaches.

---

### 6.2 Multi-Emotion Handling

Instead of relying on a single dominant emotion, the system:

1. Extracts scores for all emotions
2. Selects the top two emotions
3. Normalizes their scores to obtain weights

Example:

```
joy: 0.6
sadness: 0.3

Normalized:
joy: 0.67
sadness: 0.33
```

This allows the system to represent emotionally complex inputs.

---

## 7. Emotion-to-Voice Mapping Logic

A deterministic mapping is defined to translate detected emotions into specific configurations of vocal parameters.

### 7.1 Parameters

The system controls the following parameters:

* Stability (S): controls variation versus steadiness of speech
* Similarity Boost (B): preserves speaker identity
* Style (T): controls expressiveness

---

### 7.2 Base Parameter Configuration

Each emotion is associated with a predefined parameter set:

| Emotion  | Stability (S) | Similarity (B) | Style (T) |
| -------- | ------------- | -------------- | --------- |
| Joy      | 0.4           | 0.8            | 0.8       |
| Sadness  | 0.7           | 0.5            | 0.3       |
| Anger    | 0.8           | 0.5            | 0.4       |
| Fear     | 0.6           | 0.5            | 0.3       |
| Surprise | 0.4           | 0.8            | 0.9       |
| Neutral  | 0.5           | 0.6            | 0.3       |

---

### 7.3 Intensity-Based Adjustment

Each emotion is associated with an intensity score ( I \in [0,1] ).

Parameters are adjusted using:

```
P_adjusted = P_base + (I × ΔP)
```

Where:

* ( P ) is a parameter (S, B, T)
* ( ΔP ) is a scaling factor

This ensures that stronger emotions produce more pronounced vocal changes.

---

### 7.4 Multi-Emotion Blending

For two dominant emotions ( E_1 ) and ( E_2 ) with weights ( w_1 ) and ( w_2 ):

```
P_final = (w1 × P(E1)) + (w2 × P(E2))
```

This produces a continuous and realistic emotional representation.

---

### 7.5 Example

Input:

```
"I am excited but also nervous"
```

Detected:

```
Joy: 0.65
Fear: 0.35
```

Computed:

```
Stability = (0.65 × 0.4) + (0.35 × 0.6)
Style     = (0.65 × 0.8) + (0.35 × 0.3)
```

---

### 7.6 Key Design Principle

Voice identity remains constant (user-selected), while emotional content modifies vocal behavior through parameter adjustments. This separation ensures consistency in speaker identity while enabling expressive variation.

---

## 8. Conclusion

Empathy Engine demonstrates how combining modern NLP techniques with parameter-driven speech synthesis can produce emotionally expressive and human-like audio output. The system moves beyond static TTS by incorporating emotional intelligence into voice generation.

---

