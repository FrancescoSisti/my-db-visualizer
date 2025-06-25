const { contextBridge, ipcRenderer } = require('electron')

// Expose database API to renderer process
contextBridge.exposeInMainWorld('dbAPI', {
  // Connection methods
  testConnection: (config) => ipcRenderer.invoke('db:test-connection', config),
  connect: (config) => ipcRenderer.invoke('db:connect', config),
  disconnect: () => ipcRenderer.invoke('db:disconnect'),
  
  // Data retrieval methods
  getDatabases: () => ipcRenderer.invoke('db:get-databases'),
  getTables: (database) => ipcRenderer.invoke('db:get-tables', database),
  executeQuery: (query) => ipcRenderer.invoke('db:execute-query', query),
  
  // Table operations
  getTableStructure: (database, table) => ipcRenderer.invoke('db:get-table-structure', database, table),
  getTableData: (database, table, limit, offset) => ipcRenderer.invoke('db:get-table-data', database, table, limit, offset),
  
  // Utility methods
  ping: () => ipcRenderer.invoke('db:ping')
})

// Expose app information
contextBridge.exposeInMainWorld('appAPI', {
  getVersion: () => process.env.npm_package_version || '1.0.0',
  getPlatform: () => process.platform
}) 