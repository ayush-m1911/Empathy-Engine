/**
 * Empathy Engine – script.js
 * Handles: API calls, emotion display, intensity animation, audio playback, error handling
 */

'use strict';

/* ── Constants ── */
const API_BASE = 'http://127.0.0.1:8000';
const SPEAK_PATH = '/speak';
const MAX_CHARS = 500;

const EMOTION_MAP = {
  joy:      { emoji: '😄', label: 'Joy'      },
  sad:      { emoji: '😢', label: 'Sad'      },
  sadness:  { emoji: '😢', label: 'Sadness'  },
  anger:    { emoji: '😠', label: 'Anger'    },
  angry:    { emoji: '😠', label: 'Angry'    },
  fear:     { emoji: '😨', label: 'Fear'     },
  scared:   { emoji: '😨', label: 'Scared'   },
  excited:  { emoji: '🤩', label: 'Excited'  },
  happy:    { emoji: '😊', label: 'Happy'    },
  neutral:  { emoji: '😐', label: 'Neutral'  },
  surprise: { emoji: '😲', label: 'Surprise' },
  disgust:  { emoji: '🤢', label: 'Disgust'  },
};

/* ── Voice Catalog ── */
const VOICE_CATALOG = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah',   description: 'Warm, soft American female',   gender: 'female'  },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura',   description: 'Upbeat, expressive female',     gender: 'female'  },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice',   description: 'Confident British female',      gender: 'female'  },
  { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River',   description: 'Calm neutral voice',            gender: 'neutral' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George',  description: 'Authoritative British male',    gender: 'male'    },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum',  description: 'Gritty intense male',           gender: 'male'    },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel',  description: 'Deep newsreader voice',         gender: 'male'    },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam',    description: 'Neutral narrator',              gender: 'male'    },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger',   description: 'Confident mature male',         gender: 'male'    },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam',    description: 'Persuasive young male',         gender: 'male'    },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian',   description: 'Deep gravelly voice',           gender: 'male'    },
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris',   description: 'Friendly casual male',          gender: 'male'    },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill',    description: 'Trustworthy calm male',         gender: 'male'    },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', description: 'Australian casual voice',       gender: 'male'    },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold',  description: 'Strong accent voice',           gender: 'male'    },
];

/* ── DOM References ── */
const userTextEl    = document.getElementById('userText');
const charCountEl   = document.getElementById('charCount');
const charCounter   = userTextEl.parentElement.querySelector('.char-counter');
const submitBtn     = document.getElementById('submitBtn');
const btnText       = submitBtn.querySelector('.btn-text');
const btnIcon       = submitBtn.querySelector('.btn-icon');
const spinner       = document.getElementById('spinner');

const resultCard     = document.getElementById('resultCard');
const emotionDisplay = document.getElementById('emotionDisplay');
const emotionEmoji   = document.getElementById('emotionEmoji');
const emotionName    = document.getElementById('emotionName');
const intensityFill  = document.getElementById('intensityFill');
const intensityValue = document.getElementById('intensityValue');
const intensityBar   = document.getElementById('intensityBar');
const audioPlayer    = document.getElementById('audioPlayer');

const errorToast   = document.getElementById('errorToast');
const errorMessage = document.getElementById('errorMessage');
const closeError   = document.getElementById('closeError');

// Voice selector DOM refs
const voiceGrid          = document.getElementById('voiceGrid');
const voiceSelectedBadge = document.getElementById('voiceSelectedBadge');
const resultVoiceTag     = document.getElementById('resultVoiceTag');

// Secondary emotion DOM refs
const emotionSecondary = document.getElementById('emotionSecondary');
const secondaryEmoji   = document.getElementById('secondaryEmoji');
const secondaryName    = document.getElementById('secondaryName');
const secondaryPct     = document.getElementById('secondaryPct');
const emotionPct       = document.getElementById('emotionPct');

/* ════════════════════════════════════════════
   VOICE SELECTION
════════════════════════════════════════════ */

/** Currently selected voice object — default: Sarah */
let selectedVoice = VOICE_CATALOG[0];

/**
 * Build the voice selection grid from VOICE_CATALOG.
 * Called once on init.
 */
function buildVoiceGrid() {
  voiceGrid.innerHTML = '';

  VOICE_CATALOG.forEach((voice) => {
    const item = document.createElement('div');
    item.className = 'voice-item' + (voice.id === selectedVoice.id ? ' selected' : '');
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', voice.id === selectedVoice.id ? 'true' : 'false');
    item.setAttribute('data-voice-id', voice.id);
    item.title = voice.description;

    item.innerHTML = `
      <span class="voice-name">${voice.name}</span>
      <span class="voice-desc">${voice.description}</span>
      <span class="voice-gender ${voice.gender}">${voice.gender}</span>
    `;

    item.addEventListener('click', () => selectVoice(voice, item));
    voiceGrid.appendChild(item);
  });
}

/**
 * Mark a voice as selected, update badges.
 * @param {object} voice - entry from VOICE_CATALOG
 * @param {HTMLElement} el - the clicked .voice-item
 */
function selectVoice(voice, el) {
  if (selectedVoice.id === voice.id) return; // already selected

  // Deselect old
  const prev = voiceGrid.querySelector('.voice-item.selected');
  if (prev) {
    prev.classList.remove('selected');
    prev.setAttribute('aria-selected', 'false');
  }

  // Select new
  el.classList.add('selected');
  el.setAttribute('aria-selected', 'true');
  selectedVoice = voice;

  // Update header badge
  voiceSelectedBadge.textContent = voice.name;

  // Scroll into view if clipped
  el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

  console.log(`[Empathy Engine] Voice selected: ${voice.name} (${voice.id})`);
}

/* ══════════════════════════════════════════
   CHARACTER COUNTER
══════════════════════════════════════════ */
userTextEl.addEventListener('input', () => {
  const len = userTextEl.value.length;
  charCountEl.textContent = len;

  charCounter.classList.remove('warn', 'limit');
  if (len >= MAX_CHARS) {
    charCounter.classList.add('limit');
  } else if (len >= MAX_CHARS * 0.8) {
    charCounter.classList.add('warn');
  }
});

/* ══════════════════════════════════════════
   UI STATE HELPERS
══════════════════════════════════════════ */
function setLoadingState(isLoading) {
  submitBtn.disabled = isLoading;
  spinner.classList.toggle('active', isLoading);
  btnIcon.style.display = isLoading ? 'none' : 'inline';
  btnText.textContent = isLoading ? 'Generating...' : 'Generate Emotional Voice';
}

function showError(message) {
  errorMessage.textContent = message;
  errorToast.classList.remove('hidden');
  // auto-hide after 6s
  setTimeout(() => errorToast.classList.add('hidden'), 6000);
}

function hideError() {
  errorToast.classList.add('hidden');
}

function showResult() {
  resultCard.classList.remove('hidden');
  // re-trigger fade-in animation each time
  resultCard.classList.remove('fade-in');
  void resultCard.offsetWidth; // reflow
  resultCard.classList.add('fade-in');
}

/* ════════════════════════════════════════════════════
   RENDER EMOTION (primary + optional secondary)
════════════════════════════════════════════════════ */
function renderEmotion(primaryKey, secondaryKey, weights) {
  // ── Primary ──────────────────────────────────────────
  const pk   = (primaryKey || 'neutral').toLowerCase().trim();
  const pd   = EMOTION_MAP[pk] || { emoji: '🎭', label: primaryKey };
  const pPct = weights ? Math.round((weights[pk] ?? 1) * 100) : null;

  // Re-trigger emoji bounce
  emotionEmoji.style.animation = 'none';
  void emotionEmoji.offsetWidth;
  emotionEmoji.style.animation = '';

  emotionEmoji.textContent = pd.emoji;
  emotionName.textContent  = pd.label;
  emotionPct.textContent   = pPct !== null ? `${pPct}%` : '';

  // Base accent class on primary emotion
  emotionDisplay.className = 'emotion-display emotion-' + pk;

  // ── Secondary ─────────────────────────────────────────
  if (secondaryKey) {
    const sk   = secondaryKey.toLowerCase().trim();
    const sd   = EMOTION_MAP[sk] || { emoji: '🎭', label: secondaryKey };
    const sPct = weights ? Math.round((weights[sk] ?? 0) * 100) : null;

    secondaryEmoji.textContent = sd.emoji;
    secondaryName.textContent  = sd.label;
    secondaryPct.textContent   = sPct !== null ? `${sPct}%` : '';

    emotionSecondary.classList.remove('hidden');
    // Add secondary class for dual-gradient border styling
    emotionDisplay.classList.add('has-secondary', 'emotion-secondary-' + sk);
  } else {
    emotionSecondary.classList.add('hidden');
  }
}

/* ══════════════════════════════════════════
   RENDER INTENSITY
══════════════════════════════════════════ */
function renderIntensity(intensity) {
  const pct = Math.round(Math.min(Math.max(intensity, 0), 1) * 100);

  // Animate bar from 0 on each render
  intensityFill.style.width = '0%';
  void intensityFill.offsetWidth; // reflow
  intensityFill.style.width = pct + '%';

  intensityValue.textContent = pct + '%';
  intensityBar.setAttribute('aria-valuenow', pct);

  // Color shift based on intensity
  if (pct < 33) {
    intensityFill.style.background = 'linear-gradient(90deg, #64748b, #94a3b8)';
  } else if (pct < 66) {
    intensityFill.style.background = 'linear-gradient(90deg, #6366f1, #8b5cf6)';
  } else {
    intensityFill.style.background = 'linear-gradient(90deg, #8b5cf6, #ec4899, #f59e0b)';
  }
}

/* ══════════════════════════════════════════
   RENDER AUDIO
══════════════════════════════════════════ */
function renderAudio(filePath) {
  if (!filePath) return;

  // filePath = "output/joy_0.97.mp3"  →  strip leading slash if any
  const cleanPath = filePath.replace(/^\/+/, '');
  const audioUrl  = `${API_BASE}/${cleanPath}`;

  console.log('[Empathy Engine] Audio URL:', audioUrl);

  // Reset src first to force reload even if same file
  audioPlayer.src = '';
  audioPlayer.src = audioUrl;
  audioPlayer.load();

  audioPlayer.play().catch((err) => {
    // Autoplay blocked by browser – user can still press play
    console.info('[Empathy Engine] Autoplay blocked, press play manually.', err.message);
  });
}

/* ══════════════════════════════════════════
   MAIN API CALL
══════════════════════════════════════════ */
async function generateVoice() {
  const text = userTextEl.value.trim();

  // Validation
  if (!text) {
    showError('Please enter some text before generating a voice.');
    userTextEl.focus();
    return;
  }

  hideError();
  setLoadingState(true);
  resultCard.classList.add('hidden');

  try {
    // Include selected voice_id in request
    const endpoint =
      `${API_BASE}${SPEAK_PATH}` +
      `?text=${encodeURIComponent(text)}` +
      `&voice_id=${encodeURIComponent(selectedVoice.id)}`;

    console.log(`[Empathy Engine] Request → ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      let errMsg = `Server error: ${response.status} ${response.statusText}`;
      try {
        const errData = await response.json();
        if (errData.detail) errMsg = errData.detail;
      } catch (_) { /* ignore */ }
      throw new Error(errMsg);
    }

    const data = await response.json();
    console.log('[Empathy Engine] API response:', data);

    /**
     * Expected shape (multi-emotion):
     * {
     *   emotion:           "joy",
     *   primary_emotion:   "joy",
     *   secondary_emotion: "sad",    // or null
     *   weights:           { joy: 0.67, sad: 0.33 },
     *   intensity:         0.67,
     *   file:              "output/joy_sad_0.67_EXAVIt.mp3",
     * }
     */
    if (!data.emotion) throw new Error('Invalid response: missing emotion field.');

    renderEmotion(
      data.primary_emotion   || data.emotion,
      data.secondary_emotion || null,
      data.weights           || null,
    );
    renderIntensity(data.intensity ?? 0);
    renderAudio(data.file);

    // Update the voice tag in the result card
    if (resultVoiceTag) {
      resultVoiceTag.textContent = `🎤 ${selectedVoice.name}`;
    }

    showResult();


  } catch (err) {
    console.error('[Empathy Engine]', err);

    let friendlyMsg = 'Something went wrong. Please try again.';
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      friendlyMsg = 'Cannot reach the backend. Make sure the server is running at ' + API_BASE;
    } else if (err.message) {
      friendlyMsg = err.message;
    }

    showError(friendlyMsg);
  } finally {
    setLoadingState(false);
  }
}

/* ══════════════════════════════════════════
   EVENT LISTENERS
══════════════════════════════════════════ */

// Submit button click
submitBtn.addEventListener('click', generateVoice);

// Allow Ctrl+Enter to submit
userTextEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    generateVoice();
  }
});

// Close error toast
closeError.addEventListener('click', hideError);

// Textarea auto-grow (optional UX polish)
userTextEl.addEventListener('input', () => {
  userTextEl.style.height = 'auto';
  userTextEl.style.height = userTextEl.scrollHeight + 'px';
});

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
(function init() {
  // Build voice selection grid
  buildVoiceGrid();

  // Apply initial char count
  charCountEl.textContent = 0;

  // Focus textarea on load
  userTextEl.focus();

  console.log('%c🧠 Empathy Engine UI loaded', 'color:#8b5cf6;font-weight:bold;font-size:14px;');
  console.log('%cBackend expected at: ' + API_BASE, 'color:#94a3b8;font-size:12px;');
  console.log('%cDefault voice: ' + selectedVoice.name + ' (' + selectedVoice.id + ')', 'color:#94a3b8;font-size:12px;');
})();
