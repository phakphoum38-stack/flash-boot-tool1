from fastapi import APIRouter
from backend.core.flash_queue import add_task

router = APIRouter()

@router.post("/flash-queue")
def flash_queue(req: dict):

    add_task(req["iso"], req["device"])

    return {
        "status": "queued"
    }
