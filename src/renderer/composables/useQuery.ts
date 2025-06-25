import { ref, computed, watch } from 'vue'
import { useConnectionStore } from '@/stores/connection'
import { useUIStore } from '@/stores/ui'
import type { 
  QueryTab, 
  QueryHistory, 
  QueryBookmark, 
  QueryExecution,
  AutoCompleteItem 
} from '@/types/query'
import type { QueryResult } from '@/types/database'

export function useQuery() {
  const connectionStore = useConnectionStore()
  const uiStore = useUIStore()

  const tabs = ref<QueryTab[]>([])
  const activeTabId = ref<string>('')
  const history = ref<QueryHistory[]>([])
  const bookmarks = ref<QueryBookmark[]>([])
  const executions = ref<Map<string, QueryExecution>>(new Map())
  const autoCompleteItems = ref<AutoCompleteItem[]>([])

  // Computed
  const activeTab = computed(() => 
    tabs.value.find(tab => tab.id === activeTabId.value)
  )
  
  const isConnected = computed(() => connectionStore.isConnected)
  
  const canExecute = computed(() => 
    isConnected.value && activeTab.value && activeTab.value.content.trim()
  )

  // Initialize
  loadHistoryFromStorage()
  loadBookmarksFromStorage()

  // Watch for changes to save to storage
  watch(history, saveHistoryToStorage, { deep: true })
  watch(bookmarks, saveBookmarksToStorage, { deep: true })

  // Actions
  function createTab(content = '', database?: string): string {
    const id = generateId()
    const tab: QueryTab = {
      id,
      title: `Query ${tabs.value.length + 1}`,
      content,
      database: database || connectionStore.selectedDatabase,
      isModified: false,
      isActive: true
    }

    tabs.value.push(tab)
    setActiveTab(id)
    return id
  }

  function closeTab(id: string) {
    const index = tabs.value.findIndex(tab => tab.id === id)
    if (index === -1) return

    const tab = tabs.value[index]
    
    // Check if tab is modified
    if (tab.isModified) {
      // In a real app, show confirmation dialog
      const confirm = window.confirm('Tab has unsaved changes. Close anyway?')
      if (!confirm) return
    }

    tabs.value.splice(index, 1)

    // If closing active tab, select another
    if (id === activeTabId.value) {
      if (tabs.value.length > 0) {
        const newIndex = Math.min(index, tabs.value.length - 1)
        setActiveTab(tabs.value[newIndex].id)
      } else {
        activeTabId.value = ''
      }
    }
  }

  function setActiveTab(id: string) {
    // Mark all tabs as inactive
    tabs.value.forEach(tab => tab.isActive = false)
    
    // Mark selected tab as active
    const tab = tabs.value.find(tab => tab.id === id)
    if (tab) {
      tab.isActive = true
      activeTabId.value = id
    }
  }

  function updateTabContent(id: string, content: string) {
    const tab = tabs.value.find(tab => tab.id === id)
    if (tab) {
      tab.content = content
      tab.isModified = true
    }
  }

  function saveTab(id: string) {
    const tab = tabs.value.find(tab => tab.id === id)
    if (tab) {
      tab.isModified = false
      // In a real app, save to file if filePath exists
    }
  }

  async function executeQuery(query?: string, tabId?: string): Promise<QueryResult | null> {
    if (!isConnected.value) {
      uiStore.showToast('Not connected to database', 'error')
      return null
    }

    const currentTabId = tabId || activeTabId.value
    const currentTab = tabs.value.find(tab => tab.id === currentTabId)
    const queryToExecute = query || currentTab?.content || ''

    if (!queryToExecute.trim()) {
      uiStore.showToast('No query to execute', 'warning')
      return null
    }

    const executionId = generateId()
    const execution: QueryExecution = {
      id: executionId,
      tabId: currentTabId,
      query: queryToExecute,
      startTime: Date.now(),
      status: 'running'
    }

    executions.value.set(executionId, execution)
    uiStore.setLoading(true, 'Executing query...')

    try {
      const result = await connectionStore.executeQuery(queryToExecute)
      const endTime = Date.now()
      const executionTime = endTime - execution.startTime

      if (result.success) {
        const queryResult: QueryResult = {
          columns: result.fields || [],
          rows: result.data || [],
          affectedRows: result.data?.affectedRows,
          insertId: result.data?.insertId,
          executionTime,
          query: queryToExecute
        }

        execution.status = 'completed'
        execution.endTime = endTime
        execution.result = queryResult

        // Add to history
        addToHistory({
          id: generateId(),
          query: queryToExecute,
          database: connectionStore.selectedDatabase || '',
          executionTime,
          timestamp: endTime,
          success: true,
          affectedRows: queryResult.affectedRows
        })

        uiStore.showToast(
          `Query executed successfully (${executionTime}ms)`, 
          'success'
        )

        return queryResult
      } else {
        execution.status = 'error'
        execution.error = result.message
        execution.endTime = endTime

        // Add to history
        addToHistory({
          id: generateId(),
          query: queryToExecute,
          database: connectionStore.selectedDatabase || '',
          executionTime,
          timestamp: endTime,
          success: false,
          error: result.message
        })

        uiStore.showToast(`Query failed: ${result.message}`, 'error')
        return null
      }
    } catch (error) {
      const endTime = Date.now()
      execution.status = 'error'
      execution.error = error instanceof Error ? error.message : 'Unknown error'
      execution.endTime = endTime

      uiStore.showToast(`Query execution error: ${execution.error}`, 'error')
      return null
    } finally {
      uiStore.setLoading(false)
    }
  }

  function addToHistory(item: QueryHistory) {
    history.value.unshift(item)
    
    // Keep only last 100 items
    if (history.value.length > 100) {
      history.value = history.value.slice(0, 100)
    }
  }

  function clearHistory() {
    history.value = []
  }

  function addBookmark(title: string, query: string, tags: string[] = []) {
    const bookmark: QueryBookmark = {
      id: generateId(),
      title,
      query,
      database: connectionStore.selectedDatabase,
      tags,
      created: Date.now(),
      updated: Date.now()
    }

    bookmarks.value.push(bookmark)
    uiStore.showToast('Bookmark added successfully', 'success')
  }

  function removeBookmark(id: string) {
    const index = bookmarks.value.findIndex(bookmark => bookmark.id === id)
    if (index !== -1) {
      bookmarks.value.splice(index, 1)
      uiStore.showToast('Bookmark removed', 'info')
    }
  }

  function loadBookmarkToTab(bookmarkId: string) {
    const bookmark = bookmarks.value.find(b => b.id === bookmarkId)
    if (bookmark) {
      const tabId = createTab(bookmark.query, bookmark.database)
      const tab = tabs.value.find(t => t.id === tabId)
      if (tab) {
        tab.title = bookmark.title
      }
    }
  }

  function formatQuery(query: string): string {
    // Basic SQL formatting
    return query
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ',\n  ')
      .replace(/\s*(SELECT|FROM|WHERE|JOIN|ORDER BY|GROUP BY|HAVING)\s+/gi, '\n$1 ')
      .trim()
  }

  function generateAutoComplete(): AutoCompleteItem[] {
    const items: AutoCompleteItem[] = []

    // Add SQL keywords
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 
      'CREATE', 'DROP', 'ALTER', 'TABLE', 'DATABASE', 'INDEX',
      'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
      'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET',
      'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'LIKE', 'BETWEEN'
    ]

    keywords.forEach(keyword => {
      items.push({
        label: keyword,
        type: 'keyword',
        insertText: keyword
      })
    })

    // Add databases
    connectionStore.databases.forEach(db => {
      items.push({
        label: db.Database,
        type: 'database',
        detail: 'Database'
      })
    })

    // Add tables
    connectionStore.tables.forEach(table => {
      items.push({
        label: table.Tables_in_database || table.name,
        type: 'table',
        detail: 'Table',
        database: connectionStore.selectedDatabase
      })
    })

    return items
  }

  // Storage functions
  function saveHistoryToStorage() {
    localStorage.setItem('query-history', JSON.stringify(history.value))
  }

  function loadHistoryFromStorage() {
    try {
      const saved = localStorage.getItem('query-history')
      if (saved) {
        history.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load query history:', error)
    }
  }

  function saveBookmarksToStorage() {
    localStorage.setItem('query-bookmarks', JSON.stringify(bookmarks.value))
  }

  function loadBookmarksFromStorage() {
    try {
      const saved = localStorage.getItem('query-bookmarks')
      if (saved) {
        bookmarks.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load query bookmarks:', error)
    }
  }

  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  return {
    // State
    tabs,
    activeTabId,
    history,
    bookmarks,
    executions,
    autoCompleteItems,

    // Computed
    activeTab,
    isConnected,
    canExecute,

    // Actions
    createTab,
    closeTab,
    setActiveTab,
    updateTabContent,
    saveTab,
    executeQuery,
    addToHistory,
    clearHistory,
    addBookmark,
    removeBookmark,
    loadBookmarkToTab,
    formatQuery,
    generateAutoComplete
  }
} 