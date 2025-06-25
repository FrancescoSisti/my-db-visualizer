import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DatabaseConfig, DatabaseResult, Database, Table } from '@/types/global'

export const useConnectionStore = defineStore('connection', () => {
  // State
  const currentConnection = ref<DatabaseConfig | null>(null)
  const databases = ref<Database[]>([])
  const tables = ref<Table[]>([])
  const selectedDatabase = ref<string>('')
  const connectionHistory = ref<DatabaseConfig[]>([])
  const isConnected = ref(false)

  // Computed
  const hasActiveConnection = computed(() => isConnected.value && currentConnection.value !== null)

  // Actions
  async function testConnection(config: DatabaseConfig): Promise<DatabaseResult> {
    try {
      const result = await window.dbAPI.testConnection(config)
      return result
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async function connect(config: DatabaseConfig): Promise<DatabaseResult> {
    try {
      const result = await window.dbAPI.connect(config)
      
      if (result.success) {
        currentConnection.value = config
        addToHistory(config)
        await loadDatabases()
      }
      
      return result
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      }
    }
  }

  function disconnect(): void {
    currentConnection.value = null
    databases.value = []
    tables.value = []
    selectedDatabase.value = ''
    isConnected.value = false
  }

  async function loadDatabases(): Promise<void> {
    if (!hasActiveConnection.value) return

    try {
      const result = await window.dbAPI.getDatabases()
      if (result.success && result.data) {
        databases.value = result.data
      }
    } catch (error) {
      console.error('Failed to load databases:', error)
    }
  }

  async function loadTables(database: string): Promise<void> {
    if (!hasActiveConnection.value) return

    try {
      const result = await window.dbAPI.getTables(database)
      if (result.success && result.data) {
        tables.value = result.data
        selectedDatabase.value = database
      }
    } catch (error) {
      console.error('Failed to load tables:', error)
    }
  }

  async function executeQuery(query: string): Promise<DatabaseResult> {
    if (!hasActiveConnection.value) {
      return {
        success: false,
        message: 'No database connection'
      }
    }

    try {
      return await window.dbAPI.executeQuery(query)
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Query execution failed'
      }
    }
  }

  function setConnection(config: DatabaseConfig) {
    currentConnection.value = config
    isConnected.value = true
    addToHistory(config)
  }

  function addToHistory(config: DatabaseConfig) {
    // Remove existing entry if exists (avoid duplicates)
    const existingIndex = connectionHistory.value.findIndex(
      item => item.host === config.host && 
              item.port === config.port && 
              item.user === config.user &&
              item.database === config.database
    )
    
    if (existingIndex !== -1) {
      connectionHistory.value.splice(existingIndex, 1)
    }
    
    // Add to beginning of array
    connectionHistory.value.unshift({ ...config })
    
    // Keep only last 10 connections
    if (connectionHistory.value.length > 10) {
      connectionHistory.value = connectionHistory.value.slice(0, 10)
    }
    
    // Save to localStorage
    localStorage.setItem('db_connection_history', JSON.stringify(connectionHistory.value))
  }

  function removeFromHistory(config: DatabaseConfig) {
    const index = connectionHistory.value.findIndex(
      item => item.host === config.host && 
              item.port === config.port && 
              item.user === config.user &&
              item.database === config.database
    )
    
    if (index !== -1) {
      connectionHistory.value.splice(index, 1)
      localStorage.setItem('db_connection_history', JSON.stringify(connectionHistory.value))
    }
  }

  function clearHistory() {
    connectionHistory.value = []
    localStorage.removeItem('db_connection_history')
  }

  function loadHistory() {
    try {
      const stored = localStorage.getItem('db_connection_history')
      if (stored) {
        connectionHistory.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load connection history:', error)
      connectionHistory.value = []
    }
  }

  function getConnectionName(config: DatabaseConfig): string {
    return config.database 
      ? `${config.database}@${config.host}:${config.port}`
      : `${config.host}:${config.port}`
  }

  // Initialize
  loadHistory()

  return {
    // State
    currentConnection,
    databases,
    tables,
    selectedDatabase,
    connectionHistory,
    isConnected,
    
    // Computed
    hasActiveConnection,
    
    // Actions
    testConnection,
    connect,
    disconnect,
    loadDatabases,
    loadTables,
    executeQuery,
    addToHistory,
    removeFromHistory,
    clearHistory,
    loadHistory,
    getConnectionName
  }
}) 