const { contextBridge, ipcRenderer } = require('electron')

// Expose unified API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Database API
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
  
  // IPC methods
  ipcRenderer: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    on: (channel, listener) => ipcRenderer.on(channel, listener),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
  }
})

// Keep legacy dbAPI for backward compatibility
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