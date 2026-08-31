import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

export class DisplayService {
  private static audienceWindow: BrowserWindow | null = null
  private static stageWindow: BrowserWindow | null = null
  private static foyerWindow: BrowserWindow | null = null

  public static init(): void {
    screen.on('display-added', () => {
      this.repositionWindows()
    })
    screen.on('display-removed', () => {
      this.repositionWindows()
    })
  }

  public static createAuxiliaryWindows(preloadPath: string): void {
    const displays = screen.getAllDisplays()
    const isDev = is.dev

    // 1. Create Audience Window
    const audienceDisplay = displays[1] || displays[0]
    this.audienceWindow = this.createWindow(
      'audience',
      audienceDisplay,
      preloadPath,
      !displays[1] || isDev,
      1
    )

    // 2. Create Stage Window
    const stageDisplay = displays[2] || displays[0]
    this.stageWindow = this.createWindow(
      'stage',
      stageDisplay,
      preloadPath,
      !displays[2] || isDev,
      2
    )

    // 3. Create Foyer Window
    const foyerDisplay = displays[3] || displays[0]
    this.foyerWindow = this.createWindow(
      'foyer',
      foyerDisplay,
      preloadPath,
      !displays[3] || isDev,
      3
    )
  }

  private static createWindow(
    route: string,
    display: Electron.Display,
    preloadPath: string,
    windowed: boolean,
    offsetIndex: number = 1
  ): BrowserWindow {
    const { x, y, width, height } = display.bounds
    const offset = offsetIndex * 45

    const win = new BrowserWindow({
      title: `${route.toUpperCase()} OUTPUT`,
      width: windowed ? 800 : width,
      height: windowed ? 600 : height,
      x: windowed ? x + offset : x,
      y: windowed ? y + offset : y,
      frame: windowed,
      fullscreen: !windowed,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: preloadPath,
        sandbox: false
      }
    })

    win.on('ready-to-show', () => {
      win.show()
    })

    const rendererUrl = process.env['ELECTRON_RENDERER_URL']
    if (is.dev && rendererUrl) {
      win.loadURL(`${rendererUrl}#/${route}`)
    } else {
      win.loadFile(join(__dirname, '../renderer/index.html'), { hash: `/${route}` })
    }

    return win
  }

  public static focusWindow(name: 'audience' | 'stage' | 'foyer'): void {
    let targetWin: BrowserWindow | null = null
    if (name === 'audience') targetWin = this.audienceWindow
    if (name === 'stage') targetWin = this.stageWindow
    if (name === 'foyer') targetWin = this.foyerWindow

    if (targetWin && !targetWin.isDestroyed()) {
      if (targetWin.isMinimized()) targetWin.restore()
      targetWin.show()
      targetWin.focus()
    }
  }

  public static repositionWindows(): void {
    const displays = screen.getAllDisplays()
    const isDev = is.dev

    if (this.audienceWindow && !this.audienceWindow.isDestroyed()) {
      const display = displays[1] || displays[0]
      this.updateWindowPosition(this.audienceWindow, display, !displays[1] || isDev, 1)
    }

    if (this.stageWindow && !this.stageWindow.isDestroyed()) {
      const display = displays[2] || displays[0]
      this.updateWindowPosition(this.stageWindow, display, !displays[2] || isDev, 2)
    }

    if (this.foyerWindow && !this.foyerWindow.isDestroyed()) {
      const display = displays[3] || displays[0]
      this.updateWindowPosition(this.foyerWindow, display, !displays[3] || isDev, 3)
    }
  }

  private static updateWindowPosition(
    win: BrowserWindow,
    display: Electron.Display,
    windowed: boolean,
    offsetIndex: number = 1
  ): void {
    const { x, y, width, height } = display.bounds
    const offset = offsetIndex * 45
    win.setFullScreen(!windowed)
    if (windowed) {
      win.setBounds({ x: x + offset, y: y + offset, width: 800, height: 600 })
    } else {
      win.setBounds({ x, y, width, height })
    }
  }

  public static closeAllWindows(): void {
    if (this.audienceWindow && !this.audienceWindow.isDestroyed()) this.audienceWindow.close()
    if (this.stageWindow && !this.stageWindow.isDestroyed()) this.stageWindow.close()
    if (this.foyerWindow && !this.foyerWindow.isDestroyed()) this.foyerWindow.close()
  }
}
