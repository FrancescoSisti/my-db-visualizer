const { contextBridge, ipcRenderer } = require('electron')

// Expose database API to renderer process
contextBridge.exposeInMainWorld('dbAPI', {
  // Connection methods
  testConnection: (config) => ipcRenderer.invoke('db:test-connection', config),
  connect: (config) => ipcRenderer.invoke('db:connect', config),
  
  // Data retrieval methods
  getDatabases: () => ipcRenderer.invoke('db:get-databases'),
  getTables: (database) => ipcRenderer.invoke('db:get-tables', database),
  executeQuery: (query) => ipcRenderer.invoke('db:execute-query', query),
  
  // Utility methods
  ping: () => ipcRenderer.invoke('db:ping')
})

// Expose app information
contextBridge.exposeInMainWorld('appAPI', {
  getVersion: () => process.env.npm_package_version || '1.0.0',
  getPlatform: () => process.platform
}) 