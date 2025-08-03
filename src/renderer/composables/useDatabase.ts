import { ref, computed } from 'vue'
import { useConnectionStore } from '@/stores/connection'
import { useUIStore } from '@/stores/ui'

export interface DatabaseConnection {
  host: string
  port: number
  user: string
  password: string
  database?: string
}

export interface DatabaseInfo {
  name: string
  tables: TableInfo[]
}

export interface TableInfo {
  name: string
  rows: number
  size: string
  engine: string
  collation: string
}

export interface TableColumn {
  Field: string
  Type: string
  Null: 'YES' | 'NO'
  Key: 'PRI' | 'UNI' | 'MUL' | ''
  Default: string | null
  Extra: string
}

export interface QueryResult {
  data: any[]
  fields: Array<{ name: string; type: string }>
  affectedRows?: number
  executionTime?: number
}

export function useDatabase() {
  const connectionStore = useConnectionStore()
  const uiStore = useUIStore()
  
  const isConnecting = ref(false)
  const isExecuting = ref(false)
  const databases = ref<string[]>([])
  const currentDatabase = ref<string>('')
  const tables = ref<TableInfo[]>([])
  const currentTable = ref<string>('')

  // Test database connection
  async function testConnection(config: DatabaseConnection): Promise<{ success: boolean; message: string }> {
    try {
      isConnecting.value = true
      const result = await window.electronAPI.database.testConnection(config)
      
      if (result.success) {
        uiStore.showToast({
          title: 'Connection successful',
          message: 'Database connection established successfully',
          type: 'success'
        })
      } else {
        uiStore.showToast({
          title: 'Connection failed',
          message: result.message,
          type: 'error'
        })
      }
      
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred'
      uiStore.showToast({
        title: 'Connection error',
        message,
        type: 'error'
      })
      return { success: false, message }
    } finally {
      isConnecting.value = false
    }
  }

  // Connect to database
  async function connect(config: DatabaseConnection): Promise<boolean> {
    try {
      isConnecting.value = true
      const result = await window.electronAPI.database.connect(config)
      
      if (result.success) {
        connectionStore.setConnection(config)
        await loadDatabases()
        
        uiStore.showToast({
          title: 'Connected',
          message: 'Successfully connected to database',
          type: 'success'
        })
        
        return true
      } else {
        uiStore.showToast({
          title: 'Connection failed',
          message: result.message,
          type: 'error'
        })
        return false
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred'
      uiStore.showToast({
        title: 'Connection error',
        message,
        type: 'error'
      })
      return false
    } finally {
      isConnecting.value = false
    }
  }

  // Disconnect from database
  async function disconnect(): Promise<void> {
    try {
      await window.electronAPI.database.disconnect()
      connectionStore.clearConnection()
      databases.value = []
      tables.value = []
      currentDatabase.value = ''
      currentTable.value = ''
      
      uiStore.showToast({
        title: 'Disconnected',
        message: 'Database connection closed',
        type: 'info'
      })
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }

  // Load available databases
  async function loadDatabases(): Promise<void> {
    try {
      const result = await window.electronAPI.database.getDatabases()
      if (result.success && result.data) {
        databases.value = result.data.map((row: any) => Object.values(row)[0] as string)
      }
    } catch (error) {
      console.error('Failed to load databases:', error)
      uiStore.showToast({
        title: 'Error',
        message: 'Failed to load databases',
        type: 'error'
      })
    }
  }

  // Select a database
  async function selectDatabase(databaseName: string): Promise<void> {
    try {
      currentDatabase.value = databaseName
      await loadTables(databaseName)
      
      uiStore.showToast({
        title: 'Database selected',
        message: `Now using database: ${databaseName}`,
        type: 'success'
      })
    } catch (error) {
      console.error('Failed to select database:', error)
      uiStore.showToast({
        title: 'Error',
        message: 'Failed to select database',
        type: 'error'
      })
    }
  }

  // Load tables from selected database
  async function loadTables(databaseName: string): Promise<void> {
    try {
      const result = await window.electronAPI.database.getTables(databaseName)
      if (result.success && result.data) {
        // Get table info with row counts and sizes
        const tablePromises = result.data.map(async (row: any) => {
          const tableName = Object.values(row)[0] as string
          try {
            const info = await getTableInfo(databaseName, tableName)
            return info
          } catch (error) {
            return {
              name: tableName,
              rows: 0,
              size: '0 B',
              engine: 'Unknown',
              collation: 'Unknown'
            }
          }
        })
        
        tables.value = await Promise.all(tablePromises)
      }
    } catch (error) {
      console.error('Failed to load tables:', error)
      uiStore.showToast({
        title: 'Error',
        message: 'Failed to load tables',
        type: 'error'
      })
    }
  }

  // Get table information
  async function getTableInfo(databaseName: string, tableName: string): Promise<TableInfo> {
    try {
      const query = `
        SELECT 
          table_rows as rows,
          round(((data_length + index_length) / 1024 / 1024), 2) as size_mb,
          engine,
          table_collation as collation
        FROM information_schema.tables 
        WHERE table_schema = ? AND table_name = ?
      `
      
      const result = await executeQuery(query, [databaseName, tableName])
      
      if (result.data.length > 0) {
        const info = result.data[0]
        return {
          name: tableName,
          rows: info.rows || 0,
          size: info.size_mb ? `${info.size_mb} MB` : '0 B',
          engine: info.engine || 'Unknown',
          collation: info.collation || 'Unknown'
        }
      }
      
      return {
        name: tableName,
        rows: 0,
        size: '0 B',
        engine: 'Unknown',
        collation: 'Unknown'
      }
    } catch (error) {
      console.error('Failed to get table info:', error)
      return {
        name: tableName,
        rows: 0,
        size: '0 B',
        engine: 'Unknown',
        collation: 'Unknown'
      }
    }
  }

  // Get table structure
  async function getTableStructure(database: string, table: string): Promise<TableColumn[]> {
    try {
      const result = await window.electronAPI.database.getTableStructure(database, table)
      return result.success && result.data ? result.data : []
    } catch (error) {
      console.error('Failed to get table structure:', error)
      return []
    }
  }

  // Get table data with pagination
  async function getTableData(
    database: string, 
    table: string, 
    limit: number = 100, 
    offset: number = 0
  ): Promise<QueryResult> {
    try {
      const result = await window.electronAPI.database.getTableData(database, table, limit, offset)
      return result.success ? {
        data: result.data || [],
        fields: result.fields || []
      } : { data: [], fields: [] }
    } catch (error) {
      console.error('Failed to get table data:', error)
      return { data: [], fields: [] }
    }
  }

  // Execute custom query
  async function executeQuery(query: string, params?: any[]): Promise<QueryResult> {
    try {
      isExecuting.value = true
      const startTime = Date.now()
      
      // For parameterized queries, we'll need to handle them in the main process
      const result = await window.electronAPI.database.executeQuery(query)
      
      const executionTime = Date.now() - startTime
      
      if (result.success) {
        return {
          data: result.data || [],
          fields: result.fields || [],
          executionTime
        }
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Query execution failed'
      uiStore.showToast({
        title: 'Query Error',
        message,
        type: 'error'
      })
      throw error
    } finally {
      isExecuting.value = false
    }
  }

  // Check connection status
  async function checkConnection(): Promise<boolean> {
    try {
      const result = await window.electronAPI.database.ping()
      return result.success
    } catch (error) {
      return false
    }
  }

  // Computed properties
  const isConnected = computed(() => connectionStore.isConnected)
  const currentConnection = computed(() => connectionStore.currentConnection)

  return {
    // State
    isConnecting,
    isExecuting,
    isConnected,
    currentConnection,
    databases,
    currentDatabase,
    tables,
    currentTable,
    
    // Methods
    testConnection,
    connect,
    disconnect,
    loadDatabases,
    selectDatabase,
    loadTables,
    getTableInfo,
    getTableStructure,
    getTableData,
    executeQuery,
    checkConnection
  }
} 