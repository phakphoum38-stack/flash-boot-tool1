ipcMain.handle("get-usb-devices", async () => {

  const { stdout } = await execPromise(`
powershell -NoProfile "
Get-CimInstance Win32_DiskDrive |
Where-Object {$_.InterfaceType -eq 'USB'} |
Select DeviceID, Model, Size |
ConvertTo-Json
"
  `)

  const data = JSON.parse(stdout || "[]")

  return (Array.isArray(data) ? data : [data]).map(d => ({
    path: d.DeviceID,
    name: d.Model,
    size: Number(d.Size || 0)
  }))
})
