const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('node:path')
const mysql = require('mysql2/promise')

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit()
}

let mainWindow

const createWindow = () => {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    titleBarStyle: 'hiddenInset',
    show: false,
    icon: path.join(__dirname, '..', '..', 'assets', 'icon.png') // Optional icon
  })

  // Load the appropriate URL for development or production
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
  
  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
    
    // Reload on changes in development
    if (process.env.NODE_ENV === 'development') {
      require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
      })
    }
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Create custom menu
  createMenu()
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Connection',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-action', 'new-connection')
          }
        },
        {
          label: 'Recent Connections',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('menu-action', 'recent-connections')
          }
        },
        { type: 'separator' },
        {
          label: 'Import SQL',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow.webContents.send('menu-action', 'import-sql')
          }
        },
        {
          label: 'Export Data',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('menu-action', 'export-data')
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('menu-action', 'settings')
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Database',
      submenu: [
        {
          label: 'Connect',
          accelerator: 'CmdOrCtrl+Shift+C',
          click: () => {
            mainWindow.webContents.send('menu-action', 'connect')
          }
        },
        {
          label: 'Disconnect',
          accelerator: 'CmdOrCtrl+Shift+D',
          click: () => {
            mainWindow.webContents.send('menu-action', 'disconnect')
          }
        },
        { type: 'separator' },
        {
          label: 'Refresh',
          accelerator: 'F5',
          click: () => {
            mainWindow.webContents.send('menu-action', 'refresh')
          }
        },
        {
          label: 'Create Database',
          click: () => {
            mainWindow.webContents.send('menu-action', 'create-database')
          }
        },
        { type: 'separator' },
        {
          label: 'Connection Info',
          click: () => {
            mainWindow.webContents.send('menu-action', 'connection-info')
          }
        }
      ]
    },
    {
      label: 'Query',
      submenu: [
        {
          label: 'New Query',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow.webContents.send('menu-action', 'new-query')
          }
        },
        {
          label: 'Execute Query',
          accelerator: 'CmdOrCtrl+Enter',
          click: () => {
            mainWindow.webContents.send('menu-action', 'execute-query')
          }
        },
        { type: 'separator' },
        {
          label: 'Save Query',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-action', 'save-query')
          }
        },
        {
          label: 'Load Query',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('menu-action', 'load-query')
          }
        },
        { type: 'separator' },
        {
          label: 'Query History',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            mainWindow.webContents.send('menu-action', 'query-history')
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            mainWindow.webContents.send('menu-action', 'toggle-sidebar')
          }
        },
        {
          label: 'Toggle Dark Mode',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => {
            mainWindow.webContents.send('menu-action', 'toggle-dark-mode')
          }
        },
        { type: 'separator' },
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow.webContents.setZoomLevel(0)
          }
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel()
            mainWindow.webContents.setZoomLevel(currentZoom + 1)
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel()
            mainWindow.webContents.setZoomLevel(currentZoom - 1)
          }
        },
        { type: 'separator' },
        {
          label: 'Full Screen',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen())
          }
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Performance Monitor',
          click: () => {
            mainWindow.webContents.send('menu-action', 'performance-monitor')
          }
        },
        {
          label: 'Connection Logs',
          click: () => {
            mainWindow.webContents.send('menu-action', 'connection-logs')
          }
        },
        { type: 'separator' },
        {
          label: 'Database Schema',
          click: () => {
            mainWindow.webContents.send('menu-action', 'database-schema')
          }
        },
        {
          label: 'Generate ER Diagram',
          click: () => {
            mainWindow.webContents.send('menu-action', 'generate-er-diagram')
          }
        },
        { type: 'separator' },
        {
          label: 'Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => {
            mainWindow.webContents.toggleDevTools()
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            mainWindow.webContents.send('menu-action', 'documentation')
          }
        },
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'CmdOrCtrl+/',
          click: () => {
            mainWindow.webContents.send('menu-action', 'keyboard-shortcuts')
          }
        },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => {
            mainWindow.webContents.send('menu-action', 'check-updates')
          }
        },
        {
          label: 'About DB Visualizer Pro',
          click: () => {
            mainWindow.webContents.send('menu-action', 'about')
          }
        }
      ]
    }
  ]

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: 'DB Visualizer Pro',
      submenu: [
        {
          label: 'About DB Visualizer Pro',
          click: () => {
            mainWindow.webContents.send('menu-action', 'about')
          }
        },
        { type: 'separator' },
        {
          label: 'Services',
          role: 'services',
          submenu: []
        },
        { type: 'separator' },
        {
          label: 'Hide DB Visualizer Pro',
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    })

    // Remove Exit from File menu on macOS
    template[1].submenu = template[1].submenu.filter(item => item.label !== 'Exit')
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// App event listeners
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Database connection pool
let connectionPool = null

// IPC handlers for database operations
ipcMain.handle('db:test-connection', async (event, config) => {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      connectTimeout: 5000
    })
    
    await connection.ping()
    await connection.end()
    
    return { success: true, message: 'Connection successful' }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('db:connect', async (event, config) => {
  try {
    if (connectionPool) {
      await connectionPool.end()
    }
    
    connectionPool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })
    
    // Test the connection
    const connection = await connectionPool.getConnection()
    await connection.ping()
    connection.release()
    
    return { success: true, message: 'Connected to database' }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('db:disconnect', async () => {
  try {
    if (connectionPool) {
      await connectionPool.end()
      connectionPool = null
    }
    return { success: true, message: 'Disconnected from database' }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('db:get-databases', async () => {
  try {
    if (!connectionPool) {
      throw new Error('No database connection')
    }
    
    const [rows] = await connectionPool.execute('SHOW DATABASES')
    return { success: true, data: rows }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('db:get-tables', async (event, database) => {
  try {
    if (!connectionPool) {
      throw new Error('No database connection')
    }
    
    const [rows] = await connectionPool.execute('SHOW TABLES FROM ??', [database])
    return { success: true, data: rows }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('db:execute-query', async (event, query) => {
  try {
    if (!connectionPool) {
      throw new Error('No database connection')
    }
    
    const [rows, fields] = await connectionPool.execute(query)
    return { 
      success: true, 
      data: rows, 
      fields: fields?.map(field => ({
        name: field.name,
        type: field.type
      }))
    }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('db:get-table-structure', async (event, database, table) => {
  try {
    if (!connectionPool) {
      throw new Error('No database connection')
    }
    
    const [rows] = await connectionPool.execute('DESCRIBE ??.??', [database, table])
    return { success: true, data: rows }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('db:get-table-data', async (event, database, table, limit = 100, offset = 0) => {
  try {
    if (!connectionPool) {
      throw new Error('No database connection')
    }
    
    const [rows, fields] = await connectionPool.execute(
      'SELECT * FROM ??.?? LIMIT ? OFFSET ?', 
      [database, table, limit, offset]
    )
    
    return { 
      success: true, 
      data: rows,
      fields: fields?.map(field => ({
        name: field.name,
        type: field.type
      }))
    }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('db:ping', async () => {
  try {
    if (!connectionPool) {
      throw new Error('No database connection')
    }
    
    const connection = await connectionPool.getConnection()
    await connection.ping()
    connection.release()
    
    return { success: true, message: 'Database connection is active' }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

// Cleanup on app quit
app.on('before-quit', async () => {
  if (connectionPool) {
    await connectionPool.end()
  }
}) 