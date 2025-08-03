<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <div class="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <!-- Sidebar Header -->
      <div class="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Database Explorer
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Connected to {{ currentConnection?.host || 'Unknown' }}
        </p>
      </div>

      <!-- Database List -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-4">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Databases ({{ databases.length }})
            </span>
            <div class="flex items-center space-x-1">
              <button
                @click="showCreateDatabaseModal = true"
                class="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                title="Create new database"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button
                @click="refreshDatabases"
                class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Refresh databases"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="loading" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading databases...</p>
          </div>

          <div v-else class="space-y-1">
            <div
              v-for="database in databases"
              :key="database.Database"
              class="database-item"
              :class="{ 'active': currentDatabase === database.Database }"
              @click="selectDatabase(database.Database)"
            >
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c0 2.21 1.79 4 4 4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z" />
                </svg>
                <span class="flex-1 text-sm font-medium">{{ database.Database }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tables Section -->
        <div v-if="currentDatabase" class="border-t border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tables ({{ tables.length }})
            </span>
            <div class="flex items-center space-x-1">
              <button
                v-if="currentDatabase"
                @click="showCreateTableModal = true"
                class="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                title="Create new table"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button
                @click="refreshTables"
                class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Refresh tables"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="tablesLoading" class="text-center py-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Loading tables...</p>
          </div>

          <div v-else class="space-y-1">
            <div
              v-for="table in tables"
              :key="getTableName(table)"
              class="table-item"
              :class="{ 'active': currentTable === getTableName(table) }"
              @click="selectTable(getTableName(table))"
            >
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span class="flex-1 text-sm">{{ getTableName(table) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Content Header -->
      <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ pageTitle }}
            </h1>
            <p v-if="currentTable" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Table: {{ currentDatabase }}.{{ currentTable }}
            </p>
          </div>
          
          <div class="flex items-center space-x-3">
            <button
              v-if="currentTable && currentView === 'list'"
              @click="viewTableStructure"
              class="btn-secondary text-sm"
            >
              Structure
            </button>
            <button
              v-if="currentTable && currentView === 'list'"
              @click="viewTableData"
              class="btn-primary text-sm"
            >
              Browse Data
            </button>
            <button
              v-if="currentTable && (currentView === 'data' || currentView === 'structure')"
              @click="currentView = 'list'"
              class="btn-secondary text-sm"
            >
              Back to Tables
            </button>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-hidden">
        <!-- Welcome State -->
        <div v-if="!currentDatabase" class="flex items-center justify-center h-full">
          <EmptyState
            title="Select a Database"
            description="Choose a database from the sidebar to explore its tables and data"
          >
            <template #icon>
              <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c0 2.21 1.79 4 4 4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z" />
              </svg>
            </template>
          </EmptyState>
        </div>

        <!-- Database Selected State -->
        <div v-else-if="!currentTable" class="flex items-center justify-center h-full">
          <EmptyState
            :title="`Database: ${currentDatabase}`"
            :description="`${tables.length} tables available. Select a table from the sidebar to view its structure and data.`"
          >
            <template #icon>
              <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </template>
          </EmptyState>
        </div>

        <!-- Table Content -->
        <div v-else class="h-full">
          <!-- Table List View -->
          <div v-if="currentView === 'list'" class="h-full">
            <TableList
              :database-name="currentDatabase"
              :tables="tables"
              :selected-table="currentTable"
              :loading="tablesLoading"
              @refresh="refreshTables"
              @select-table="selectTable"
              @view-structure="viewTableStructure"
              @view-data="viewTableData"
              @export-data="exportTableData"
              @duplicate-table="duplicateTable"
              @delete-table="deleteTable"
              @create-table="createTable"
            />
          </div>
          
          <!-- Table Data View -->
          <div v-else-if="currentView === 'data'" class="h-full">
            <TableDataView
              :database-name="currentDatabase"
              :table-name="currentTable"
              :columns="tableColumns"
              :data="tableData"
              :total-rows="tableTotalRows"
              :table-size="tableSize"
              :loading="tableDataLoading"
              :error="tableDataError"
              @refresh="loadTableData"
              @export="exportTableData"
              @page-change="handlePageChange"
              @page-size-change="handlePageSizeChange"
              @sort="handleSort"
              @search="handleSearch"
            />
          </div>
          
          <!-- Table Structure View -->
          <div v-else-if="currentView === 'structure'" class="h-full">
            <TableStructure
              :table-name="currentTable"
              :columns="tableStructure"
              :table-info="tableInfo"
              :loading="tableStructureLoading"
              @refresh="loadTableStructure"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Create Database Modal -->
    <CreateDatabaseModal
      :is-open="showCreateDatabaseModal"
      @close="showCreateDatabaseModal = false"
      @created="handleDatabaseCreated"
    />

    <!-- Create Table Modal -->
    <CreateTableModal
      :is-open="showCreateTableModal"
      :database-name="currentDatabase"
      @close="showCreateTableModal = false"
      @created="handleTableCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConnectionStore } from '@/stores/connection'
import { useUIStore } from '@/stores/ui'
import EmptyState from '@/components/ui/EmptyState.vue'
import TableList from '@/components/database/TableList.vue'
import TableDataView from '@/components/database/TableDataView.vue'
import TableStructure from '@/components/database/TableStructure.vue'
import CreateDatabaseModal from '@/components/ui/CreateDatabaseModal.vue'
import CreateTableModal from '@/components/ui/CreateTableModal.vue'

const router = useRouter()
const connectionStore = useConnectionStore()
const uiStore = useUIStore()

// State
const currentDatabase = ref('')
const currentTable = ref('')
const currentView = ref<'list' | 'data' | 'structure'>('list')
const loading = ref(false)
const tablesLoading = ref(false)
const showCreateDatabaseModal = ref(false)
const showCreateTableModal = ref(false)

// Table data state
const tableData = ref<any[]>([])
const tableColumns = ref<Array<{ name: string; type: string }>>([])
const tableTotalRows = ref(0)
const tableSize = ref(0)
const tableDataLoading = ref(false)
const tableDataError = ref('')

// Table structure state
const tableStructure = ref<any[]>([])
const tableInfo = ref<any>(null)
const tableStructureLoading = ref(false)

// Pagination state
const currentPage = ref(1)
const pageSize = ref(50)
const sortColumn = ref('')
const sortDirection = ref<'asc' | 'desc'>('asc')
const searchTerm = ref('')

// Computed
const isConnected = computed(() => connectionStore.isConnected)
const currentConnection = computed(() => connectionStore.currentConnection)
const databases = computed(() => connectionStore.databases)
const tables = computed(() => connectionStore.tables)

const pageTitle = computed(() => {
  if (!currentDatabase.value) return 'Database Explorer'
  if (!currentTable.value) return `Database: ${currentDatabase.value}`
  
  switch (currentView.value) {
    case 'list':
      return `Tables in ${currentDatabase.value}`
    case 'data':
      return `Data: ${currentTable.value}`
    case 'structure':
      return `Structure: ${currentTable.value}`
    default:
      return `Table: ${currentTable.value}`
  }
})

// Methods
function getTableName(table: any): string {
  if (typeof table === 'string') return table
  if (table.name) return table.name
  // Handle different MySQL table object formats
  const keys = Object.keys(table)
  const tableKey = keys.find(key => key.startsWith('Tables_in_'))
  return tableKey ? table[tableKey] : 'Unknown'
}

async function refreshDatabases() {
  loading.value = true
  try {
    await connectionStore.loadDatabases()
  } catch (error) {
    uiStore.showToast('Failed to load databases', 'error')
  } finally {
    loading.value = false
  }
}

async function refreshTables() {
  if (!currentDatabase.value) return
  
  tablesLoading.value = true
  try {
    await connectionStore.loadTables(currentDatabase.value)
  } catch (error) {
    uiStore.showToast('Failed to load tables', 'error')
  } finally {
    tablesLoading.value = false
  }
}

async function selectDatabase(database: string) {
  currentDatabase.value = database
  currentTable.value = ''
  await refreshTables()
}

function selectTable(tableName: string) {
  currentTable.value = tableName
  currentView.value = 'list'
}

async function loadTableData() {
  if (!currentDatabase.value || !currentTable.value) return
  
  tableDataLoading.value = true
  tableDataError.value = ''
  
  try {
    const offset = (currentPage.value - 1) * pageSize.value
    const result = await connectionStore.executeQuery(
      `SELECT * FROM \`${currentTable.value}\` LIMIT ${pageSize.value} OFFSET ${offset}`
    )
    
    if (result.success && result.data) {
      tableData.value = result.data
      tableColumns.value = result.fields?.map(field => ({
        name: field.name,
        type: field.type
      })) || []
    } else {
      tableDataError.value = result.message || 'Failed to load table data'
    }
  } catch (error) {
    tableDataError.value = error instanceof Error ? error.message : 'Unknown error occurred'
  } finally {
    tableDataLoading.value = false
  }
}

async function loadTableStructure() {
  if (!currentDatabase.value || !currentTable.value) return
  
  tableStructureLoading.value = true
  
  try {
    const result = await connectionStore.executeQuery(
      `DESCRIBE \`${currentTable.value}\``
    )
    
    if (result.success && result.data) {
      tableStructure.value = result.data
    }
    
    // Get table info
    const infoResult = await connectionStore.executeQuery(
      `SELECT 
        table_rows as Rows,
        data_length as Data_length,
        engine as Engine,
        table_collation as Collation
       FROM information_schema.tables 
       WHERE table_schema = '${currentDatabase.value}' AND table_name = '${currentTable.value}'`
    )
    
    if (infoResult.success && infoResult.data && infoResult.data.length > 0) {
      tableInfo.value = infoResult.data[0]
      tableTotalRows.value = infoResult.data[0].Rows || 0
      tableSize.value = infoResult.data[0].Data_length || 0
    }
  } catch (error) {
    console.error('Failed to load table structure:', error)
  } finally {
    tableStructureLoading.value = false
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadTableData()
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  loadTableData()
}

function handleSort(column: string, direction: 'asc' | 'desc') {
  sortColumn.value = column
  sortDirection.value = direction
  loadTableData()
}

function handleSearch(term: string) {
  searchTerm.value = term
  currentPage.value = 1
  loadTableData()
}

async function exportTableData(tableName: string) {
  try {
    const result = await connectionStore.executeQuery(
      `SELECT * FROM \`${tableName}\``
    )
    
    if (result.success && result.data) {
      const headers = result.fields?.map(field => field.name) || []
      await window.electronAPI.fileSystem.exportData({
        rows: result.data,
        headers
      })
      
      uiStore.showToast({
        title: 'Export successful',
        message: `Exported ${result.data.length} rows from ${tableName}`,
        type: 'success'
      })
    }
  } catch (error) {
    uiStore.showToast({
      title: 'Export failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      type: 'error'
    })
  }
}

async function duplicateTable(tableName: string) {
  const newTableName = `${tableName}_copy_${Date.now()}`
  
  try {
    const result = await connectionStore.executeQuery(
      `CREATE TABLE \`${newTableName}\` AS SELECT * FROM \`${tableName}\``
    )
    
    if (result.success) {
      uiStore.showToast({
        title: 'Table duplicated',
        message: `Created ${newTableName} as a copy of ${tableName}`,
        type: 'success'
      })
      await refreshTables()
    }
  } catch (error) {
    uiStore.showToast({
      title: 'Duplication failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      type: 'error'
    })
  }
}

async function deleteTable(tableName: string) {
  if (!confirm(`Are you sure you want to delete the table "${tableName}"? This action cannot be undone.`)) {
    return
  }
  
  try {
    const result = await connectionStore.executeQuery(
      `DROP TABLE \`${tableName}\``
    )
    
    if (result.success) {
      uiStore.showToast({
        title: 'Table deleted',
        message: `Successfully deleted table ${tableName}`,
        type: 'success'
      })
      currentTable.value = ''
      await refreshTables()
    }
  } catch (error) {
    uiStore.showToast({
      title: 'Deletion failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      type: 'error'
    })
  }
}

async function createTable(tableName: string) {
  try {
    const result = await connectionStore.executeQuery(
      `CREATE TABLE \`${tableName}\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    )
    
    if (result.success) {
      uiStore.showToast({
        title: 'Table created',
        message: `Successfully created table ${tableName}`,
        type: 'success'
      })
      await refreshTables()
    }
  } catch (error) {
    uiStore.showToast({
      title: 'Creation failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      type: 'error'
    })
  }
}

async function viewTableStructure() {
  currentView.value = 'structure'
  await loadTableStructure()
}

async function viewTableData() {
  currentView.value = 'data'
  await loadTableData()
}

// Handle database creation
async function handleDatabaseCreated(databaseName: string) {
  showCreateDatabaseModal.value = false
  await refreshDatabases()
  
  // Optionally select the newly created database
  if (databases.value.some(db => db.Database === databaseName)) {
    await selectDatabase(databaseName)
  }
}

// Handle table creation
async function handleTableCreated(tableName: string) {
  showCreateTableModal.value = false
  await refreshTables()
  
  // Optionally select the newly created table
  if (tables.value.some(table => getTableName(table) === tableName)) {
    await selectTable(tableName)
  }
}

// Initialize
onMounted(async () => {
  if (!isConnected.value) {
    router.push('/')
    return
  }
  
  await refreshDatabases()
  
  // Listen for create database modal event
  window.addEventListener('open-create-database-modal', () => {
    showCreateDatabaseModal.value = true
  })
  
  // Listen for create table modal event
  window.addEventListener('open-create-table-modal', () => {
    showCreateTableModal.value = true
  })
})
</script>

<style scoped>
.database-item,
.table-item {
  @apply p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700;
}

.database-item.active,
.table-item.active {
  @apply bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300;
}
</style> 