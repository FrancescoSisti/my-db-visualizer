<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Main Layout -->
    <MainLayout>
      <router-view />
    </MainLayout>

    <!-- Connection Info Modal -->
    <ConnectionInfoModal
      :is-open="showConnectionInfo"
      @close="showConnectionInfo = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from './components/layout/MainLayout.vue'
import ConnectionInfoModal from './components/ui/ConnectionInfoModal.vue'
import { useUIStore } from './stores/ui'
import { useConnectionStore } from './stores/connection'
import { useDatabase } from './composables/useDatabase'

const router = useRouter()
const uiStore = useUIStore()
const connectionStore = useConnectionStore()
const { disconnect } = useDatabase()

const showConnectionInfo = ref(false)

// Handle menu actions from main process
const handleMenuAction = (_event: Electron.IpcRendererEvent, action: string) => {
  console.log(`Menu action received: ${action}`)
  
  switch (action) {
    case 'new-connection':
      router.push('/connection')
      break
      
    case 'recent-connections':
      // Show recent connections modal/sidebar
      uiStore.showToast('Recent connections feature coming soon!', 'info')
      break
      
    case 'connect':
      if (router.currentRoute.value.path !== '/connection') {
        router.push('/connection')
      }
      break
      
    case 'disconnect':
      handleDisconnect()
      break
      
    case 'refresh':
      handleRefresh()
      break
      
    case 'toggle-sidebar':
      uiStore.toggleSidebar()
      break
      
    case 'toggle-dark-mode':
      uiStore.toggleDarkMode()
      break
      
    case 'new-query':
      router.push('/query')
      break
      
    case 'execute-query':
      // Trigger query execution if in query view
      if (router.currentRoute.value.path === '/query') {
        uiStore.showToast('Execute query shortcut triggered', 'info')
      } else {
        router.push('/query')
      }
      break
      
    case 'save-query':
      handleSaveQuery()
      break
      
    case 'load-query':
      handleLoadQuery()
      break
      
    case 'query-history':
      uiStore.showToast('Query history feature coming soon!', 'info')
      break
      
    case 'import-sql':
      handleLoadQuery() // Use same load functionality
      break
      
    case 'export-data':
      handleExportData()
      break
      
    case 'settings':
      uiStore.showToast('Settings feature coming soon!', 'info')
      break
      
    case 'create-database':
      handleCreateDatabase()
      break
      
    case 'connection-info':
      handleConnectionInfo()
      break
      
    case 'performance-monitor':
      uiStore.showToast('Performance monitor feature coming soon!', 'info')
      break
      
    case 'connection-logs':
      uiStore.showToast('Connection logs feature coming soon!', 'info')
      break
      
    case 'database-schema':
      uiStore.showToast('Database schema visualization coming soon!', 'info')
      break
      
    case 'generate-er-diagram':
      uiStore.showToast('ER diagram generation coming soon!', 'info')
      break
      
    case 'documentation':
      uiStore.showToast('Documentation feature coming soon!', 'info')
      break
      
    case 'keyboard-shortcuts':
      showKeyboardShortcuts()
      break
      
    case 'check-updates':
      uiStore.showToast('Update checking feature coming soon!', 'info')
      break
      
    case 'about':
      showAboutDialog()
      break
      
    default:
      console.log(`Unhandled menu action: ${action}`)
  }
}

const handleDisconnect = async () => {
  if (connectionStore.isConnected) {
    try {
      await disconnect()
      uiStore.showToast('Disconnected from database', 'success')
      router.push('/connection')
    } catch (error) {
      uiStore.showToast('Error disconnecting from database', 'error')
    }
  } else {
    uiStore.showToast('No active connection to disconnect', 'warning')
  }
}

const handleRefresh = () => {
  const currentRoute = router.currentRoute.value.path
  
  if (currentRoute === '/database' && connectionStore.isConnected) {
    // Refresh database view
    window.location.reload()
  } else if (currentRoute === '/connection') {
    // Clear form or reload connection history
    uiStore.showToast('Connection view refreshed', 'info')
  } else {
    // Generic refresh
    window.location.reload()
  }
}

const handleSaveQuery = async () => {
  try {
    // Get current query content from route
    const currentRoute = router.currentRoute.value.path
    
    if (currentRoute !== '/query') {
      uiStore.showToast('Please open Query Editor first', 'warning')
      return
    }

    // Get query content from local storage or active tab
    const queryContent = localStorage.getItem('current-query') || ''
    
    if (!queryContent.trim()) {
      uiStore.showToast('No query to save', 'warning')
      return
    }

    const result = await window.electronAPI.fileSystem.saveQuery({
      content: queryContent,
      title: 'Untitled Query'
    })

    if (result.success) {
      uiStore.showToast(`Query saved to ${result.path}`, 'success')
    } else {
      uiStore.showToast(result.message || 'Failed to save query', 'error')
    }
  } catch (error) {
    uiStore.showToast('Error saving query', 'error')
  }
}

const handleLoadQuery = async () => {
  try {
    const result = await window.electronAPI.fileSystem.loadQuery()

    if (result.success && result.content) {
      // Store loaded content in localStorage
      localStorage.setItem('current-query', result.content)
      
      // Navigate to query editor if not already there
      if (router.currentRoute.value.path !== '/query') {
        await router.push('/query')
      }
      
      // Trigger event to update query editor
      window.dispatchEvent(new CustomEvent('query-loaded', { 
        detail: { 
          content: result.content, 
          filename: result.filename 
        } 
      }))
      
      uiStore.showToast(`Query loaded from ${result.filename}`, 'success')
    } else {
      if (result.message !== 'Load cancelled') {
        uiStore.showToast(result.message || 'Failed to load query', 'error')
      }
    }
  } catch (error) {
    uiStore.showToast('Error loading query', 'error')
  }
}

const handleExportData = async () => {
  try {
    // Get data from current view
    const currentRoute = router.currentRoute.value.path
    
    if (currentRoute === '/database') {
      // Export table data
      const tableData = JSON.parse(localStorage.getItem('current-table-data') || '[]')
      const headers = JSON.parse(localStorage.getItem('current-table-headers') || '[]')
      
      if (tableData.length === 0) {
        uiStore.showToast('No data to export. Please select a table first.', 'warning')
        return
      }

      const result = await window.electronAPI.fileSystem.exportData({
        rows: tableData,
        headers: headers
      })

      if (result.success) {
        // Update export counter
        const currentCount = parseInt(localStorage.getItem('data-exported') || '0')
        localStorage.setItem('data-exported', (currentCount + (result.recordsExported || 0)).toString())
        
        uiStore.showToast(`${result.recordsExported} records exported to ${result.path}`, 'success')
      } else {
        if (result.message !== 'Export cancelled') {
          uiStore.showToast(result.message || 'Failed to export data', 'error')
        }
      }
    } else if (currentRoute === '/query') {
      // Export query results
      const queryResults = JSON.parse(localStorage.getItem('query-results') || '[]')
      
      if (queryResults.length === 0) {
        uiStore.showToast('No query results to export. Execute a query first.', 'warning')
        return
      }

      const result = await window.electronAPI.fileSystem.exportData({
        rows: queryResults,
        headers: Object.keys(queryResults[0] || {})
      })

      if (result.success) {
        uiStore.showToast(`${result.recordsExported} records exported to ${result.path}`, 'success')
      } else {
        if (result.message !== 'Export cancelled') {
          uiStore.showToast(result.message || 'Failed to export data', 'error')
        }
      }
    } else {
      uiStore.showToast('Please navigate to Database or Query view to export data', 'info')
    }
  } catch (error) {
    uiStore.showToast('Error exporting data', 'error')
  }
}

const handleConnectionInfo = () => {
  if (connectionStore.isConnected) {
    showConnectionInfo.value = true
  } else {
    uiStore.showToast('No active database connection', 'warning')
  }
}

const handleCreateDatabase = () => {
  if (!connectionStore.isConnected) {
    uiStore.showToast('Please connect to a database first', 'warning')
    router.push('/connection')
    return
  }
  
  // Navigate to database view and trigger create database modal
  if (router.currentRoute.value.path !== '/database') {
    router.push('/database')
  }
  
  // Dispatch event to open create database modal
  window.dispatchEvent(new CustomEvent('open-create-database-modal'))
}

const showKeyboardShortcuts = () => {
  const shortcuts = [
    'Ctrl+N - New Connection',
    'Ctrl+Shift+C - Connect',
    'Ctrl+Shift+D - Disconnect',
    'F5 - Refresh',
    'Ctrl+T - New Query',
    'Ctrl+Enter - Execute Query',
    'Ctrl+S - Save Query',
    'Ctrl+O - Load Query',
    'Ctrl+H - Query History',
    'Ctrl+B - Toggle Sidebar',
    'Ctrl+Shift+T - Toggle Dark Mode',
    'F11 - Full Screen'
  ]
  
  uiStore.showToast({
    title: 'Keyboard Shortcuts',
    message: shortcuts.join('\n'),
    type: 'info'
  })
}

const showAboutDialog = () => {
  uiStore.showToast({
    title: 'DB Visualizer Pro Alpha',
    message: '🚀 Version: 0.1.0-alpha\n\nA modern database visualization tool built with Vue.js, TypeScript, and Electron.\n\n✨ Features:\n• MySQL connectivity\n• Query editor with save/load\n• Data export (CSV/JSON)\n• Professional UI/UX\n• Dark/Light modes\n\n🔧 Built with:\n• Vue.js 3.5.13\n• Electron 33.2.1\n• TypeScript 5.7.2\n\nDeveloped with ❤️',
    type: 'info'
  })
}

onMounted(() => {
  // Listen for menu actions from main process
  if (window.electronAPI) {
    window.electronAPI.onMenuAction(handleMenuAction)
  }
  
  // Initialize dark mode
  uiStore.initializeTheme()
})

onUnmounted(() => {
  // Clean up listeners if needed
  if (window.electronAPI && window.electronAPI.removeAllListeners) {
    window.electronAPI.removeAllListeners('menu-action')
  }
})
</script> 