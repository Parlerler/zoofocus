from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from models import AVAILABLE_MODELS
import ollama

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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