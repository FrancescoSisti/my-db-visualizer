<template>
  <div class="table-list">
    <!-- Header -->
    <div class="table-list-header">
      <div class="header-info">
        <h2 class="header-title">Tables in {{ databaseName }}</h2>
        <p class="header-subtitle">{{ tables.length }} tables found</p>
      </div>
      <div class="header-actions">
        <button
          @click="$emit('refresh')"
          class="btn-secondary"
          :disabled="loading"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
        <button
          @click="showCreateTable = true"
          class="btn-primary"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Table
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="table-list-loading">
      <div class="loading-spinner">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="loading-text">Loading tables...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!tables.length" class="table-list-empty">
      <div class="empty-content">
        <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h3 class="empty-title">No tables found</h3>
        <p class="empty-description">
          This database doesn't have any tables yet. Create your first table to get started.
        </p>
        <button
          @click="showCreateTable = true"
          class="btn-primary"
        >
          Create First Table
        </button>
      </div>
    </div>

    <!-- Table Grid -->
    <div v-else class="table-grid">
      <div
        v-for="table in tables"
        :key="getTableName(table)"
        class="table-card"
        :class="{ 'selected': selectedTable === getTableName(table) }"
        @click="selectTable(getTableName(table))"
      >
        <div class="table-card-header">
          <div class="table-icon">
            <svg class="w-5 h-5" :class="getTableColorClass(getTableName(table))" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="table-info">
            <h3 class="table-name">{{ getTableName(table) }}</h3>
            <p class="table-engine">{{ getTableEngine(table) }}</p>
          </div>
          <div class="table-actions">
            <button
              @click.stop="viewTableStructure(getTableName(table))"
              class="action-btn"
              title="View Structure"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              @click.stop="viewTableData(getTableName(table))"
              class="action-btn"
              title="Browse Data"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              @click.stop="showTableMenu(getTableName(table), $event)"
              class="action-btn"
              title="More Options"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        <div class="table-card-body">
          <div class="table-stats">
            <div class="stat-item">
              <span class="stat-label">Rows</span>
              <span class="stat-value">{{ formatNumber(getTableRows(table)) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Size</span>
              <span class="stat-value">{{ getTableSize(table) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Columns</span>
              <span class="stat-value">{{ getTableColumns(table) }}</span>
            </div>
          </div>
        </div>

        <div class="table-card-footer">
          <div class="table-tags">
            <span
              v-if="getTableCollation(table)"
              class="table-tag"
            >
              {{ getTableCollation(table) }}
            </span>
            <span
              v-if="isTableSystem(table)"
              class="table-tag system"
            >
              System
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Context Menu -->
    <div
      v-if="showContextMenu"
      class="context-menu"
      :style="contextMenuStyle"
      @click.stop
    >
      <div class="context-menu-item" @click="viewTableStructure(contextMenuTable)">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        View Structure
      </div>
      <div class="context-menu-item" @click="viewTableData(contextMenuTable)">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Browse Data
      </div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item" @click="exportTableData(contextMenuTable)">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Data
      </div>
      <div class="context-menu-item" @click="duplicateTable(contextMenuTable)">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Duplicate Table
      </div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item danger" @click="deleteTable(contextMenuTable)">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete Table
      </div>
    </div>

    <!-- Create Table Modal -->
    <div v-if="showCreateTable" class="modal-overlay" @click="showCreateTable = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Create New Table</h3>
          <button @click="showCreateTable = false" class="modal-close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Create a new table in the {{ databaseName }} database.
          </p>
          <div class="form-group">
            <label class="form-label">Table Name</label>
            <input
              v-model="newTableName"
              type="text"
              class="form-input"
              placeholder="Enter table name"
              @keyup.enter="createTable"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showCreateTable = false" class="btn-secondary">
            Cancel
          </button>
          <button
            @click="createTable"
            class="btn-primary"
            :disabled="!newTableName.trim()"
          >
            Create Table
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Table } from '@/types/global'
import { useTableInfo } from '@/composables/useTableInfo'

interface Props {
  databaseName: string
  tables: Table[]
  selectedTable?: string
  loading?: boolean
}

interface Emits {
  (e: 'refresh'): void
  (e: 'select-table', tableName: string): void
  (e: 'view-structure', tableName: string): void
  (e: 'view-data', tableName: string): void
  (e: 'export-data', tableName: string): void
  (e: 'duplicate-table', tableName: string): void
  (e: 'delete-table', tableName: string): void
  (e: 'create-table', tableName: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { getTablesStats, formatNumber, formatBytes, isSystemTable, getTableColorClass } = useTableInfo()

// State
const showCreateTable = ref(false)
const newTableName = ref('')
const showContextMenu = ref(false)
const contextMenuTable = ref('')
const contextMenuStyle = ref({
  top: '0px',
  left: '0px'
})
const tableStats = ref<Map<string, any>>(new Map())

// Methods
function getTableName(table: Table): string {
  if (typeof table === 'string') return table
  if (table.name) return table.name
  // Handle different MySQL table object formats
  const keys = Object.keys(table)
  const tableKey = keys.find(key => key.startsWith('Tables_in_'))
  return tableKey ? table[tableKey] : 'Unknown'
}

function getTableEngine(table: Table): string {
  const tableName = getTableName(table)
  const stats = tableStats.value.get(tableName)
  if (stats) {
    return stats.engine
  }
  if (typeof table === 'object' && table.engine) {
    return table.engine
  }
  return 'Unknown'
}

function getTableRows(table: Table): number {
  const tableName = getTableName(table)
  const stats = tableStats.value.get(tableName)
  if (stats) {
    return stats.rows
  }
  if (typeof table === 'object' && table.rows !== undefined) {
    return table.rows
  }
  return 0
}

function getTableSize(table: Table): string {
  const tableName = getTableName(table)
  const stats = tableStats.value.get(tableName)
  if (stats) {
    return stats.size
  }
  if (typeof table === 'object' && table.size) {
    return table.size
  }
  return '0 B'
}

function getTableColumns(table: Table): number {
  const tableName = getTableName(table)
  const stats = tableStats.value.get(tableName)
  if (stats) {
    return stats.columns
  }
  if (typeof table === 'object' && table.columns !== undefined) {
    return table.columns
  }
  return 0
}

function getTableCollation(table: Table): string {
  const tableName = getTableName(table)
  const stats = tableStats.value.get(tableName)
  if (stats) {
    return stats.collation
  }
  if (typeof table === 'object' && table.collation) {
    return table.collation
  }
  return ''
}

function isTableSystem(table: Table): boolean {
  const tableName = getTableName(table)
  return isSystemTable(tableName)
}

function selectTable(tableName: string) {
  emit('select-table', tableName)
}

function viewTableStructure(tableName: string) {
  showContextMenu.value = false
  emit('view-structure', tableName)
}

function viewTableData(tableName: string) {
  showContextMenu.value = false
  emit('view-data', tableName)
}

function exportTableData(tableName: string) {
  showContextMenu.value = false
  emit('export-data', tableName)
}

function duplicateTable(tableName: string) {
  showContextMenu.value = false
  emit('duplicate-table', tableName)
}

function deleteTable(tableName: string) {
  showContextMenu.value = false
  emit('delete-table', tableName)
}

function showTableMenu(tableName: string, event: MouseEvent) {
  event.preventDefault()
  contextMenuTable.value = tableName
  contextMenuStyle.value = {
    top: `${event.clientY}px`,
    left: `${event.clientX}px`
  }
  showContextMenu.value = true
}

function createTable() {
  if (newTableName.value.trim()) {
    emit('create-table', newTableName.value.trim())
    newTableName.value = ''
    showCreateTable.value = false
  }
}

function handleClickOutside() {
  showContextMenu.value = false
}

async function loadTableStats() {
  if (!props.databaseName || !props.tables.length) return
  
  const tableNames = props.tables.map(table => getTableName(table))
  const stats = await getTablesStats(props.databaseName, tableNames)
  
  // Update the stats map
  stats.forEach(stat => {
    tableStats.value.set(stat.name, stat)
  })
}

// Watchers
watch(() => props.tables, () => {
  loadTableStats()
}, { immediate: true })

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadTableStats()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.table-list {
  @apply h-full flex flex-col;
}

.table-list-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.header-info {
  @apply flex flex-col;
}

.header-title {
  @apply text-xl font-semibold text-gray-900 dark:text-white;
}

.header-subtitle {
  @apply text-sm text-gray-500 dark:text-gray-400 mt-1;
}

.header-actions {
  @apply flex items-center space-x-3;
}

.table-list-loading {
  @apply flex-1 flex items-center justify-center;
}

.loading-spinner {
  @apply flex flex-col items-center space-y-3;
}

.loading-text {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.table-list-empty {
  @apply flex-1 flex items-center justify-center;
}

.empty-content {
  @apply text-center max-w-md mx-auto;
}

.empty-title {
  @apply text-lg font-medium text-gray-900 dark:text-white mt-4;
}

.empty-description {
  @apply text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6;
}

.table-grid {
  @apply flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto;
}

.table-card {
  @apply bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 cursor-pointer;
}

.table-card.selected {
  @apply border-primary-500 dark:border-primary-400 ring-2 ring-primary-200 dark:ring-primary-800;
}

.table-card-header {
  @apply flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700;
}

.table-icon {
  @apply p-2 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-lg;
}

.table-info {
  @apply flex-1 ml-3;
}

.table-name {
  @apply text-sm font-medium text-gray-900 dark:text-white truncate;
}

.table-engine {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.table-actions {
  @apply flex items-center space-x-1;
}

.action-btn {
  @apply p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors;
}

.table-card-body {
  @apply p-4;
}

.table-stats {
  @apply grid grid-cols-3 gap-4;
}

.stat-item {
  @apply text-center;
}

.stat-label {
  @apply block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide;
}

.stat-value {
  @apply block text-sm font-semibold text-gray-900 dark:text-white mt-1;
}

.table-card-footer {
  @apply px-4 pb-4;
}

.table-tags {
  @apply flex flex-wrap gap-2;
}

.table-tag {
  @apply inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200;
}

.table-tag.system {
  @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
}

.context-menu {
  @apply fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-48;
}

.context-menu-item {
  @apply flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors;
}

.context-menu-item.danger {
  @apply text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20;
}

.context-menu-divider {
  @apply border-t border-gray-200 dark:border-gray-700 my-1;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.modal-close {
  @apply p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors;
}

.modal-body {
  @apply p-6;
}

.modal-footer {
  @apply flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700;
}

.form-group {
  @apply mb-4;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2;
}

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white;
}

.btn-primary {
  @apply inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

.btn-secondary {
  @apply inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}
</style> 