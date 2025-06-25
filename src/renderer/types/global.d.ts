// Global type definitions for the renderer process

export interface DatabaseConfig {
  host: string
  port: number
  user: string
  password: string
  database?: string
}

export interface DatabaseResponse {
  success: boolean
  message?: string
  data?: any[]
  fields?: Array<{ name: string; type: string }>
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
    dbAPI: {
      testConnection: (config: DatabaseConfig) => Promise<DatabaseResponse>
      connect: (config: DatabaseConfig) => Promise<DatabaseResponse>
      disconnect: () => Promise<void>
      getDatabases: () => Promise<DatabaseResponse>
      getTables: (database: string) => Promise<DatabaseResponse>
      executeQuery: (query: string) => Promise<DatabaseResponse>
      getTableStructure: (database: string, table: string) => Promise<DatabaseResponse>
      getTableData: (database: string, table: string, limit?: number, offset?: number) => Promise<DatabaseResponse>
    }
    appAPI: {
      getVersion: () => string
      getPlatform: () => string
    }
  }
}

export {} 