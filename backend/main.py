from fastapi import FastAPI
from backend.api.flash import router as flash_router
from backend.api.verify import router as verify_router
from backend.api.boot import router as boot_router
from backend.api.devices import router as devices_router

app = FastAPI(title="Flash Boot Tool")

app.include_router(flash_router)
app.include_router(verify_router)
app.include_router(boot_router)
app.include_router(devices_router)

@app.get("/")
def root():
    return {"status": "production-ready"}
