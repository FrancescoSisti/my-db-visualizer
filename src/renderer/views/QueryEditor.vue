<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Main Editor Area -->
    <div class="flex-1 flex flex-col">
      <!-- Tab Bar -->
      <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between px-4 py-2">
          <!-- Tabs -->
          <div class="flex items-center space-x-1 overflow-x-auto">
            <div
              v-for="tab in tabs"
              :key="tab.id"
              class="tab"
              :class="{ 'active': tab.isActive }"
              @click="setActiveTab(tab.id)"
            >
              <span class="text-sm font-medium">{{ tab.title }}</span>
              <span v-if="tab.isModified" class="w-1 h-1 bg-orange-500 rounded-full ml-2"></span>
              <button
                @click.stop="closeTab(tab.id)"
                class="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <button
              @click="createNewTab"
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <!-- Toolbar -->
          <div class="flex items-center space-x-2">
            <button
              @click="executeCurrentQuery"
              :disabled="!canExecute"
              class="btn-primary text-sm"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6 4h6M9 18h6" />
              </svg>
              Execute
            </button>
            
            <button
              @click="formatCurrentQuery"
              :disabled="!activeTab"
              class="btn-secondary text-sm"
            >
              Format
            </button>
          </div>
        </div>
      </div>

      <!-- Editor -->
      <div class="flex-1 flex flex-col">
        <div v-if="!activeTab" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Query Tab Open
            </h3>
            <button @click="createNewTab" class="btn-primary">
              New Query Tab
            </button>
          </div>
        </div>

        <div v-else class="flex-1 flex flex-col">
          <!-- Query Input -->
          <div class="flex-1 min-h-0 border-b border-gray-200 dark:border-gray-700">
            <div class="h-full p-4">
              <textarea
                v-model="activeTab.content"
                @input="handleQueryInput"
                @keydown="handleKeyDown"
                class="w-full h-full resize-none bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="-- Write your SQL query here"
                spellcheck="false"
              ></textarea>
            </div>
          </div>

          <!-- Results -->
          <div class="flex-1 min-h-0">
            <div class="h-full flex flex-col">
              <div class="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                    Query Results
                  </h3>
                  <div v-if="lastExecutionTime" class="text-xs text-gray-500 dark:text-gray-400">
                    {{ lastExecutionTime }}ms
                  </div>
                </div>
              </div>

              <div class="flex-1 overflow-auto p-4">
                <div v-if="!queryResult" class="flex items-center justify-center h-full">
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Execute a query to see results here
                  </p>
                </div>

                <div v-else-if="queryResult.rows.length === 0" class="flex items-center justify-center h-full">
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Query executed successfully, but no data returned
                  </p>
                </div>

                <div v-else class="overflow-auto">
                  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th
                          v-for="column in queryResult.columns"
                          :key="column.name"
                          class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                        >
                          {{ column.name }}
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      <tr
                        v-for="(row, index) in queryResult.rows"
                        :key="index"
                        class="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td
                          v-for="column in queryResult.columns"
                          :key="column.name"
                          class="px-4 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap"
                        >
                          {{ row[column.name] }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      <!-- Sidebar Tabs -->
      <div class="flex border-b border-gray-200 dark:border-gray-700">
        <button
          @click="sidebarTab = 'history'"
          :class="sidebarTab === 'history' ? 'sidebar-tab active' : 'sidebar-tab'"
        >
          History
        </button>
        <button
          @click="sidebarTab = 'bookmarks'"
          :class="sidebarTab === 'bookmarks' ? 'sidebar-tab active' : 'sidebar-tab'"
        >
          Bookmarks
        </button>
      </div>

      <!-- History Tab -->
      <div v-if="sidebarTab === 'history'" class="flex-1 overflow-y-auto p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">
            Query History
          </h3>
          <button
            @click="clearHistory"
            class="text-xs text-gray-400 hover:text-red-500"
          >
            Clear
          </button>
        </div>

        <div v-if="history.length === 0" class="text-center py-8">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            No query history
          </p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="item in history.slice(0, 50)"
            :key="item.id"
            class="history-item"
            @click="loadHistoryQuery(item)"
          >
            <p class="text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
              {{ item.query.substring(0, 60) }}{{ item.query.length > 60 ? '...' : '' }}
            </p>
            <div class="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{{ formatDate(item.timestamp) }}</span>
              <span class="mx-2">•</span>
              <span>{{ item.executionTime }}ms</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bookmarks Tab -->
      <div v-if="sidebarTab === 'bookmarks'" class="flex-1 overflow-y-auto p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">
            Bookmarks
          </h3>
          <button
            @click="showBookmarkDialog = true"
            :disabled="!activeTab?.content.trim()"
            class="text-xs btn-primary py-1 px-2"
          >
            Add
          </button>
        </div>

        <div v-if="bookmarks.length === 0" class="text-center py-8">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            No bookmarks saved
          </p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="bookmark in bookmarks"
            :key="bookmark.id"
            class="bookmark-item"
            @click="loadBookmark(bookmark)"
          >
            <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ bookmark.title }}
            </h4>
            <p class="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1 truncate">
              {{ bookmark.query.substring(0, 40) }}{{ bookmark.query.length > 40 ? '...' : '' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bookmark Dialog -->
  <div
    v-if="showBookmarkDialog"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Add Bookmark
      </h3>
      
      <form @submit.prevent="saveBookmark">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              v-model="bookmarkForm.title"
              type="text"
              class="input-field"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (comma separated)
            </label>
            <input
              v-model="bookmarkForm.tags"
              type="text"
              class="input-field"
              placeholder="select, performance, report"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            @click="showBookmarkDialog = false"
            class="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" class="btn-primary">
            Save Bookmark
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@/composables/useQuery'
import { useConnectionStore } from '@/stores/connection'
import { formatDate } from '@/utils/formatters'
import type { QueryResult } from '@/types/database'

const router = useRouter()
const connectionStore = useConnectionStore()

const {
  tabs,
  activeTab,
  history,
  bookmarks,
  canExecute,
  createTab,
  closeTab,
  setActiveTab,
  updateTabContent,
  executeQuery,
  clearHistory,
  addBookmark,
  loadBookmarkToTab,
  formatQuery
} = useQuery()

const sidebarTab = ref<'history' | 'bookmarks'>('history')
const queryResult = ref<QueryResult | null>(null)
const lastExecutionTime = ref(0)
const showBookmarkDialog = ref(false)
const bookmarkForm = ref({
  title: '',
  tags: ''
})

const isConnected = computed(() => connectionStore.isConnected)

function createNewTab() {
  createTab()
}

function handleQueryInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  if (activeTab.value) {
    updateTabContent(activeTab.value.id, target.value)
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault()
    executeCurrentQuery()
  }
}

async function executeCurrentQuery() {
  if (!canExecute.value || !activeTab.value) return

  try {
    const result = await executeQuery()
    if (result) {
      queryResult.value = result
      lastExecutionTime.value = result.executionTime
    }
  } catch (error) {
    console.error('Query execution error:', error)
  }
}

function formatCurrentQuery() {
  if (!activeTab.value) return
  
  const formatted = formatQuery(activeTab.value.content)
  updateTabContent(activeTab.value.id, formatted)
}

function loadHistoryQuery(historyItem: any) {
  createTab(historyItem.query, historyItem.database)
}

function loadBookmark(bookmark: any) {
  loadBookmarkToTab(bookmark.id)
}

function saveBookmark() {
  if (!activeTab.value?.content.trim()) return
  
  const tags = bookmarkForm.value.tags
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
  
  addBookmark(
    bookmarkForm.value.title,
    activeTab.value.content,
    tags
  )
  
  // Reset form
  bookmarkForm.value = { title: '', tags: '' }
  showBookmarkDialog.value = false
}

onMounted(() => {
  if (!isConnected.value) {
    router.push('/')
    return
  }

  if (tabs.value.length === 0) {
    createNewTab()
  }
})
</script>

<style scoped>
.tab {
  @apply flex items-center px-4 py-2 border-b-2 border-transparent cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors;
}

.tab.active {
  @apply border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300;
}

.sidebar-tab {
  @apply flex-1 py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent;
}

.sidebar-tab.active {
  @apply text-primary-600 dark:text-primary-400 border-primary-500;
}

.history-item {
  @apply p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors;
}

.bookmark-item {
  @apply p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors;
}
</style> 