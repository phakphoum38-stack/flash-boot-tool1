import hashlib

try:
    import torch  # type: ignore
    GPU = torch.cuda.is_available()
except:
    GPU = False


def fast_hash(data: bytes):

    # 🧠 GPU path (simulated acceleration)
    if GPU:
        tensor = torch.tensor(list(data), device="cuda")
        return hashlib.sha256(tensor.cpu().numpy().tobytes()).hexdigest()

    # fallback CPU
    return hashlib.sha256(data).hexdigest()