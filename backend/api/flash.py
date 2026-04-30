from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import json

from backend.core.flash_engine import flash_image
from backend.core.safety import validate_iso, validate_device

router = APIRouter()

@router.post("/flash")
def flash(data: dict):

    validate_iso(data["iso"])
    validate_device(data["device"])

    def gen():
        for step in flash_image(data["iso"], data["device"]):
            yield json.dumps(step) + "\n"

    return StreamingResponse(gen(), media_type="application/x-ndjson")
