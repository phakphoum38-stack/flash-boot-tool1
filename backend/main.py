from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json

from usb import list_usb
from flasher import flash_iso

app = FastAPI()


@app.get("/devices")
def devices():
    return list_usb()


@app.post("/flash")
def flash(data: dict):

    iso = data.get("iso")
    device = data.get("device")

    def gen():
        for update in flash_iso(iso, device):
            yield json.dumps(update) + "\n"

    return StreamingResponse(gen(), media_type="application/x-ndjson")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
