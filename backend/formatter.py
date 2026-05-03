import subprocess

def format_usb(device, fs="fat32"):
    try:
        # ⚠️ device เช่น \\.\PHYSICALDRIVE1 → ต้อง map เป็น disk number
        disk_num = device.replace("\\\\.\\PHYSICALDRIVE", "")

        script = f"""
        select disk {disk_num}
        clean
        create partition primary
        format fs={fs} quick
        assign
        exit
        """

        with open("diskpart.txt", "w") as f:
            f.write(script)

        subprocess.run(["diskpart", "/s", "diskpart.txt"], check=True)

        return {"status": "formatted"}

    except Exception as e:
        return {"error": str(e)}
