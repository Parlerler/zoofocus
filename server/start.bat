@echo off

echo Starting Ollama...
start /b ollama serve

echo Starting FastAPI...
uv run uvicorn main:app --reload --port 8000