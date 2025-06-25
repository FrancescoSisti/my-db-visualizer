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
  
  // Menu events API
  onMenuAction: (callback: (event: Electron.IpcRendererEvent, action: string) => void) => void
  removeAllListeners: (channel: string) => void
  
  // App information
  getVersion: () => Promise<string>
  
  // File system operations
  openFile: () => Promise<string | null>
  saveFile: (data: string) => Promise<boolean>
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