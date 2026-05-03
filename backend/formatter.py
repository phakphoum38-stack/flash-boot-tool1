@app.post("/auto-partition")
def auto_partition(data: dict):
    try:
        device = data.get("device")
        iso = data.get("iso")

        disk_num = device.replace("\\\\.\\PHYSICALDRIVE", "")

        mode = detect_boot_mode(iso)

        # 🔥 เลือก scheme
        if mode == "UEFI":
            scheme = "GPT"
            script = f"""
select disk {disk_num}
clean
convert gpt
create partition primary
format fs=fat32 quick
assign
exit
"""
        else:
            scheme = "MBR"
            script = f"""
select disk {disk_num}
clean
convert mbr
create partition primary
active
format fs=ntfs quick
assign
exit
"""

        with open("diskpart.txt", "w") as f:
            f.write(script)

        subprocess.run(["diskpart", "/s", "diskpart.txt"], check=True)

        return {
            "mode": mode,
            "scheme": scheme,
            "status": "partitioned"
        }

    except Exception as e:
        return {"error": str(e)}
