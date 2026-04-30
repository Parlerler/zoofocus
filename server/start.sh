#!/bin/bash

echo "Starting Ollama..."
ollama serve &

echo "Starting FastAPI..."
uv run uvicorn main:app --reload --port 8000