<template>
  <div class="main-layout">
    <!-- Header -->
    <header class="layout-header">
      <div class="header-content">
        <!-- Logo and title -->
        <div class="header-brand">
          <div class="brand-icon">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c0 2.21 1.79 4 4 4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z" />
            </svg>
          </div>
          <h1 class="brand-title">DB Visualizer Pro Alpha</h1>
        </div>

        <!-- Navigation -->
        <nav class="header-nav" v-if="isConnected">
          <router-link 
            to="/database" 
            class="nav-link"
            :class="{ 'nav-link-active': $route.name === 'database' }"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c0 2.21 1.79 4 4 4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z" />
            </svg>
            Databases
          </router-link>
          
          <router-link 
            to="/query" 
            class="nav-link"
            :class="{ 'nav-link-active': $route.name === 'query' }"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Query Editor
          </router-link>
        </nav>

        <!-- Header actions -->
        <div class="header-actions">
          <!-- Connection status -->
          <div v-if="isConnected" class="connection-status">
            <div class="status-indicator">
              <div class="status-dot"></div>
              <span class="status-text">{{ connectionInfo }}</span>
            </div>
            
            <button 
              @click="handleDisconnect"
              class="disconnect-btn"
              title="Disconnect from database"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          <!-- Dark mode toggle -->
          <button 
            @click="toggleDarkMode"
            class="theme-toggle"
            title="Toggle dark mode"
          >
            <svg v-if="isDarkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="layout-main">
      <slot />
    </main>

    <!-- Loading overlay -->
    <Teleport to="body">
      <div 
        v-if="isLoading" 
        class="loading-overlay"
      >
        <div class="loading-content">
          <LoadingSpinner size="lg" :message="loadingMessage" />
        </div>
      </div>
    </Teleport>

    <!-- Toast container -->
    <Teleport to="body">
      <div class="toast-container">
        <TransitionGroup name="toast">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            class="toast-item"
            :class="getToastClasses(toast.type)"
          >
            <div class="toast-icon">
              <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else-if="toast.type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <svg v-else-if="toast.type === 'warning'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div class="toast-content">
              <p class="toast-message">{{ toast.message }}</p>
            </div>
            
            <button
              @click="removeToast(toast.id)"
              class="toast-close"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useConnectionStore } from '@/stores/connection'
import { useUIStore } from '@/stores/ui'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const router = useRouter()
const connectionStore = useConnectionStore()
const uiStore = useUIStore()

// Computed
const isConnected = computed(() => connectionStore.isConnected)
const currentConnection = computed(() => connectionStore.currentConnection)
const isLoading = computed(() => uiStore.isLoading)
const loadingMessage = computed(() => uiStore.loadingMessage)
const toasts = computed(() => uiStore.toasts)
const isDarkMode = computed(() => uiStore.isDarkMode)

const connectionInfo = computed(() => {
  if (!currentConnection.value) return ''
  const conn = currentConnection.value
  return `${conn.user}@${conn.host}:${conn.port}`
})

// Methods
function handleDisconnect() {
  connectionStore.disconnect()
  uiStore.showToast('Disconnected from database', 'info')
  router.push('/')
}

function toggleDarkMode() {
  uiStore.toggleDarkMode()
}

function removeToast(id: string) {
  uiStore.removeToast(id)
}

function getToastClasses(type: string) {
  const baseClasses = 'toast-base'
  const typeClasses = {
    success: 'toast-success',
    error: 'toast-error',
    warning: 'toast-warning',
    info: 'toast-info'
  }
  return `${baseClasses} ${typeClasses[type as keyof typeof typeClasses] || typeClasses.info}`
}
</script>

<style scoped>
.main-layout {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col;
}

.layout-header {
  @apply bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40;
}

.header-content {
  @apply flex items-center justify-between px-6 py-4 max-w-7xl mx-auto;
}

.header-brand {
  @apply flex items-center space-x-3;
}

.brand-icon {
  @apply flex-shrink-0;
}

.brand-title {
  @apply text-xl font-semibold text-gray-900 dark:text-white;
}

.header-nav {
  @apply flex items-center space-x-1;
}

.nav-link {
  @apply flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200;
}

.nav-link-active {
  @apply bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300;
}

.header-actions {
  @apply flex items-center space-x-4;
}

.connection-status {
  @apply flex items-center space-x-3;
}

.status-indicator {
  @apply flex items-center space-x-2;
}

.status-dot {
  @apply w-2 h-2 bg-green-500 rounded-full;
}

.status-text {
  @apply text-sm text-gray-600 dark:text-gray-300;
}

.disconnect-btn {
  @apply p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700;
}

.theme-toggle {
  @apply p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors;
}

.layout-main {
  @apply flex-1 min-h-0;
}

.loading-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.loading-content {
  @apply bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl;
}

.toast-container {
  @apply fixed top-4 right-4 space-y-2 z-50 max-w-sm;
}

.toast-item {
  @apply flex items-start space-x-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm;
}

.toast-base {
  @apply border;
}

.toast-success {
  @apply bg-green-50/90 border-green-200 text-green-800 dark:bg-green-900/90 dark:border-green-700 dark:text-green-200;
}

.toast-error {
  @apply bg-red-50/90 border-red-200 text-red-800 dark:bg-red-900/90 dark:border-red-700 dark:text-red-200;
}

.toast-warning {
  @apply bg-yellow-50/90 border-yellow-200 text-yellow-800 dark:bg-yellow-900/90 dark:border-yellow-700 dark:text-yellow-200;
}

.toast-info {
  @apply bg-blue-50/90 border-blue-200 text-blue-800 dark:bg-blue-900/90 dark:border-blue-700 dark:text-blue-200;
}

.toast-icon {
  @apply flex-shrink-0 mt-0.5;
}

.toast-content {
  @apply flex-1 min-w-0;
}

.toast-message {
  @apply text-sm font-medium;
}

.toast-close {
  @apply flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity;
}

/* Toast animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style> 