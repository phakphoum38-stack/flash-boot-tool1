import time

# 🧠 simple ML-like scoring (heuristic engine)

device_stats = {}

def register_device(device):
    if device not in device_stats:
        device_stats[device] = {
            "failures": 0,
            "success": 0,
            "avg_speed": 0,
            "last_error": None
        }


def update_success(device, speed):
    register_device(device)

    d = device_stats[device]
    d["success"] += 1
    d["avg_speed"] = (d["avg_speed"] + speed) / 2


def update_failure(device, error):
    register_device(device)

    d = device_stats[device]
    d["failures"] += 1
    d["last_error"] = error


# =========================
# 🧠 FAILURE RISK SCORE
# =========================
def risk_score(device):

    d = device_stats.get(device, None)
    if not d:
        return 0

    score = 0

    # ❌ failure weight
    score += d["failures"] * 40

    # ⚡ slow device risk
    if d["avg_speed"] < 5:
        score += 30

    # ❌ repeated errors
    if d["last_error"]:
        score += 20

    return min(score, 100)


def classify_device(device):

    score = risk_score(device)

    if score < 30:
        return "SAFE"
    elif score < 70:
        return "WARNING"
    else:
        return "HIGH_RISK"
