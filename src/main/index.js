import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'node:fs'
import { Base64 } from 'js-base64'

let base64_count = 1

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 700,
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

  ipcMain.on('open-file-dialog', (event) => {
    dialog
      .showOpenDialog(mainWindow, {
        properties: ['openFile'],
        title: '读取数据文件',
        filters: [{ name: 'TODO Data', extensions: ['tdd'] }]
      })
      .then(async (r) => {
        let data = fs.readFileSync(r.filePaths[0], {
          encoding: 'utf8'
        })
        for (let i = 0; i < base64_count; i++) {
          data = Base64.decode(data)
        }
        event.sender.send('selected-file', data)
      })
  })
  ipcMain.on('save-file-dialog', (event, args) => {
    dialog
      .showSaveDialog(mainWindow, {
        properties: ['showOverwriteConfirmation', 'treatPackageAsDirectory'],
        title: '保存数据到文件',
        filters: [{ name: 'TODO Data', extensions: ['tdd'] }]
      })
      .then((r) => {
        let data = args
        let chunk_size = 76
        for (let i = 0; i < base64_count; i++) {
          data = Base64.encode(data)
        }
        let arr = []
        for (let i = 0; i < data.length / chunk_size; i++) {
          if ((i + 1) * chunk_size > data.length) {
            arr.push(data.substring(i * chunk_size, data.length))
          } else {
            arr.push(data.substring(i * chunk_size, (i + 1) * chunk_size))
          }
        }
        data = arr.join('\r\n')
        fs.writeFile(r.filePath, data, (err) => {
          if (err) {
            console.log(err)
            event.sender.send('saved-file', err)
          }
          event.sender.send('saved-file', args)
        })
      })
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
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

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
