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
    testConnection: (config: DatabaseConfig) => Promise<DatabaseResult>
    connect: (config: DatabaseConfig) => Promise<DatabaseResult>
    disconnect: () => Promise<DatabaseResult>
    getDatabases: () => Promise<DatabaseResult>
    getTables: (database: string) => Promise<DatabaseResult>
    getTableStructure: (database: string, table: string) => Promise<DatabaseResult>
    getTableData: (database: string, table: string, limit?: number, offset?: number) => Promise<DatabaseResult>
    executeQuery: (query: string) => Promise<DatabaseResult>
    ping: () => Promise<DatabaseResult>
  }
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => Promise<any>
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => void
    removeAllListeners: (channel: string) => void
  }
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
    dbAPI: {
      testConnection: (config: DatabaseConfig) => Promise<DatabaseResult>
      connect: (config: DatabaseConfig) => Promise<DatabaseResult>
      disconnect: () => Promise<DatabaseResult>
      getDatabases: () => Promise<DatabaseResult>
      getTables: (database: string) => Promise<DatabaseResult>
      executeQuery: (query: string) => Promise<DatabaseResult>
      getTableStructure: (database: string, table: string) => Promise<DatabaseResult>
      getTableData: (database: string, table: string, limit?: number, offset?: number) => Promise<DatabaseResult>
    }
    appAPI: {
      getVersion: () => string
      getPlatform: () => string
    }
  }
}

export {} 