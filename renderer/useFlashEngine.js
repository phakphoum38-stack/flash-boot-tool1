import { useEffect, useRef, useState } from 'react'
import { State } from './stateMachine'

export function useFlashEngine() {

  const [state, setState] = useState(State.IDLE)
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [logs, setLogs] = useState([])

  const buffer = useRef([])

  useEffect(() => {

    window.api.onFlash((event) => {

      buffer.current.push(event)
    })

    const loop = setInterval(() => {

      const events = buffer.current.splice(0)

      for (const e of events) {

        if (e.type === 'progress') setProgress(e.value)
        if (e.type === 'speed') setSpeed(e.value)
        if (e.type === 'log') setLogs(p => [...p, e.msg])
        if (e.type === 'result') setState(e.success ? State.DONE : State.ERROR)
      }

    }, 16)

    return () => clearInterval(loop)

  }, [])

  return { state, progress, speed, logs }
}
