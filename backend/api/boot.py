from fastapi import APIRouter
from backend.core.boot_simulator import simulate_boot

router = APIRouter()

@router.post("/boot-test")
def boot_test(data: dict):
    return simulate_boot(data["iso"])
