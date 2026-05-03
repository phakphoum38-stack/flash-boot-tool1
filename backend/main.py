from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json
import traceback

# 🔒 import safe
try:
    from usb import list_usb
    from flasher import flash_iso
except Exception as e:
    print("IMPORT ERROR:", e)
    list_usb = lambda: []
    def flash_iso(a, b):
        yield {"error": "flash engine not loaded"}

app = FastAPI()


# ❤️ health check (สำคัญมากสำหรับ Electron)
@app.get("/")
def root():
    return {"status": "ok"}


# 💽 list USB
@app.get("/devices")
def devices():
    try:
        return list_usb()
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}


# 🔥 flash ISO → USB
@app.post("/flash")
def flash(data: dict):

    iso = data.get("iso")
    device = data.get("device")

    # 🛡 validation
    if not iso or not device:
        return {"error": "iso and device required"}

    def gen():
        try:
            for update in flash_iso(iso, device):
                yield json.dumps(update) + "\n"
        except Exception as e:
            traceback.print_exc()
            yield json.dumps({"error": str(e)}) + "\n"

    return StreamingResponse(gen(), media_type="application/x-ndjson")


# 🚀 run server
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info"
    )
