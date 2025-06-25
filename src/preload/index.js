const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database API methods
  database: {
    testConnection: (config) => ipcRenderer.invoke('db:test-connection', config),
    connect: (config) => ipcRenderer.invoke('db:connect', config),
    disconnect: () => ipcRenderer.invoke('db:disconnect'),
    getDatabases: () => ipcRenderer.invoke('db:get-databases'),
    getTables: (database) => ipcRenderer.invoke('db:get-tables', database),
    executeQuery: (query) => ipcRenderer.invoke('db:execute-query', query),
    getTableStructure: (database, table) => ipcRenderer.invoke('db:get-table-structure', database, table),
    getTableData: (database, table, limit, offset) => ipcRenderer.invoke('db:get-table-data', database, table, limit, offset),
    ping: () => ipcRenderer.invoke('db:ping')
  },
  
  // File system operations
  fileSystem: {
    saveQuery: (data) => ipcRenderer.invoke('fs:save-query', data),
    loadQuery: () => ipcRenderer.invoke('fs:load-query'),
    exportData: (data) => ipcRenderer.invoke('fs:export-data', data)
  },
  
  // Menu events API
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', callback)
  },
  
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  },
  
  // App information
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  
  // Legacy compatibility
  openFile: () => ipcRenderer.invoke('fs:load-query'),
  saveFile: (data) => ipcRenderer.invoke('fs:save-query', data)
})

// Legacy dbAPI for backward compatibility
contextBridge.exposeInMainWorld('dbAPI', {
  testConnection: (config) => ipcRenderer.invoke('db:test-connection', config),
  connect: (config) => ipcRenderer.invoke('db:connect', config),
  disconnect: () => ipcRenderer.invoke('db:disconnect'),
  getDatabases: () => ipcRenderer.invoke('db:get-databases'),
  getTables: (database) => ipcRenderer.invoke('db:get-tables', database),
  executeQuery: (query) => ipcRenderer.invoke('db:execute-query', query),
  getTableStructure: (database, table) => ipcRenderer.invoke('db:get-table-structure', database, table),
  getTableData: (database, table, limit, offset) => ipcRenderer.invoke('db:get-table-data', database, table, limit, offset),
  ping: () => ipcRenderer.invoke('db:ping')
})

// Expose app information
contextBridge.exposeInMainWorld('appAPI', {
  getVersion: () => process.env.npm_package_version || '1.0.0',
  getPlatform: () => process.platform
}) 