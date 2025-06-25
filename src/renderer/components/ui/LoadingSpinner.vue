<template>
  <div class="loading-spinner">
    <div 
      class="animate-spin rounded-full border-b-2"
      :class="[
        sizeClasses,
        colorClasses
      ]"
    ></div>
    <span v-if="message" class="loading-message" :class="textSizeClasses">
      {{ message }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray'
  message?: string
  centered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  centered: true
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }
  return sizes[props.size]
})

const colorClasses = computed(() => {
  const colors = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-600'
  }
  return colors[props.color]
})

const textSizeClasses = computed(() => {
  const sizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }
  return sizes[props.size]
})
</script>

<style scoped>
.loading-spinner {
  @apply flex items-center justify-center space-x-3;
}

.loading-message {
  @apply text-gray-600 dark:text-gray-300;
}
</style> 