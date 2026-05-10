import os
import psutil

class DiskAI:

    SYSTEM_HINTS = ["sda", "nvme0n1", "disk0", "c:"]

    @staticmethod
    def analyze(device):

        score = 0
        reasons = []

        # 🚨 system disk detection
        if any(x in device.lower() for x in DiskAI.SYSTEM_HINTS):
            score += 100
            reasons.append("system disk pattern match")

        # 💾 size heuristic
        try:
            usage = psutil.disk_usage(device)
            if usage.total > 500 * 1024**3:
                score += 20
                reasons.append("large primary disk")
        except:
            pass

        # ⚠ removable heuristic
        if "usb" in device.lower():
            score -= 30
            reasons.append("usb detected")

        return {
            "risk_score": score,
            "safe": score < 50,
            "reasons": reasons
        }