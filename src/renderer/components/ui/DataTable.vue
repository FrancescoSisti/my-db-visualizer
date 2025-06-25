<template>
  <div class="data-table-container">
    <!-- Table Header -->
    <div class="table-header">
      <div class="table-info">
        <h3 class="table-title">{{ title }}</h3>
        <p v-if="subtitle" class="table-subtitle">{{ subtitle }}</p>
      </div>
      
      <div class="table-actions">
        <div class="table-search">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="search-input"
          />
        </div>
        
                 <button
           v-if="showRefresh"
           @click="emit('refresh')"
           class="refresh-btn"
           title="Refresh data"
         >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="table-loading">
      <LoadingSpinner message="Loading data..." />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredData.length === 0" class="table-empty">
      <div class="empty-icon">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="empty-title">No data available</h3>
      <p class="empty-message">{{ emptyMessage }}</p>
    </div>

    <!-- Data Table -->
    <div v-else class="table-wrapper custom-scrollbar">
      <table class="data-table">
        <thead class="table-head">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="table-header-cell"
              :class="{ 'sortable': column.sortable }"
              @click="column.sortable && handleSort(column.key)"
            >
              <div class="header-content">
                <span>{{ column.title }}</span>
                <div v-if="column.sortable" class="sort-icons">
                  <svg
                    class="sort-icon"
                    :class="{ 'active': sortBy === column.key && sortOrder === 'asc' }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                  <svg
                    class="sort-icon"
                    :class="{ 'active': sortBy === column.key && sortOrder === 'desc' }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        
        <tbody class="table-body">
          <tr
            v-for="(row, index) in paginatedData"
            :key="index"
            class="table-row"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="table-cell"
            >
              <slot
                :name="`cell-${column.key}`"
                :value="row[column.key]"
                :row="row"
                :column="column"
              >
                {{ formatCellValue(row[column.key], column) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="showPagination && filteredData.length > 0" class="table-pagination">
      <div class="pagination-info">
        Showing {{ startRecord }} to {{ endRecord }} of {{ filteredData.length }} entries
      </div>
      
      <div class="pagination-controls">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          Previous
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
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

export interface Column {
  key: string
  title: string
  sortable?: boolean
  type?: 'string' | 'number' | 'date' | 'boolean'
  width?: string
}

interface Props {
  title: string
  subtitle?: string
  columns: Column[]
  data: Record<string, any>[]
  loading?: boolean
  showRefresh?: boolean
  showPagination?: boolean
  pageSize?: number
  emptyMessage?: string
}

interface Emits {
  (e: 'refresh'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showRefresh: true,
  showPagination: true,
  pageSize: 25,
  emptyMessage: 'No data to display'
})

const emit = defineEmits<Emits>()

// State
const searchQuery = ref('')
const sortBy = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)

// Computed
const filteredData = computed(() => {
  if (!searchQuery.value) return props.data

  const query = searchQuery.value.toLowerCase()
  return props.data.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(query)
    )
  )
})

const sortedData = computed(() => {
  if (!sortBy.value) return filteredData.value

  return [...filteredData.value].sort((a, b) => {
    const aVal = a[sortBy.value]
    const bVal = b[sortBy.value]
    
    if (aVal === bVal) return 0
    
    const result = aVal > bVal ? 1 : -1
    return sortOrder.value === 'asc' ? result : -result
  })
})

const totalPages = computed(() =>
  Math.ceil(filteredData.value.length / props.pageSize)
)

const paginatedData = computed(() => {
  if (!props.showPagination) return sortedData.value
  
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return sortedData.value.slice(start, end)
})

const startRecord = computed(() =>
  filteredData.value.length === 0 ? 0 : (currentPage.value - 1) * props.pageSize + 1
)

const endRecord = computed(() =>
  Math.min(currentPage.value * props.pageSize, filteredData.value.length)
)

const visiblePages = computed(() => {
  const delta = 2
  const range = []
  const start = Math.max(1, currentPage.value - delta)
  const end = Math.min(totalPages.value, currentPage.value + delta)

  for (let i = start; i <= end; i++) {
    range.push(i)
  }

  return range
})

// Methods
function handleSort(column: string) {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
}

function formatCellValue(value: any, column: Column) {
  if (value === null || value === undefined) return '-'
  
  switch (column.type) {
    case 'boolean':
      return value ? 'Yes' : 'No'
    case 'date':
      return new Date(value).toLocaleDateString()
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : value
    default:
      return String(value)
  }
}

function goToPage(page: number) {
  currentPage.value = page
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Reset page when data changes
watch([filteredData], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.data-table-container {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700;
}

.table-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.table-info {
  @apply flex-1;
}

.table-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.table-subtitle {
  @apply text-sm text-gray-500 dark:text-gray-400 mt-1;
}

.table-actions {
  @apply flex items-center space-x-3;
}

.table-search {
  @apply relative;
}

.search-input {
  @apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white;
}

.refresh-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors;
}

.table-loading,
.table-empty {
  @apply flex items-center justify-center py-12;
}

.empty-icon {
  @apply text-gray-400 mb-4;
}

.empty-title {
  @apply text-lg font-medium text-gray-900 dark:text-white mb-2;
}

.empty-message {
  @apply text-gray-500 dark:text-gray-400;
}

.table-wrapper {
  @apply overflow-auto max-h-96;
}

.data-table {
  @apply min-w-full divide-y divide-gray-200 dark:divide-gray-700;
}

.table-head {
  @apply bg-gray-50 dark:bg-gray-700 sticky top-0;
}

.table-header-cell {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider;
}

.table-header-cell.sortable {
  @apply cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors;
}

.header-content {
  @apply flex items-center justify-between;
}

.sort-icons {
  @apply flex flex-col ml-2;
}

.sort-icon {
  @apply w-3 h-3 text-gray-400;
}

.sort-icon.active {
  @apply text-gray-600 dark:text-gray-300;
}

.table-body {
  @apply bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700;
}

.table-row {
  @apply hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors;
}

.table-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white;
}

.table-pagination {
  @apply flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700;
}

.pagination-info {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.pagination-controls {
  @apply flex items-center space-x-2;
}

.pagination-btn {
  @apply px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed;
}

.page-numbers {
  @apply flex space-x-1;
}

.page-btn {
  @apply px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700;
}

.page-btn.active {
  @apply bg-primary-600 text-white border-primary-600;
}
</style> 