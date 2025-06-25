<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Main Layout -->
    <MainLayout>
      <router-view />
    </MainLayout>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from './components/layout/MainLayout.vue'
import { useUIStore } from './stores/ui'
import { useConnectionStore } from './stores/connection'
import { useDatabase } from './composables/useDatabase'

const router = useRouter()
const uiStore = useUIStore()
const connectionStore = useConnectionStore()
const { testConnection, connectToDatabase, disconnect } = useDatabase()

// Handle menu actions from main process
const handleMenuAction = (event: Electron.IpcRendererEvent, action: string) => {
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
      uiStore.showToast('Save query feature coming soon!', 'info')
      break
      
    case 'load-query':
      uiStore.showToast('Load query feature coming soon!', 'info')
      break
      
    case 'query-history':
      uiStore.showToast('Query history feature coming soon!', 'info')
      break
      
    case 'import-sql':
      uiStore.showToast('Import SQL feature coming soon!', 'info')
      break
      
    case 'export-data':
      uiStore.showToast('Export data feature coming soon!', 'info')
      break
      
    case 'settings':
      uiStore.showToast('Settings feature coming soon!', 'info')
      break
      
    case 'create-database':
      uiStore.showToast('Create database feature coming soon!', 'info')
      break
      
    case 'connection-info':
      if (connectionStore.isConnected) {
        const info = connectionStore.currentConnection
        uiStore.showToast(`Connected to ${info?.host}:${info?.port}`, 'info')
      } else {
        uiStore.showToast('No active connection', 'warning')
      }
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
    title: 'DB Visualizer Pro',
    message: 'A modern database visualization tool built with Vue.js, TypeScript, and Electron.\n\nVersion: 1.0.0\nDeveloped with ❤️',
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