from fastapi import APIRouter
from backend.core.verify_engine import verify_flash

router = APIRouter()

@router.post("/verify")
def verify(data: dict):
    result = verify_flash(data["iso"], data["device"])
    return result
