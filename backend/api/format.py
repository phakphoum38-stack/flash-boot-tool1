from fastapi import APIRouter
from backend.core.format_engine import format_device

router = APIRouter()

@router.post("/format")
def format_api(data: dict):

    return format_device(
        data["device"],
        data.get("type", "fat32")
    )
