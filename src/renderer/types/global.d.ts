// Global type definitions for Electron APIs exposed through preload

export interface DatabaseConfig {
  host: string
  port: number
  user: string
  password: string
  database?: string
}

export interface DatabaseResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  fields?: Array<{
    name: string
    type: number
    length: number
  }>
}

export interface Database {
  Database: string
}

export interface Table {
  [key: string]: string
}

declare global {
  interface Window {
    dbAPI: {
      testConnection: (config: DatabaseConfig) => Promise<DatabaseResponse>
      connect: (config: DatabaseConfig) => Promise<DatabaseResponse>
      getDatabases: () => Promise<DatabaseResponse<Database[]>>
      getTables: (database: string) => Promise<DatabaseResponse<Table[]>>
      executeQuery: (query: string) => Promise<DatabaseResponse>
      ping: () => Promise<DatabaseResponse>
    }
    appAPI: {
      getVersion: () => string
      getPlatform: () => string
    }
  }
} 