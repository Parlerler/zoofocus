from fastapi import FastAPI, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from models import AVAILABLE_MODELS
import ollama
import io
import asyncio
import scipy.io.wavfile
from pocket_tts import TTSModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pocket TTS — loaded once at startup ────────────────────────────────────
tts_model: TTSModel | None = None

@app.on_event("startup")
def load_tts():
    global tts_model
    tts_model = TTSModel.load_model()

# ─── Existing endpoints ──────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    model: str
    messages: list[dict]

@app.get("/api/models/available")
def get_available_models():
    return AVAILABLE_MODELS

@app.get("/api/models/installed")
async def get_installed_models():
    try:
        return await ollama.get_installed_models()
    except Exception:
        raise HTTPException(status_code=503, detail="Ollama is not running")

@app.post("/api/models/download/{model_id:path}")
async def download_model(model_id: str):
    return StreamingResponse(
        ollama.stream_download(model_id),
        media_type="text/event-stream"
    )

@app.post("/api/chat")
async def chat(body: ChatRequest):
    return StreamingResponse(
        ollama.stream_chat(body.model, body.messages),
        media_type="text/event-stream"
    )

# ─── TTS endpoint ────────────────────────────────────────────────────────────

@app.post("/tts")
async def tts(text: str = Form(...), voice: str = Form("alba")):
    if not tts_model:
        raise HTTPException(status_code=503, detail="TTS model not loaded yet")
    if not text.strip():
        raise HTTPException(status_code=400, detail="text must not be empty")

    def generate() -> bytes:
        voice_state = tts_model.get_state_for_audio_prompt(voice)
        audio = tts_model.generate_audio(voice_state, text)
        buf = io.BytesIO()
        scipy.io.wavfile.write(buf, tts_model.sample_rate, audio.numpy())
        return buf.getvalue()

    # Run the CPU-heavy work in a thread so FastAPI stays responsive
    wav_bytes = await asyncio.get_event_loop().run_in_executor(None, generate)

    return StreamingResponse(io.BytesIO(wav_bytes), media_type="audio/wav")