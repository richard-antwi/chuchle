import Fastify from 'fastify'
import { Server } from 'socket.io'
import http from 'http'
import os from 'os'
import { BrowserWindow, ipcMain } from 'electron'

export class RemoteControllerService {
  private fastifyApp = Fastify()
  private io: Server | null = null
  private port = 3030
  private localIp = '127.0.0.1'
  private activeState: any = {
    currentLyrics: ['Welcome to Churchle'],
    theme: { textColor: '#ffffff' },
    activeBackground: { type: 'color', value: '#0a0f1d' }
  }

  constructor() {
    this.discoverLocalIp()
    this.setupServer()
  }

  private discoverLocalIp() {
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          this.localIp = net.address
          return
        }
      }
    }
  }

  public getLocalUrl(): string {
    return `http://${this.localIp}:${this.port}`
  }

  private setupServer() {
    this.fastifyApp.get('/', async (_request, reply) => {
      reply.type('text/html')
      return this.getRemoteHtml()
    })

    const server = http.createServer(this.fastifyApp.routing)
    this.io = new Server(server, {
      cors: { origin: '*' }
    })

    this.io.on('connection', (socket) => {
      socket.emit('state-sync', this.activeState)

      socket.on('slide-action', (action: 'next' | 'prev') => {
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send('remote-slide-action', action)
        })
      })
    })

    server.listen(this.port, '0.0.0.0', () => {
      console.log(`Web Remote server active at http://${this.localIp}:${this.port}`)
    })

    ipcMain.on('update-projection-state', (_event, state) => {
      this.activeState = state
      if (this.io) {
        this.io.emit('state-sync', state)
      }
    })
  }

  public close() {
    if (this.io) {
      this.io.close()
    }
    this.fastifyApp.close()
  }

  private getRemoteHtml(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Churchle Web Remote</title>
        <script src="/socket.io/socket.io.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body {
            background-color: #0b0f19;
            color: #f1f5f9;
            font-family: system-ui, -apple-system, sans-serif;
          }
        </style>
      </head>
      <body class="min-h-screen flex flex-col justify-between p-6">
        <header class="text-center pt-4">
          <h1 class="text-lg font-bold tracking-widest text-indigo-400">CHURCHLE REMOTE</h1>
          <p class="text-[10px] text-slate-500 mt-1 uppercase">Local Network Slide Fob</p>
        </header>

        <main class="flex-1 flex flex-col justify-center items-center my-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 text-center shadow-lg shadow-indigo-950/20">
          <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-4">NOW PROJECTING</span>
          <div id="lyrics-box" class="text-base sm:text-lg font-semibold leading-relaxed whitespace-pre-line text-slate-200">
            Welcome to Churchle
          </div>
        </main>

        <footer class="space-y-4 pb-6">
          <div class="flex gap-4">
            <button onclick="sendAction('prev')" class="flex-1 py-5 bg-slate-800 hover:bg-slate-750 active:bg-slate-850 border border-slate-700/50 transition duration-150 text-sm font-extrabold rounded-xl shadow-md select-none cursor-pointer">
              PREV
            </button>
            <button onclick="sendAction('next')" class="flex-1 py-5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition duration-150 text-sm font-extrabold rounded-xl shadow-md select-none text-slate-50 shadow-indigo-900/30 cursor-pointer">
              NEXT
            </button>
          </div>
          <div id="status-tag" class="text-center text-[10px] text-emerald-400 flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            CONNECTED TO HOST
          </div>
        </footer>

        <script>
          const socket = io();
          const lyricsBox = document.getElementById('lyrics-box');
          const statusTag = document.getElementById('status-tag');

          socket.on('connect', () => {
            statusTag.innerHTML = \`<span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> CONNECTED TO HOST\`;
            statusTag.className = "text-center text-[10px] text-emerald-400 flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider";
          });

          socket.on('disconnect', () => {
            statusTag.innerHTML = \`<span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span> DISCONNECTED\`;
            statusTag.className = "text-center text-[10px] text-rose-500 flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider";
          });

          socket.on('state-sync', (state) => {
            if (state && state.currentLyrics && state.currentLyrics.length > 0) {
              lyricsBox.innerText = state.currentLyrics.join('\\n');
            } else {
              lyricsBox.innerText = '-- Empty Projection --';
            }
          });

          function sendAction(action) {
            socket.emit('slide-action', action);
          }
        </script>
      </body>
      </html>
    `
  }
}
export default RemoteControllerService
