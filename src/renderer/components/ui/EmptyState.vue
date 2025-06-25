<template>
  <div class="empty-state">
    <div class="empty-icon">
      <slot name="icon">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8v2m4-2v2" />
        </svg>
      </slot>
    </div>
    
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-description">{{ description }}</p>
    
    <div v-if="$slots.action" class="empty-action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
}

defineProps<Props>()
</script>

<style scoped>
.empty-state {
  @apply flex flex-col items-center justify-center text-center py-12 px-4;
}

.empty-icon {
  @apply text-gray-400 dark:text-gray-500 mb-4;
}

.empty-title {
  @apply text-lg font-medium text-gray-900 dark:text-white mb-2;
}

.empty-description {
  @apply text-gray-500 dark:text-gray-400 max-w-sm;
}

.empty-action {
  @apply mt-4;
}
</style> 