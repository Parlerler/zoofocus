import httpx
import json

OLLAMA_BASE = "http://localhost:11434"

async def get_installed_models():
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{OLLAMA_BASE}/api/tags")
        r.raise_for_status()
        data = r.json()
        return [m["name"] for m in data.get("models", [])]
    
async def stream_download(model_id: str):
    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream(
            "POST",
            f"{OLLAMA_BASE}/api/pull",
            json={"name": model_id}
        ) as r:
            async for line in r.aiter_lines():
                if line:
                    yield f"data: {line}\n\n"

async def stream_chat(model: str, messages: list):
    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream(
            "POST",
            f"{OLLAMA_BASE}/api/chat",
            json={"model": model, "messages": messages, "stream": True}
        ) as r:
            async for line in r.aiter_lines():
                if line:
                    data = json.loads(line)
                    token = data.get("message", {}).get("content", "")
                    done = data.get("done", False)
                    if token:
                        yield f"data: {json.dumps({'token': token, 'done': done})}\n\n"