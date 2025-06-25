<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between px-6 py-4">
        <div class="flex items-center space-x-4">
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            DB Visualizer Pro
          </h1>
          
          <!-- Navigation -->
          <nav class="flex space-x-4">
            <router-link 
              v-if="!isConnected"
              to="/" 
              class="nav-link"
              :class="{ 'nav-link-active': $route.name === 'connection' }"
            >
              Connection
            </router-link>
            
            <router-link 
              v-if="isConnected"
              to="/database" 
              class="nav-link"
              :class="{ 'nav-link-active': $route.name === 'database' }"
            >
              Databases
            </router-link>
            
            <router-link 
              v-if="isConnected"
              to="/query" 
              class="nav-link"
              :class="{ 'nav-link-active': $route.name === 'query' }"
            >
              Query Editor
            </router-link>
          </nav>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- Connection status -->
          <div v-if="isConnected" class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="text-sm text-gray-600 dark:text-gray-300">
              Connected to {{ currentConnection?.host }}
            </span>
          </div>
          
          <!-- Disconnect button -->
          <button 
            v-if="isConnected"
            @click="handleDisconnect"
            class="btn-secondary text-sm"
          >
            Disconnect
          </button>
          
          <!-- Dark mode toggle -->
          <button 
            @click="toggleDarkMode"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <SunIcon v-if="isDarkMode" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <MoonIcon v-else class="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1">
      <router-view />
    </main>
    
    <!-- Loading overlay -->
    <div 
      v-if="isLoading" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-4">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        <span class="text-gray-900 dark:text-white">{{ loadingMessage }}</span>
      </div>
    </div>

    <!-- Toast notifications -->
    <div class="fixed top-4 right-4 space-y-2 z-40">
      <transition-group name="slide-up">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="p-4 rounded-lg shadow-lg max-w-sm"
          :class="{
            'bg-green-100 border border-green-400 text-green-700': toast.type === 'success',
            'bg-red-100 border border-red-400 text-red-700': toast.type === 'error',
            'bg-yellow-100 border border-yellow-400 text-yellow-700': toast.type === 'warning',
            'bg-blue-100 border border-blue-400 text-blue-700': toast.type === 'info'
          }"
        >
          <div class="flex items-center justify-between">
            <span>{{ toast.message }}</span>
            <button 
              @click="removeToast(toast.id)"
              class="ml-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'
import { useConnectionStore } from '@/stores/connection'
import { useUIStore } from '@/stores/ui'

const connectionStore = useConnectionStore()
const uiStore = useUIStore()

// Computed properties
const isConnected = computed(() => connectionStore.isConnected)
const currentConnection = computed(() => connectionStore.currentConnection)
const isLoading = computed(() => uiStore.isLoading)
const loadingMessage = computed(() => uiStore.loadingMessage)
const toasts = computed(() => uiStore.toasts)
const isDarkMode = computed(() => uiStore.isDarkMode)

// Methods
function handleDisconnect() {
  connectionStore.disconnect()
  uiStore.showToast('Disconnected from database', 'info')
}

function toggleDarkMode() {
  uiStore.toggleDarkMode()
}

function removeToast(id: string) {
  uiStore.removeToast(id)
}

// Initialize dark mode on mount
onMounted(() => {
  uiStore.initializeDarkMode()
})
</script>

<style scoped>
.nav-link {
  @apply px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200;
}

.nav-link-active {
  @apply bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300;
}
</style> 