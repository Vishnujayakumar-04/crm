const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

// Ensure single application instance
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

let mainWindow = null

function getDistIndexPath() {
  const frontendDist = path.join(__dirname, '../frontend/dist/index.html')
  if (fs.existsSync(frontendDist)) return frontendDist
  return path.join(__dirname, '../dist/index.html')
}

function getAppIconPath() {
  const frontendIcon = path.join(__dirname, '../frontend/public/icons/icon-512.png')
  if (fs.existsSync(frontendIcon)) return frontendIcon
  return path.join(__dirname, '../public/icons/icon-512.png')
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#0d0f14',
    show: false,
    title: 'Portfolio CRM — Personal Wealth & Investment Manager',
    icon: getAppIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  })

  // Prevent white flash during initial page load
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Open external links in user's default browser instead of Electron window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  // Build clean application menu
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload Dashboard',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.reload()
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'Alt+F4',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        ...(process.env.NODE_ENV === 'development' || !app.isPackaged
          ? [{ role: 'toggleDevTools' }]
          : [])
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation & Support',
          click: () => shell.openExternal('https://github.com')
        },
        {
          label: 'About Portfolio CRM',
          click: () => {
            const { dialog } = require('electron')
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Portfolio CRM',
              message: 'Portfolio CRM v1.0.0',
              detail: 'Personal Wealth & Investment Manager\nIntegrated with Firebase Cloud Firestore sync.\nDesktop edition built with Electron & React.'
            })
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev')

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      // Fallback to local dist file if dev server is unreachable
      mainWindow.loadFile(getDistIndexPath())
    })
  } else {
    mainWindow.loadFile(getDistIndexPath())
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.whenReady().then(() => {
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
