import { ref, computed } from 'vue'
import { useConnectionStore } from '@/stores/connection'
import { useUIStore } from '@/stores/ui'
import type { TableInfo, ColumnInfo, TableData } from '@/types/database'

export function useDatabase() {
  const connectionStore = useConnectionStore()
  const uiStore = useUIStore()

  const currentDatabase = ref<string>('')
  const tables = ref<TableInfo[]>([])
  const currentTable = ref<string>('')
  const tableColumns = ref<ColumnInfo[]>([])
  const tableData = ref<TableData | null>(null)
  const loading = ref(false)

  // Computed
  const isConnected = computed(() => connectionStore.isConnected)
  const databases = computed(() => connectionStore.databases)

  // Actions
  async function selectDatabase(database: string) {
    if (!isConnected.value) {
      uiStore.showToast('Not connected to database', 'error')
      return
    }

    try {
      loading.value = true
      currentDatabase.value = database
      
      await connectionStore.loadTables(database)
      tables.value = connectionStore.tables as TableInfo[]
      
      uiStore.showToast(`Connected to database: ${database}`, 'success')
    } catch (error) {
      uiStore.showToast(`Failed to select database: ${error}`, 'error')
    } finally {
      loading.value = false
    }
  }

  async function loadTableStructure(tableName: string) {
    if (!isConnected.value || !currentDatabase.value) return

    try {
      loading.value = true
      currentTable.value = tableName

      const query = `DESCRIBE \`${currentDatabase.value}\`.\`${tableName}\``
      const result = await connectionStore.executeQuery(query)

      if (result.success && result.data) {
        tableColumns.value = result.data as ColumnInfo[]
      }
    } catch (error) {
      uiStore.showToast(`Failed to load table structure: ${error}`, 'error')
    } finally {
      loading.value = false
    }
  }

  async function loadTableData(tableName: string, limit = 100, offset = 0) {
    if (!isConnected.value || !currentDatabase.value) return

    try {
      loading.value = true
      
      const countQuery = `SELECT COUNT(*) as total FROM \`${currentDatabase.value}\`.\`${tableName}\``
      const countResult = await connectionStore.executeQuery(countQuery)
      
      const dataQuery = `SELECT * FROM \`${currentDatabase.value}\`.\`${tableName}\` LIMIT ${limit} OFFSET ${offset}`
      const dataResult = await connectionStore.executeQuery(dataQuery)

      if (countResult.success && dataResult.success) {
        const totalRows = countResult.data?.[0]?.total || 0
        
        tableData.value = {
          columns: dataResult.fields?.map(field => field.name) || [],
          rows: dataResult.data || [],
          totalRows,
          offset,
          limit
        }
      }
    } catch (error) {
      uiStore.showToast(`Failed to load table data: ${error}`, 'error')
    } finally {
      loading.value = false
    }
  }

  async function refreshDatabases() {
    if (!isConnected.value) return

    try {
      loading.value = true
      await connectionStore.loadDatabases()
    } catch (error) {
      uiStore.showToast(`Failed to refresh databases: ${error}`, 'error')
    } finally {
      loading.value = false
    }
  }

  async function refreshTables() {
    if (!isConnected.value || !currentDatabase.value) return

    try {
      loading.value = true
      await connectionStore.loadTables(currentDatabase.value)
      tables.value = connectionStore.tables as TableInfo[]
    } catch (error) {
      uiStore.showToast(`Failed to refresh tables: ${error}`, 'error')
    } finally {
      loading.value = false
    }
  }

  async function createDatabase(name: string, charset = 'utf8mb4', collation = 'utf8mb4_unicode_ci') {
    if (!isConnected.value) return

    try {
      loading.value = true
      const query = `CREATE DATABASE \`${name}\` CHARACTER SET ${charset} COLLATE ${collation}`
      const result = await connectionStore.executeQuery(query)

      if (result.success) {
        await refreshDatabases()
        uiStore.showToast(`Database '${name}' created successfully`, 'success')
      } else {
        throw new Error(result.message || 'Failed to create database')
      }
    } catch (error) {
      uiStore.showToast(`Failed to create database: ${error}`, 'error')
    } finally {
      loading.value = false
    }
  }

  async function dropDatabase(name: string) {
    if (!isConnected.value) return

    try {
      loading.value = true
      const query = `DROP DATABASE \`${name}\``
      const result = await connectionStore.executeQuery(query)

      if (result.success) {
        await refreshDatabases()
        if (currentDatabase.value === name) {
          currentDatabase.value = ''
          tables.value = []
        }
        uiStore.showToast(`Database '${name}' dropped successfully`, 'success')
      } else {
        throw new Error(result.message || 'Failed to drop database')
      }
    } catch (error) {
      uiStore.showToast(`Failed to drop database: ${error}`, 'error')
    } finally {
      loading.value = false
    }
  }

  async function truncateTable(tableName: string) {
    if (!isConnected.value || !currentDatabase.value) return

    try {
      loading.value = true
      const query = `TRUNCATE TABLE \`${currentDatabase.value}\`.\`${tableName}\``
      const result = await connectionStore.executeQuery(query)

      if (result.success) {
        await loadTableData(tableName)
        uiStore.showToast(`Table '${tableName}' truncated successfully`, 'success')
      } else {
        throw new Error(result.message || 'Failed to truncate table')
      }
    } catch (error) {
      uiStore.showToast(`Failed to truncate table: ${error}`, 'error')
    } finally {
      loading.value = false
    }
  }

  async function dropTable(tableName: string) {
    if (!isConnected.value || !currentDatabase.value) return

    try {
      loading.value = true
      const query = `DROP TABLE \`${currentDatabase.value}\`.\`${tableName}\``
      const result = await connectionStore.executeQuery(query)

      if (result.success) {
        await refreshTables()
        if (currentTable.value === tableName) {
          currentTable.value = ''
          tableColumns.value = []
          tableData.value = null
        }
        uiStore.showToast(`Table '${tableName}' dropped successfully`, 'success')
      } else {
        throw new Error(result.message || 'Failed to drop table')
      }
    } catch (error) {
      uiStore.showToast(`Failed to drop table: ${error}`, 'error')
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    currentDatabase,
    tables,
    currentTable,
    tableColumns,
    tableData,
    loading,

    // Computed
    isConnected,
    databases,

    // Actions
    selectDatabase,
    loadTableStructure,
    loadTableData,
    refreshDatabases,
    refreshTables,
    createDatabase,
    dropDatabase,
    truncateTable,
    dropTable
  }
} 