<template>
  <Modal
    :is-open="isOpen"
    title="Connection Information"
    @close="$emit('close')"
  >
    <div class="space-y-6">
      <!-- Connection Details -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Connection Details
        </h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500 dark:text-gray-400">Host:</span>
            <span class="ml-2 font-medium">{{ connectionInfo.host }}</span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">Port:</span>
            <span class="ml-2 font-medium">{{ connectionInfo.port }}</span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">User:</span>
            <span class="ml-2 font-medium">{{ connectionInfo.user }}</span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">Database:</span>
            <span class="ml-2 font-medium">{{ connectionInfo.database || 'Not selected' }}</span>
          </div>
        </div>
      </div>

      <!-- Connection Status -->
      <div class="bg-green-50 dark:bg-green-900 rounded-lg p-4" v-if="connectionStatus.isActive">
        <h4 class="text-sm font-semibold text-green-900 dark:text-green-100 mb-3">
          Connection Status
        </h4>
        <div class="space-y-2 text-sm">
          <div class="flex items-center">
            <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span class="text-green-800 dark:text-green-200">Active Connection</span>
          </div>
          <div class="text-green-700 dark:text-green-300">
            Connected for {{ formatDuration(connectionStatus.duration) }}
          </div>
          <div class="text-green-700 dark:text-green-300">
            Last ping: {{ connectionStatus.lastPing }}
          </div>
        </div>
      </div>

      <!-- Database Statistics -->
      <div v-if="stats" class="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Database Statistics
        </h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-blue-700 dark:text-blue-300">Databases:</span>
            <span class="ml-2 font-medium">{{ stats.totalDatabases }}</span>
          </div>
          <div>
            <span class="text-blue-700 dark:text-blue-300">Tables:</span>
            <span class="ml-2 font-medium">{{ stats.totalTables }}</span>
          </div>
          <div>
            <span class="text-blue-700 dark:text-blue-300">Queries Executed:</span>
            <span class="ml-2 font-medium">{{ stats.queriesExecuted }}</span>
          </div>
          <div>
            <span class="text-blue-700 dark:text-blue-300">Data Exported:</span>
            <span class="ml-2 font-medium">{{ stats.dataExported }} rows</span>
          </div>
        </div>
      </div>

      <!-- Server Info -->
      <div v-if="serverInfo" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Server Information
        </h4>
        <div class="space-y-2 text-sm">
          <div>
            <span class="text-gray-500 dark:text-gray-400">Version:</span>
            <span class="ml-2 font-medium">{{ serverInfo.version }}</span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">Uptime:</span>
            <span class="ml-2 font-medium">{{ serverInfo.uptime }}</span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">Character Set:</span>
            <span class="ml-2 font-medium">{{ serverInfo.charset }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex space-x-3">
        <Button @click="testConnection" :loading="testing" variant="outline" size="sm">
          Test Connection
        </Button>
        <Button @click="refreshStats" :loading="loading" variant="outline" size="sm">
          Refresh Stats
        </Button>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <Button @click="$emit('close')" variant="primary">
          Close
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Modal from './Modal.vue'
import Button from './Button.vue'
import { useConnectionStore } from '@/stores/connection'
import { useUIStore } from '@/stores/ui'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
defineEmits<Emits>()

const connectionStore = useConnectionStore()
const uiStore = useUIStore()

const loading = ref(false)
const testing = ref(false)
const stats = ref<any>(null)
const serverInfo = ref<any>(null)
const connectionStatus = ref({
  isActive: true,
  duration: 0,
  lastPing: 'Just now'
})

const connectionInfo = computed(() => connectionStore.currentConnection || {})

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

async function testConnection() {
  if (!connectionInfo.value) return
  
  testing.value = true
  try {
    const result = await window.electronAPI.database.ping()
    if (result.success) {
      uiStore.showToast('Connection test successful', 'success')
      connectionStatus.value.lastPing = 'Just now'
    } else {
      uiStore.showToast('Connection test failed', 'error')
    }
  } catch (error) {
    uiStore.showToast('Connection test error', 'error')
  } finally {
    testing.value = false
  }
}

async function refreshStats() {
  loading.value = true
  try {
    // Get database list for count
    const dbResult = await window.electronAPI.database.getDatabases()
    if (dbResult.success) {
      stats.value = {
        totalDatabases: dbResult.data?.length || 0,
        totalTables: connectionStore.tables?.length || 0,
        queriesExecuted: parseInt(localStorage.getItem('queries-executed') || '0'),
        dataExported: parseInt(localStorage.getItem('data-exported') || '0')
      }
    }

    // Mock server info (in real app, get from server)
    serverInfo.value = {
      version: 'MySQL 8.0.x',
      uptime: '15 days, 4 hours',
      charset: 'utf8mb4'
    }
    
    uiStore.showToast('Statistics refreshed', 'success')
  } catch (error) {
    uiStore.showToast('Failed to refresh statistics', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshStats()
  
  // Update connection duration every second
  setInterval(() => {
    connectionStatus.value.duration += 1
  }, 1000)
})
</script> 