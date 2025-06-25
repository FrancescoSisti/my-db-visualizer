import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

export interface ToastOptions {
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

export const useUIStore = defineStore('ui', () => {
  // State
  const isDarkMode = ref(false)
  const sidebarCollapsed = ref(false)
  const isLoading = ref(false)
  const loadingMessage = ref('')
  const toasts = ref<Toast[]>([])

  // Actions
  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    // Apply to document
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    // Save to localStorage
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebar-collapsed', sidebarCollapsed.value.toString())
  }

  function setLoading(loading: boolean, message?: string) {
    isLoading.value = loading
    loadingMessage.value = message || ''
  }

  function showToast(options: ToastOptions | string, type?: 'success' | 'error' | 'warning' | 'info') {
    let toastOptions: ToastOptions

    if (typeof options === 'string') {
      // Backward compatibility
      toastOptions = {
        title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
        message: options,
        type: type || 'info'
      }
    } else {
      toastOptions = options
    }

    const toast: Toast = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...toastOptions,
      duration: toastOptions.duration || 5000
    }

    toasts.value.push(toast)

    // Auto remove after duration
    setTimeout(() => {
      removeToast(toast.id)
    }, toast.duration)
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  function clearAllToasts() {
    toasts.value = []
  }

  // Initialize theme from localStorage
  function initializeTheme() {
    const savedTheme = localStorage.getItem('theme')
    const savedSidebar = localStorage.getItem('sidebar-collapsed')
    
    if (savedTheme === 'dark') {
      isDarkMode.value = true
      document.documentElement.classList.add('dark')
    } else {
      isDarkMode.value = false
      document.documentElement.classList.remove('dark')
    }

    if (savedSidebar === 'true') {
      sidebarCollapsed.value = true
    }
  }

  // Initialize on store creation
  initializeTheme()

  return {
    // State
    isDarkMode,
    sidebarCollapsed,
    isLoading,
    loadingMessage,
    toasts,

    // Actions
    toggleDarkMode,
    toggleSidebar,
    setLoading,
    showToast,
    removeToast,
    clearAllToasts,
    initializeTheme
  }
}) 