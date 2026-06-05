import { useFlashEngine } from './useFlashEngine'
import { useEffect, useState } from 'react'

export default function App() {

  const { progress, speed, logs } = useFlashEngine()

  const [usb, setUsb] = useState([])
  const [iso, setIso] = useState('')
  const [device, setDevice] = useState('')
  const [mode, setMode] = useState('dd')

  useEffect(() => {
    window.api.getUsb().then(setUsb)
  }, [])

  return (
    <div className="xp-win11">

      <h1>FLASH BOOT TOOL 2 — FINAL BOSS</h1>

      <select onChange={e => setDevice(e.target.value)}>
        <option>Select USB</option>
        {usb.map(u =>
          <option key={u.path} value={u.path}>
            {u.name}
          </option>
        )}
      </select>

      <button onClick={() => window.api.flashStart({
        mode,
        iso,
        device
      })}>
        START
      </button>

      <div>
        Progress: {progress}%
        Speed: {speed} MB/s
      </div>

      <div className="bar">
        <div style={{ width: progress + '%' }} />
      </div>

      <pre>
        {logs.join('\n')}
      </pre>

    </div>
  )
}
