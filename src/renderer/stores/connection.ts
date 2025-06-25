import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DatabaseConfig, DatabaseResponse, Database, Table } from '@/types/global'

export const useConnectionStore = defineStore('connection', () => {
  // State
  const currentConnection = ref<DatabaseConfig | null>(null)
  const databases = ref<Database[]>([])
  const tables = ref<Table[]>([])
  const selectedDatabase = ref<string>('')
  const connectionHistory = ref<DatabaseConfig[]>([])

  // Computed
  const isConnected = computed(() => currentConnection.value !== null)

  // Actions
  async function testConnection(config: DatabaseConfig): Promise<DatabaseResponse> {
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

  async function connect(config: DatabaseConfig): Promise<DatabaseResponse> {
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
  }

  async function loadDatabases(): Promise<void> {
    if (!isConnected.value) return

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
    if (!isConnected.value) return

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

  async function executeQuery(query: string): Promise<DatabaseResponse> {
    if (!isConnected.value) {
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

  function addToHistory(config: DatabaseConfig): void {
    const existingIndex = connectionHistory.value.findIndex(
      conn => conn.host === config.host && 
              conn.port === config.port && 
              conn.user === config.user
    )

    if (existingIndex !== -1) {
      connectionHistory.value.splice(existingIndex, 1)
    }

    connectionHistory.value.unshift(config)
    
    // Keep only last 10 connections
    if (connectionHistory.value.length > 10) {
      connectionHistory.value = connectionHistory.value.slice(0, 10)
    }

    // Save to localStorage
    localStorage.setItem('db-connection-history', JSON.stringify(connectionHistory.value))
  }

  function loadHistory(): void {
    try {
      const saved = localStorage.getItem('db-connection-history')
      if (saved) {
        connectionHistory.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load connection history:', error)
    }
  }

  function removeFromHistory(config: DatabaseConfig): void {
    const index = connectionHistory.value.findIndex(
      conn => conn.host === config.host && 
              conn.port === config.port && 
              conn.user === config.user
    )

    if (index !== -1) {
      connectionHistory.value.splice(index, 1)
      localStorage.setItem('db-connection-history', JSON.stringify(connectionHistory.value))
    }
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
    
    // Computed
    isConnected,
    
    // Actions
    testConnection,
    connect,
    disconnect,
    loadDatabases,
    loadTables,
    executeQuery,
    addToHistory,
    loadHistory,
    removeFromHistory
  }
}) 