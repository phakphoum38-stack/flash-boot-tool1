from fastapi import FastAPI
import uvicorn
import sys

# นำเข้า core modules (มั่นใจว่าลบ backend. ออกแล้ว)
from core.write_engine import write_stream
from core.ai_safety import risk_analyze
from core.forensic_logger import log_event
from core.job_manager import add_job

# สร้าง Instance ของ FastAPI
app = FastAPI()

# =========================
# ✅ HEALTH CHECK (สำคัญมากสำหรับ Electron)
# =========================
@app.get("/health")
def health_check():
    return {"status": "ok"}

# =========================
# 🚨 FLASH ENDPOINT
# =========================
@app.post("/flash")
def flash(req: dict):
    # ป้องกัน Error ถ้า client ส่งค่ามาไม่ครบ
    device = req.get("device", "Unknown")
    image = req.get("iso", "Unknown")

    # 🧠 AI SAFETY CHECK
    check = risk_analyze(device)

    if not check.get("safe", False):
        return {
            "status": "blocked",
            "reason": "unsafe device",
            "risk": check
        }

    log_event({
        "event": "flash_queued",
        "device": device,
        "image": image
    })

    # Callback สำหรับจัดการ Log ระหว่างทำงาน
    def callback(event):
        log_event(event)
        # ไม่ใช้ print() เพราะไม่มี Terminal ให้โชว์
        pass 

    add_job({
        "device": device,
        "image": image,
        "callback": callback
    })

    return {
        "status": "queued",
        "device": device
    }

# =========================
# 🚀 RUN SERVER (PRODUCTION CONFIG)
# =========================
if __name__ == "__main__":
    # การตั้งค่า uvicorn เพื่อรองรับการรันแบบไม่มีหน้าต่าง (PyInstaller --windowed)
    uvicorn.run(
        app, 
        host="127.0.0.1", 
        port=8000, 
        log_config=None,  # 👈 สำคัญ: ปิดการใช้ Log config เดิมเพื่อเลี่ยง error isatty
        access_log=False, # 👈 ปิด access log เพื่อลดภาระการทำงาน
        workers=1         # 👈 Windows แนะนำให้ใช้ 1 worker สำหรับแอปไฟล์เดียว
    )