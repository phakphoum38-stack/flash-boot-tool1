const { spawn } = require('child_process')
let proc = null

let lastEmit = 0

function start(win, { mode, iso, device }) {

  return new Promise((resolve) => {

    proc = spawn('backend.exe', [mode, iso, device])

    proc.stdout.on('data', (data) => {

      const lines = data.toString().split('\n')

      for (const line of lines) {

        if (!line) continue

        // throttle 60fps
        const now = Date.now()
        if (now - lastEmit < 16) continue
        lastEmit = now

        if (line.startsWith('PROGRESS:')) {
          const v = +line.split(':')[1]

          win.webContents.send('flash:event', {
            type: 'progress',
            value: v
          })
        }

        if (line.startsWith('SPEED:')) {
          win.webContents.send('flash:event', {
            type: 'speed',
            value: +line.split(':')[1]
          })
        }

        if (line.startsWith('LOG:')) {
          win.webContents.send('flash:event', {
            type: 'log',
            msg: line.replace('LOG:', '')
          })
        }
      }
    })

    proc.on('close', (code) => {
      win.webContents.send('flash:event', {
        type: 'result',
        success: code === 0
      })

      resolve({ success: code === 0 })
    })
  })
}

function cancel() {
  if (proc) proc.kill()
  proc = null
}

module.exports = { start, cancel }
