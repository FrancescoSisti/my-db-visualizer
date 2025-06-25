const { app, BrowserWindow, ipcMain } = require('electron')
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
      enableRemoteModule: false
    },
    titleBarStyle: 'hiddenInset',
    show: false
  })

  // Load the appropriate URL for development or production
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'dist', 'index.html'))
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
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
    
    return { success: true, message: 'Connected to database' }
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
        type: field.type,
        length: field.length
      }))
    }
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