<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Database Connection
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          Connect to your MySQL database to start exploring and visualizing your data
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Connection Form -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 7v10c0 2.21 3.79 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.79 4 8 4s8-1.79 8-4M4 7c0-2.21 3.79-4 8-4s8 1.79 8 4" />
                </svg>
                New Connection
              </h2>
            </div>

            <form @submit.prevent="handleConnect" class="p-6 space-y-6">
              <!-- Connection Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Connection Name (Optional)
                </label>
                <input
                  v-model="connectionForm.name"
                  type="text"
                  placeholder="My Database"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <!-- Host and Port -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="md:col-span-3">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Host *
                  </label>
                  <input
                    v-model="connectionForm.host"
                    type="text"
                    required
                    placeholder="localhost"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                           placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Port *
                  </label>
                  <input
                    v-model.number="connectionForm.port"
                    type="number"
                    required
                    placeholder="3306"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                           placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
              </div>

              <!-- Username and Password -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username *
                  </label>
                  <input
                    v-model="connectionForm.user"
                    type="text"
                    required
                    placeholder="root"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                           placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div class="relative">
                    <input
                      v-model="connectionForm.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="••••••••"
                      class="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                             placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Database -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Database (Optional)
                </label>
                <input
                  v-model="connectionForm.database"
                  type="text"
                  placeholder="my_database"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         placeholder-gray-400 dark:placeholder-gray-500"
                />
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Leave empty to connect without selecting a specific database
                </p>
              </div>

              <!-- Actions -->
              <div class="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  @click="handleTest"
                  :loading="isConnecting"
                  :disabled="!isFormValid"
                >
                  Test Connection
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  :loading="isConnecting"
                  :disabled="!isFormValid"
                  class="flex-1"
                >
                  Connect
                </Button>
              </div>
            </form>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-8">
          <!-- Connection History -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                <span class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent Connections
                </span>
                <Button
                  v-if="connectionStore.connectionHistory.length > 0"
                  variant="ghost"
                  size="sm"
                  @click="connectionStore.clearHistory"
                  class="text-red-500 hover:text-red-600"
                >
                  Clear
                </Button>
              </h3>
            </div>
            <div class="p-4">
              <div v-if="connectionStore.connectionHistory.length === 0" 
                   class="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No recent connections</p>
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="connection in connectionStore.connectionHistory"
                  :key="`${connection.host}-${connection.port}-${connection.user}`"
                  class="p-3 border border-gray-200 dark:border-gray-600 rounded-lg 
                         hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer
                         transition-colors duration-200 group"
                  @click="loadConnection(connection)"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {{ connectionStore.getConnectionName(connection) }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {{ connection.user }}@{{ connection.host }}:{{ connection.port }}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click.stop="connectionStore.removeFromHistory(connection)"
                      class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-600"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tips -->
          <div class="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 
                      rounded-xl border border-primary-200 dark:border-primary-700">
            <div class="p-4">
              <h3 class="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-3 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Connection Tips
              </h3>
              <div class="space-y-3 text-sm text-primary-800 dark:text-primary-200">
                <div class="flex items-start">
                  <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Ensure your MySQL server is running and accessible</span>
                </div>
                <div class="flex items-start">
                  <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Use 'Test Connection' to verify settings before connecting</span>
                </div>
                <div class="flex items-start">
                  <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Default MySQL port is 3306</span>
                </div>
                <div class="flex items-start">
                  <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Recent connections are saved for quick access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDatabase } from '@/composables/useDatabase'
import { useConnectionStore } from '@/stores/connection'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const database = useDatabase()
const connectionStore = useConnectionStore()

// Form state
const connectionForm = ref({
  name: '',
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: ''
})

const showPassword = ref(false)

// Computed
const isFormValid = computed(() => {
  return connectionForm.value.host && 
         connectionForm.value.port && 
         connectionForm.value.user
})

// Fix per gli spinner: computed properties per i valori boolean
const isConnecting = computed(() => database.isConnecting.value)
const isConnected = computed(() => database.isConnected.value)

// Methods
async function handleTest() {
  const config = {
    host: connectionForm.value.host,
    port: connectionForm.value.port,
    user: connectionForm.value.user,
    password: connectionForm.value.password,
    database: connectionForm.value.database || undefined
  }

  await database.testConnection(config)
}

async function handleConnect() {
  const config = {
    host: connectionForm.value.host,
    port: connectionForm.value.port,
    user: connectionForm.value.user,
    password: connectionForm.value.password,
    database: connectionForm.value.database || undefined
  }

  const success = await database.connect(config)
  
  if (success) {
    // Navigate to database view
    router.push('/database')
  }
}

function loadConnection(connection: any) {
  connectionForm.value = {
    name: '',
    host: connection.host,
    port: connection.port,
    user: connection.user,
    password: '', // Don't auto-fill password for security
    database: connection.database || ''
  }
}
</script> 