from fastapi import APIRouter
from backend.core.rufus_engine import write_image_rufus_style
from backend.core.safety import verify_device

router = APIRouter()

@router.post("/flash")
def flash(req: dict):

    iso = req["iso"]
    device = req["device"]

    verify_device(device)

    def stream():
        for p in write_image_rufus_style(iso, device):
            yield (json.dumps(p) + "\n")

    return stream()
