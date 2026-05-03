from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import traceback

# 🔒 safe import (กัน exe พัง)
try:
    from usb import list_usb
    from flasher import flash_iso
except Exception as e:
    print("IMPORT ERROR:", e)
    list_usb = lambda: []

    def flash_iso(a, b):
        yield {"error": "flash engine not loaded"}

app = FastAPI(title="Flash Boot Tool API")


# =========================
# 📦 REQUEST MODEL
# =========================
class FlashRequest(BaseModel):
    iso: str
    device: str


# =========================
# ❤️ HEALTH CHECK
# =========================
@app.get("/")
def root():
    return {"status": "ok"}


# =========================
# 💽 LIST USB DEVICES
# =========================
@app.get("/devices")
def devices():
    try:
        return list_usb()
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}


# =========================
# 🔥 FLASH (STREAM REALTIME)
# =========================
@app.post("/flash")
def flash(data: FlashRequest):

    iso = data.iso
    device = data.device

    # 🛡 validation
    if not iso or not device:
        return {"error": "iso and device required"}

    def gen():
        try:
            for update in flash_iso(iso, device):
                yield json.dumps({
                    "type": "progress",
                    "data": update
                }) + "\n"

            yield json.dumps({
                "type": "done"
            }) + "\n"

        except Exception as e:
            traceback.print_exc()
            yield json.dumps({
                "type": "error",
                "message": str(e)
            }) + "\n"

    return StreamingResponse(
        gen(),
        media_type="application/x-ndjson"
    )


# =========================
# 🚀 RUN SERVER
# =========================
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info"
    )
