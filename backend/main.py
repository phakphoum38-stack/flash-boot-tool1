from fastapi import FastAPI
from backend.api.flash import router as flash_router
from backend.api.devices import router as devices_router

app = FastAPI()

app.include_router(flash_router)
app.include_router(devices_router)

@app.get("/")
def root():
    return {
        "status": "production ready",
        "version": "1.0.0"
    }
