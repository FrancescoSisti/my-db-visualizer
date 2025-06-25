// Global type definitions for the renderer process

export interface DatabaseConfig {
  host: string
  port: number
  user: string
  password: string
  database?: string
}

export interface DatabaseResult {
  success: boolean
  message: string
  data?: any[]
  fields?: Array<{ name: string; type: string }>
}

export interface ElectronAPI {
  database: {
    testConnection: (config: DatabaseConfig) => Promise<{ success: boolean; message: string }>
    connect: (config: DatabaseConfig) => Promise<{ success: boolean; message: string }>
    disconnect: () => Promise<{ success: boolean; message: string }>
    getDatabases: () => Promise<{ success: boolean; data?: any[]; message?: string }>
    getTables: (database: string) => Promise<{ success: boolean; data?: any[]; message?: string }>
    executeQuery: (query: string) => Promise<{ success: boolean; data?: any[]; fields?: any[]; message?: string }>
    getTableStructure: (database: string, table: string) => Promise<{ success: boolean; data?: any[]; message?: string }>
    getTableData: (database: string, table: string, limit?: number, offset?: number) => Promise<{ success: boolean; data?: any[]; fields?: any[]; message?: string }>
    ping: () => Promise<{ success: boolean; message: string }>
  }
  
  // File system operations  
  fileSystem: {
    saveQuery: (data: { content: string; title?: string }) => Promise<{ success: boolean; path?: string; message?: string }>
    loadQuery: () => Promise<{ success: boolean; content?: string; filename?: string; path?: string; message?: string }>
    exportData: (data: { rows: any[]; headers?: string[] }) => Promise<{ success: boolean; path?: string; recordsExported?: number; message?: string }>
  }
  
  // Menu events API
  onMenuAction: (callback: (event: Electron.IpcRendererEvent, action: string) => void) => void
  removeAllListeners: (channel: string) => void
  
  // App information
  getVersion: () => Promise<string>
  
  // Legacy compatibility
  openFile: () => Promise<{ success: boolean; content?: string; filename?: string; path?: string; message?: string }>
  saveFile: (data: { content: string; title?: string }) => Promise<{ success: boolean; path?: string; message?: string }>
}

export interface Database {
  Database: string
}

export interface Table {
  name?: string
  [key: string]: any // For MySQL's Tables_in_* format
}

// Electron API definitions
declare global {
  interface Window {
    electronAPI: ElectronAPI
    dbAPI: ElectronAPI['database'] // Legacy compatibility
    appAPI: {
      getVersion: () => string
      getPlatform: () => string
    }
  }
  
  namespace Electron {
    interface IpcRendererEvent {
      sender: any
    }
  }
}

export {} 