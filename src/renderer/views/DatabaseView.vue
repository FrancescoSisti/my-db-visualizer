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
          {{ connectionInfo }}
        </p>
      </div>

      <!-- Database List -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-4">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Databases ({{ databases.length }})
            </span>
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

          <div v-if="tablesLoading" class="text-center py-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Loading tables...</p>
          </div>

          <div v-else class="space-y-1">
            <div
              v-for="table in tables"
              :key="table.name || table['Tables_in_' + currentDatabase]"
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
              v-if="currentTable"
              @click="viewTableStructure"
              class="btn-secondary text-sm"
            >
              Structure
            </button>
            <button
              v-if="currentTable"
              @click="viewTableData"
              class="btn-primary text-sm"
            >
              Browse Data
            </button>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-hidden">
        <!-- Welcome State -->
        <div v-if="!currentDatabase" class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c0 2.21 1.79 4 4 4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Select a Database
            </h3>
            <p class="text-gray-500 dark:text-gray-400">
              Choose a database from the sidebar to explore its tables and data
            </p>
          </div>
        </div>

        <!-- Database Selected State -->
        <div v-else-if="!currentTable" class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Database: {{ currentDatabase }}
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">
              {{ tables.length }} tables available
            </p>
            <p class="text-sm text-gray-400">
              Select a table from the sidebar to view its structure and data
            </p>
          </div>
        </div>

        <!-- Table Content -->
        <div v-else class="h-full p-6">
          <div v-if="currentView === 'data'" class="h-full">
            <!-- Data view component will go here -->
            <div class="card h-full">
              <h3 class="text-lg font-semibold mb-4">Table Data: {{ currentTable }}</h3>
              <p class="text-gray-500">Data table component will be implemented here</p>
            </div>
          </div>
          
          <div v-else-if="currentView === 'structure'" class="h-full">
            <!-- Structure view component will go here -->
            <div class="card h-full">
              <h3 class="text-lg font-semibold mb-4">Table Structure: {{ currentTable }}</h3>
              <p class="text-gray-500">Table structure component will be implemented here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDatabase } from '@/composables/useDatabase'
import { formatConnectionString } from '@/utils/formatters'
import { useConnectionStore } from '@/stores/connection'

const route = useRoute()
const router = useRouter()
const connectionStore = useConnectionStore()

const {
  currentDatabase,
  tables,
  currentTable,
  loading,
  databases,
  selectDatabase,
  loadTableStructure,
  loadTableData,
  refreshDatabases,
  refreshTables
} = useDatabase()

// Local state
const tablesLoading = ref(false)
const currentView = ref<'data' | 'structure'>('data')

// Computed
const connectionInfo = computed(() => {
  if (connectionStore.currentConnection) {
    return formatConnectionString(connectionStore.currentConnection)
  }
  return 'Not connected'
})

const pageTitle = computed(() => {
  if (currentTable.value) {
    return `Table: ${currentTable.value}`
  }
  if (currentDatabase.value) {
    return `Database: ${currentDatabase.value}`
  }
  return 'Database Explorer'
})

// Methods
function getTableName(table: any): string {
  // Handle different table object formats
  return table.name || 
         table[`Tables_in_${currentDatabase.value}`] || 
         Object.values(table)[0] as string
}

async function selectTable(tableName: string) {
  currentTable.value = tableName
  currentView.value = 'data'
  
  // Load table structure and data
  await Promise.all([
    loadTableStructure(tableName),
    loadTableData(tableName)
  ])
}

function viewTableStructure() {
  currentView.value = 'structure'
}

function viewTableData() {
  currentView.value = 'data'
}

// Initialize
onMounted(async () => {
  // Check if connected
  if (!connectionStore.isConnected) {
    router.push('/')
    return
  }

  // Load databases
  await refreshDatabases()

  // If database specified in route, select it
  const databaseName = route.params.name as string
  if (databaseName && databases.value.some(db => db.Database === databaseName)) {
    await selectDatabase(databaseName)
  }
})
</script>

<style scoped>
.database-item {
  @apply p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700;
}

.database-item.active {
  @apply bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300;
}

.table-item {
  @apply p-2 rounded cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700;
}

.table-item.active {
  @apply bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300;
}
</style> 