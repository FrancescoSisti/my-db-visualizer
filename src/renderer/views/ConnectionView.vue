<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Database Connection
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Connect to your MySQL database to start managing your data
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Connection Form -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            New Connection
          </h2>
          
          <form @submit.prevent="handleConnect" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Host
              </label>
              <input
                v-model="connectionForm.host"
                type="text"
                placeholder="localhost"
                class="input-field"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Port
              </label>
              <input
                v-model.number="connectionForm.port"
                type="number"
                placeholder="3306"
                min="1"
                max="65535"
                class="input-field"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                v-model="connectionForm.user"
                type="text"
                placeholder="root"
                class="input-field"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                v-model="connectionForm.password"
                type="password"
                placeholder="••••••••"
                class="input-field"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Database (Optional)
              </label>
              <input
                v-model="connectionForm.database"
                type="text"
                placeholder="Database name"
                class="input-field"
              />
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="testConnection"
                :disabled="isTestingConnection"
                class="btn-secondary flex-1"
              >
                <span v-if="isTestingConnection" class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Testing...
                </span>
                <span v-else>Test Connection</span>
              </button>
              
              <button
                type="submit"
                :disabled="isConnecting || !isFormValid"
                class="btn-primary flex-1"
              >
                <span v-if="isConnecting" class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </span>
                <span v-else>Connect</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Connection History -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Recent Connections
          </h2>
          
          <div v-if="connectionHistory.length === 0" class="text-center py-8">
            <div class="text-gray-400 mb-2">
              <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              No recent connections
            </p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="connection in connectionHistory"
              :key="`${connection.host}-${connection.port}-${connection.user}`"
              class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              @click="loadConnection(connection)"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">
                    {{ connection.user }}@{{ connection.host }}:{{ connection.port }}
                  </h3>
                  <p v-if="connection.database" class="text-sm text-gray-500 dark:text-gray-400">
                    Database: {{ connection.database }}
                  </p>
                </div>
                <button
                  @click.stop="removeFromHistory(connection)"
                  class="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Connection Tips -->
      <div class="mt-8 card">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Connection Tips
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0 mt-1">
              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Default MySQL Port</p>
              <p class="text-gray-600 dark:text-gray-300">The standard MySQL port is 3306</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0 mt-1">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Local Development</p>
              <p class="text-gray-600 dark:text-gray-300">Use 'localhost' or '127.0.0.1' for local databases</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0 mt-1">
              <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Test First</p>
              <p class="text-gray-600 dark:text-gray-300">Always test your connection before connecting</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0 mt-1">
              <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Secure Connections</p>
              <p class="text-gray-600 dark:text-gray-300">Your credentials are stored securely locally</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConnectionStore } from '@/stores/connection'
import { useUIStore } from '@/stores/ui'
import { validateConnectionConfig } from '@/utils/validators'
import type { DatabaseConfig } from '@/types/global'

const router = useRouter()
const connectionStore = useConnectionStore()
const uiStore = useUIStore()

// Form state
const connectionForm = ref<DatabaseConfig>({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: ''
})

const isTestingConnection = ref(false)
const isConnecting = ref(false)

// Computed
const connectionHistory = computed(() => connectionStore.connectionHistory)
const isFormValid = computed(() => {
  const result = validateConnectionConfig({
    host: connectionForm.value.host,
    port: connectionForm.value.port,
    user: connectionForm.value.user,
    password: connectionForm.value.password
  })
  return result.isValid
})

// Methods
async function testConnection() {
  if (!isFormValid.value) {
    uiStore.showToast('Please fill in all required fields correctly', 'error')
    return
  }

  isTestingConnection.value = true

  try {
    const result = await connectionStore.testConnection(connectionForm.value)
    
    if (result.success) {
      uiStore.showToast('Connection test successful!', 'success')
    } else {
      uiStore.showToast(`Connection test failed: ${result.message}`, 'error')
    }
  } catch (error) {
    uiStore.showToast(`Connection test error: ${error}`, 'error')
  } finally {
    isTestingConnection.value = false
  }
}

async function handleConnect() {
  if (!isFormValid.value) {
    uiStore.showToast('Please fill in all required fields correctly', 'error')
    return
  }

  isConnecting.value = true

  try {
    const result = await connectionStore.connect(connectionForm.value)
    
    if (result.success) {
      uiStore.showToast('Connected successfully!', 'success')
      
      // Navigate to database view
      if (connectionForm.value.database) {
        router.push(`/database/${connectionForm.value.database}`)
      } else {
        router.push('/database')
      }
    } else {
      uiStore.showToast(`Connection failed: ${result.message}`, 'error')
    }
  } catch (error) {
    uiStore.showToast(`Connection error: ${error}`, 'error')
  } finally {
    isConnecting.value = false
  }
}

function loadConnection(connection: DatabaseConfig) {
  connectionForm.value = { ...connection }
}

function removeFromHistory(connection: DatabaseConfig) {
  connectionStore.removeFromHistory(connection)
  uiStore.showToast('Connection removed from history', 'info')
}

// Initialize
onMounted(() => {
  // If already connected, redirect to database view
  if (connectionStore.isConnected) {
    router.push('/database')
  }
})
</script> 