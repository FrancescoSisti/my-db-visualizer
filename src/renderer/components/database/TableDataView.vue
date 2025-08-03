<template>
  <div class="table-data-view">
    <!-- Header -->
    <div class="data-header">
      <div class="header-info">
        <h3 class="header-title">Table Data: {{ tableName }}</h3>
        <p class="header-subtitle">
          {{ totalRows.toLocaleString() }} rows • {{ formatBytes(tableSize) }}
        </p>
      </div>
      <div class="header-actions">
        <div class="search-box">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search in table..."
            class="search-input"
            @input="handleSearch"
          />
        </div>
        <button
          @click="refreshData"
          class="btn-secondary"
          :disabled="loading"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
        <button
          @click="exportData"
          class="btn-primary"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="data-loading">
      <div class="loading-spinner">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="loading-text">Loading table data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="data-error">
      <div class="error-content">
        <svg class="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="error-title">Failed to load data</h3>
        <p class="error-message">{{ error }}</p>
        <button @click="refreshData" class="btn-primary">
          Try Again
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div v-else class="data-table-container">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th
                v-for="column in columns"
                :key="column.name"
                class="table-header"
                :class="{ 'sortable': true, 'sorted': sortColumn === column.name }"
                @click="sortBy(column.name)"
              >
                <div class="header-content">
                  <span class="header-text">{{ column.name }}</span>
                  <div class="sort-indicator">
                    <svg
                      v-if="sortColumn === column.name"
                      class="w-4 h-4"
                      :class="sortDirection === 'asc' ? 'rotate-180' : ''"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in paginatedData"
              :key="`${currentPage}-${index}`"
              class="table-row"
              :class="{ 'even': index % 2 === 0 }"
            >
              <td
                v-for="column in columns"
                :key="column.name"
                class="table-cell"
              >
                <div class="cell-content">
                  <span class="cell-value">{{ formatCellValue(row[column.name]) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="!paginatedData.length && !loading" class="data-empty">
        <div class="empty-content">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="empty-title">No data found</h3>
          <p class="empty-description">
            {{ searchTerm ? 'No rows match your search criteria.' : 'This table is empty.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <div class="pagination-info">
        <span class="pagination-text">
          Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ filteredData.length }} rows
        </span>
      </div>
      <div class="pagination-controls">
        <button
          @click="goToPage(1)"
          class="pagination-btn"
          :disabled="currentPage === 1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <button
          @click="goToPage(currentPage - 1)"
          class="pagination-btn"
          :disabled="currentPage === 1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            class="page-btn"
            :class="{ 'active': page === currentPage }"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="goToPage(currentPage + 1)"
          class="pagination-btn"
          :disabled="currentPage === totalPages"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          @click="goToPage(totalPages)"
          class="pagination-btn"
          :disabled="currentPage === totalPages"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <div class="pagination-size">
        <label class="size-label">Rows per page:</label>
        <select v-model="pageSize" class="size-select" @change="handlePageSizeChange">
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="250">250</option>
          <option value="500">500</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { debounce } from 'lodash-es'

interface Column {
  name: string
  type: string
}

interface Props {
  databaseName: string
  tableName: string
  columns: Column[]
  data: any[]
  totalRows: number
  tableSize: number
  loading?: boolean
  error?: string
}

interface Emits {
  (e: 'refresh'): void
  (e: 'export'): void
  (e: 'page-change', page: number): void
  (e: 'page-size-change', size: number): void
  (e: 'sort', column: string, direction: 'asc' | 'desc'): void
  (e: 'search', term: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const currentPage = ref(1)
const pageSize = ref(50)
const searchTerm = ref('')
const sortColumn = ref('')
const sortDirection = ref<'asc' | 'desc'>('asc')
const filteredData = ref<any[]>([])

// Computed
const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value))

const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, filteredData.value.length))

const paginatedData = computed(() => {
  return filteredData.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  const halfVisible = Math.floor(maxVisible / 2)
  
  let start = Math.max(1, currentPage.value - halfVisible)
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
function formatCellValue(value: any): string {
  if (value === null || value === undefined) {
    return '<null>'
  }
  
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  
  return String(value)
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

function refreshData() {
  emit('refresh')
}

function exportData() {
  emit('export')
}

function sortBy(column: string) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
  
  emit('sort', column, sortDirection.value)
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    emit('page-change', page)
  }
}

function handlePageSizeChange() {
  currentPage.value = 1
  emit('page-size-change', pageSize.value)
}

const handleSearch = debounce(() => {
  emit('search', searchTerm.value)
}, 300)

// Watchers
watch(() => props.data, (newData) => {
  filteredData.value = [...newData]
}, { immediate: true })

watch(() => props.error, (newError) => {
  if (newError) {
    currentPage.value = 1
  }
})

// Lifecycle
onMounted(() => {
  // Initialize with first page
  emit('page-change', 1)
  emit('page-size-change', pageSize.value)
})
</script>

<style scoped>
.table-data-view {
  @apply h-full flex flex-col;
}

.data-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.header-info {
  @apply flex flex-col;
}

.header-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.header-subtitle {
  @apply text-sm text-gray-500 dark:text-gray-400 mt-1;
}

.header-actions {
  @apply flex items-center space-x-3;
}

.search-box {
  @apply relative flex items-center;
}

.search-box svg {
  @apply absolute left-3 text-gray-400;
}

.search-input {
  @apply pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm;
  min-width: 250px;
}

.data-loading {
  @apply flex-1 flex items-center justify-center;
}

.loading-spinner {
  @apply flex flex-col items-center space-y-3;
}

.loading-text {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.data-error {
  @apply flex-1 flex items-center justify-center;
}

.error-content {
  @apply text-center max-w-md mx-auto;
}

.error-title {
  @apply text-lg font-medium text-gray-900 dark:text-white mt-4;
}

.error-message {
  @apply text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6;
}

.data-table-container {
  @apply flex-1 overflow-hidden;
}

.table-wrapper {
  @apply h-full overflow-auto;
}

.data-table {
  @apply min-w-full divide-y divide-gray-200 dark:divide-gray-700;
}

.table-header {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700 sticky top-0;
}

.table-header.sortable {
  @apply cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600;
}

.table-header.sorted {
  @apply bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300;
}

.header-content {
  @apply flex items-center justify-between;
}

.header-text {
  @apply flex-1;
}

.sort-indicator {
  @apply ml-2;
}

.table-row {
  @apply hover:bg-gray-50 dark:hover:bg-gray-700;
}

.table-row.even {
  @apply bg-gray-50 dark:bg-gray-800;
}

.table-cell {
  @apply px-6 py-4 text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700;
}

.cell-content {
  @apply flex items-center;
}

.cell-value {
  @apply truncate max-w-xs;
}

.data-empty {
  @apply flex-1 flex items-center justify-center;
}

.empty-content {
  @apply text-center max-w-md mx-auto;
}

.empty-title {
  @apply text-lg font-medium text-gray-900 dark:text-white mt-4;
}

.empty-description {
  @apply text-sm text-gray-500 dark:text-gray-400 mt-2;
}

.pagination {
  @apply flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800;
}

.pagination-info {
  @apply flex items-center;
}

.pagination-text {
  @apply text-sm text-gray-700 dark:text-gray-300;
}

.pagination-controls {
  @apply flex items-center space-x-2;
}

.pagination-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.page-numbers {
  @apply flex items-center space-x-1;
}

.page-btn {
  @apply px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors;
}

.page-btn.active {
  @apply bg-primary-600 text-white hover:bg-primary-700;
}

.pagination-size {
  @apply flex items-center space-x-2;
}

.size-label {
  @apply text-sm text-gray-700 dark:text-gray-300;
}

.size-select {
  @apply px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm;
}

.btn-primary {
  @apply inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

.btn-secondary {
  @apply inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}
</style> 