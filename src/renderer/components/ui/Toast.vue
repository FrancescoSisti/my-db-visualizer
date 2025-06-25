<template>
  <div
    class="toast"
    :class="toastClasses"
  >
    <div class="toast-icon">
      <component :is="iconComponent" class="w-5 h-5" />
    </div>
    
    <div class="toast-content">
      <p class="toast-message">{{ toast.message }}</p>
    </div>
    
    <button
      @click="$emit('close')"
      class="toast-close"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Toast } from '@/stores/ui'

interface Props {
  toast: Toast
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const toastClasses = computed(() => {
  const baseClasses = 'toast-base'
  const typeClasses = {
    success: 'toast-success',
    error: 'toast-error',
    warning: 'toast-warning',
    info: 'toast-info'
  }
  return `${baseClasses} ${typeClasses[props.toast.type]}`
})

const iconComponent = computed(() => {
  const icons = {
    success: 'CheckCircleIcon',
    error: 'XCircleIcon',
    warning: 'ExclamationTriangleIcon',
    info: 'InformationCircleIcon'
  }
  return icons[props.toast.type]
})
</script>

<style scoped>
.toast {
  @apply flex items-start space-x-3 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300;
}

.toast-base {
  @apply border;
}

.toast-success {
  @apply bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200;
}

.toast-error {
  @apply bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200;
}

.toast-warning {
  @apply bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200;
}

.toast-info {
  @apply bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200;
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
</style> 