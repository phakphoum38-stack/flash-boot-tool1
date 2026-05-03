from fastapi import APIRouter
from backend.core.device_ai import classify_device, risk_score

router = APIRouter()

@router.get("/device-ai")
def device_ai(device: str):

    return {
        "device": device,
        "risk": classify_device(device),
        "score": risk_score(device)
    }
