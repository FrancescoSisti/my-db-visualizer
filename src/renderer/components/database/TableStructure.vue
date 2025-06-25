<template>
  <div class="table-structure">
    <div class="structure-header">
      <h3 class="structure-title">Table Structure: {{ tableName }}</h3>
      <div class="structure-actions">
        <button @click="$emit('refresh')" class="btn-secondary text-sm">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <div v-if="loading" class="structure-loading">
      <LoadingSpinner message="Loading table structure..." />
    </div>

    <div v-else-if="!columns.length" class="structure-empty">
      <p class="text-gray-500 dark:text-gray-400 text-center py-8">
        No columns found for this table
      </p>
    </div>

    <div v-else class="structure-table-wrapper">
      <table class="structure-table">
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Null</th>
            <th>Key</th>
            <th>Default</th>
            <th>Extra</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="column in columns"
            :key="column.Field"
            class="structure-row"
          >
            <td class="column-name">
              <div class="flex items-center space-x-2">
                <svg 
                  v-if="column.Key === 'PRI'" 
                  class="w-4 h-4 text-yellow-500" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                <svg 
                  v-else-if="column.Key === 'UNI'" 
                  class="w-4 h-4 text-blue-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2l-4.257-2.257A6 6 0 0117 9z" />
                </svg>
                <span class="font-medium">{{ column.Field }}</span>
              </div>
            </td>
            <td class="column-type">
              <span class="type-badge">{{ column.Type }}</span>
            </td>
            <td class="column-null">
              <span 
                class="null-badge"
                :class="column.Null === 'YES' ? 'nullable' : 'not-nullable'"
              >
                {{ column.Null }}
              </span>
            </td>
            <td class="column-key">
              <span 
                v-if="column.Key" 
                class="key-badge"
                :class="getKeyClass(column.Key)"
              >
                {{ column.Key }}
              </span>
            </td>
            <td class="column-default">
              <span class="default-value">
                {{ column.Default || '-' }}
              </span>
            </td>
            <td class="column-extra">
              <span class="extra-info">
                {{ column.Extra || '-' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Table Info -->
    <div v-if="tableInfo" class="table-info-section">
      <h4 class="info-title">Table Information</h4>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Engine:</span>
          <span class="info-value">{{ tableInfo.Engine || 'Unknown' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Charset:</span>
          <span class="info-value">{{ tableInfo.Collation || 'Unknown' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Rows:</span>
          <span class="info-value">{{ formatNumber(tableInfo.Rows) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Size:</span>
          <span class="info-value">{{ formatBytes(tableInfo.Data_length) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

interface Column {
  Field: string
  Type: string
  Null: string
  Key: string
  Default: string | null
  Extra: string
}

interface TableInfo {
  Engine?: string
  Collation?: string
  Rows?: number
  Data_length?: number
}

interface Props {
  tableName: string
  columns: Column[]
  tableInfo?: TableInfo
  loading?: boolean
}

defineProps<Props>()
defineEmits<{
  refresh: []
}>()

function getKeyClass(key: string) {
  switch (key) {
    case 'PRI':
      return 'key-primary'
    case 'UNI':
      return 'key-unique'
    case 'MUL':
      return 'key-index'
    default:
      return 'key-none'
  }
}

function formatNumber(num?: number) {
  if (!num) return '0'
  return num.toLocaleString()
}

function formatBytes(bytes?: number) {
  if (!bytes) return '0 B'
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
.table-structure {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700;
}

.structure-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.structure-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.structure-actions {
  @apply flex space-x-2;
}

.structure-loading {
  @apply flex items-center justify-center py-12;
}

.structure-empty {
  @apply py-12;
}

.structure-table-wrapper {
  @apply overflow-x-auto;
}

.structure-table {
  @apply min-w-full divide-y divide-gray-200 dark:divide-gray-700;
}

.structure-table thead {
  @apply bg-gray-50 dark:bg-gray-700;
}

.structure-table th {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider;
}

.structure-table tbody {
  @apply bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700;
}

.structure-row {
  @apply hover:bg-gray-50 dark:hover:bg-gray-700;
}

.structure-table td {
  @apply px-6 py-4 text-sm;
}

.column-name {
  @apply font-medium text-gray-900 dark:text-white;
}

.type-badge {
  @apply inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded;
}

.null-badge {
  @apply inline-flex px-2 py-1 text-xs font-medium rounded;
}

.null-badge.nullable {
  @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
}

.null-badge.not-nullable {
  @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
}

.key-badge {
  @apply inline-flex px-2 py-1 text-xs font-medium rounded;
}

.key-primary {
  @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
}

.key-unique {
  @apply bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200;
}

.key-index {
  @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
}

.default-value,
.extra-info {
  @apply text-gray-500 dark:text-gray-400;
}

.table-info-section {
  @apply p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700;
}

.info-title {
  @apply text-md font-medium text-gray-900 dark:text-white mb-4;
}

.info-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4;
}

.info-item {
  @apply flex flex-col space-y-1;
}

.info-label {
  @apply text-xs font-medium text-gray-500 dark:text-gray-400 uppercase;
}

.info-value {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}
</style> 