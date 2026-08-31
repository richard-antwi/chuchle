import { app, shell, BrowserWindow, ipcMain, screen, dialog } from 'electron'
import { join } from 'path'
import { writeFile, readFile } from 'fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initDatabase, getDb } from './db'
import { DisplayService } from './services/DisplayService'
import { VlcMediaService } from './services/VlcMediaService'
import { RemoteControllerService } from './services/RemoteControllerService'

let vlcService: VlcMediaService
let remoteService: RemoteControllerService

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Initialize SQLite database
  initDatabase()

  // Initialize display manager
  DisplayService.init()
  DisplayService.createAuxiliaryWindows(join(__dirname, '../preload/index.js'))

  // Initialize VLC Media client
  vlcService = new VlcMediaService()

  // Initialize Web Remote Controller server
  remoteService = new RemoteControllerService()

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Display Management IPC handlers
  ipcMain.handle('get-displays', () => {
    return screen.getAllDisplays().map((d) => ({
      id: d.id,
      bounds: d.bounds,
      scaleFactor: d.scaleFactor
    }))
  })

  ipcMain.on('reposition-displays', () => {
    DisplayService.repositionWindows()
  })

  // State synchronization IPC channel
  ipcMain.on('update-projection-state', (event, state) => {
    BrowserWindow.getAllWindows().forEach((win) => {
      if (win.webContents !== event.sender) {
        win.webContents.send('projection-state-updated', state)
      }
    })
  })

  // Query Web Remote connection URL
  ipcMain.handle('get-remote-url', () => {
    return remoteService ? remoteService.getLocalUrl() : ''
  })

  // Focus output window handler
  ipcMain.handle('focus-window', (_event, windowName: 'audience' | 'stage' | 'foyer') => {
    DisplayService.focusWindow(windowName)
    return true
  })

  // Database search handlers
  ipcMain.handle('search-songs', (_event, query: string) => {
    const db = getDb()
    const stmt = db.prepare('SELECT * FROM songs WHERE title LIKE ? OR artist LIKE ?')
    return stmt.all(`%${query}%`, `%${query}%`)
  })

  ipcMain.handle('get-song-sections', (_event, songId: string) => {
    const db = getDb()
    const stmt = db.prepare('SELECT * FROM song_sections WHERE song_id = ? ORDER BY section_order ASC')
    return stmt.all(songId)
  })

  ipcMain.handle('get-installed-translations', () => {
    const db = getDb()
    const stmt = db.prepare('SELECT * FROM bible_translations WHERE is_installed = 1')
    return stmt.all()
  })

  ipcMain.handle('lookup-scripture', (_event, book: string, chapter: number, verseStart: number, verseEnd: number, translationIds: string[]) => {
    const db = getDb()
    const results: Record<string, any[]> = {}
    const stmt = db.prepare(
      'SELECT * FROM bible_verses WHERE translation_id = ? AND book_name = ? AND chapter = ? AND verse >= ? AND verse <= ? ORDER BY verse ASC'
    )
    for (const transId of translationIds) {
      results[transId] = stmt.all(transId, book, chapter, verseStart, verseEnd)
    }
    return results
  })

  ipcMain.handle('search-hymns', (_event, query: string) => {
    const db = getDb()
    const stmt = db.prepare('SELECT * FROM hymn_entries WHERE title LIKE ? OR hymn_number = ?')
    const num = parseInt(query)
    return stmt.all(`%${query}%`, isNaN(num) ? -1 : num)
  })

  ipcMain.handle('get-hymn-verses-parallel', (_event, hymnNumber: number) => {
    const db = getDb()
    const entries = db.prepare('SELECT * FROM hymn_entries WHERE hymn_number = ?').all(hymnNumber) as any[]
    const results: Record<string, any[]> = {}
    const stmt = db.prepare('SELECT * FROM hymn_verses WHERE hymn_entry_id = ? ORDER BY verse_number ASC')
    for (const entry of entries) {
      results[entry.language] = stmt.all(entry.id)
    }
    return results
  })

  // Service File Save & Load IPC Handlers
  ipcMain.handle('save-autosave-state', async (_event, stateData: any) => {
    try {
      const autosavePath = join(app.getPath('userData'), '.churchle_autosave.json')
      await writeFile(autosavePath, JSON.stringify(stateData, null, 2), 'utf-8')
      return true
    } catch (e) {
      console.error('Autosave file write error:', e)
      return false
    }
  })

  ipcMain.handle('load-autosave-state', async () => {
    try {
      const autosavePath = join(app.getPath('userData'), '.churchle_autosave.json')
      const content = await readFile(autosavePath, 'utf-8')
      return JSON.parse(content)
    } catch (e) {
      return null
    }
  })

  ipcMain.handle('save-service-file', async (_event, serviceData: any) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Save Order of Service File',
      defaultPath: 'Sunday_Service.churchle',
      filters: [{ name: 'Churchle Service File (*.churchle)', extensions: ['churchle', 'json'] }]
    })
    if (canceled || !filePath) return false
    await writeFile(filePath, JSON.stringify(serviceData, null, 2), 'utf-8')
    return true
  })

  ipcMain.handle('open-service-file', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Open Order of Service File',
      filters: [{ name: 'Churchle Service File (*.churchle)', extensions: ['churchle', 'json'] }],
      properties: ['openFile']
    })
    if (canceled || filePaths.length === 0) return null
    const content = await readFile(filePaths[0], 'utf-8')
    return JSON.parse(content)
  })

  // VLC Media Remote Control IPC handler
  ipcMain.handle('vlc-control', async (_event, action, arg) => {
    if (!vlcService) return null
    switch (action) {
      case 'play':
        return await vlcService.play()
      case 'pause':
        return await vlcService.pause()
      case 'stop':
        return await vlcService.stop()
      case 'seek':
        return await vlcService.seek(Number(arg))
      case 'volume':
        return await vlcService.setVolume(Number(arg))
      case 'status':
      default:
        return await vlcService.sendCommand('')
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  if (remoteService) {
    remoteService.close()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
