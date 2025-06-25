import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export const useUIStore = defineStore('ui', () => {
  // State
  const isLoading = ref(false)
  const loadingMessage = ref('')
  const toasts = ref<Toast[]>([])
  const isDarkMode = ref(false)
  const sidebarCollapsed = ref(false)

  // Actions
  function setLoading(loading: boolean, message = '') {
    isLoading.value = loading
    loadingMessage.value = message
  }

  function showToast(message: string, type: Toast['type'] = 'info', duration = 5000) {
    const id = Date.now().toString()
    const toast: Toast = {
      id,
      message,
      type,
      duration
    }

    toasts.value.push(toast)

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  function clearToasts() {
    toasts.value = []
  }

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    updateDarkModeClass()
    saveDarkModePreference()
  }

  function setDarkMode(value: boolean) {
    isDarkMode.value = value
    updateDarkModeClass()
    saveDarkModePreference()
  }

  function updateDarkModeClass() {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function saveDarkModePreference() {
    localStorage.setItem('dark-mode', JSON.stringify(isDarkMode.value))
  }

  function loadDarkModePreference() {
    try {
      const saved = localStorage.getItem('dark-mode')
      if (saved !== null) {
        isDarkMode.value = JSON.parse(saved)
      } else {
        // Default to system preference
        isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
    } catch (error) {
      // Default to light mode if error
      isDarkMode.value = false
    }
  }

  function initializeDarkMode() {
    loadDarkModePreference()
    updateDarkModeClass()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      // Only update if user hasn't manually set preference
      const savedPreference = localStorage.getItem('dark-mode')
      if (savedPreference === null) {
        setDarkMode(e.matches)
      }
    })
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed.value))
  }

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed))
  }

  function loadSidebarState() {
    try {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved !== null) {
        sidebarCollapsed.value = JSON.parse(saved)
      }
    } catch (error) {
      sidebarCollapsed.value = false
    }
  }

  // Initialize sidebar state
  loadSidebarState()

  return {
    // State
    isLoading,
    loadingMessage,
    toasts,
    isDarkMode,
    sidebarCollapsed,

    // Actions
    setLoading,
    showToast,
    removeToast,
    clearToasts,
    toggleDarkMode,
    setDarkMode,
    initializeDarkMode,
    toggleSidebar,
    setSidebarCollapsed
  }
}) 