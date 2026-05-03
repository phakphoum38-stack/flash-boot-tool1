from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from backend.core.rufus_engine import flash_image_rufus

router = APIRouter()


@router.post("/flash")
async def flash(req: Request):

    body = await req.json()

    iso = body.get("iso")
    device = body.get("device")

    def stream():
        for update in flash_image_rufus(iso, device):
            yield (str(update) + "\n")

    return StreamingResponse(stream(), media_type="text/plain")
