<template>
  <MainLayout>
    <router-view />
  </MainLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import MainLayout from '@/components/layout/MainLayout.vue'

const uiStore = useUIStore()

// Initialize dark mode on mount
onMounted(() => {
  uiStore.initializeDarkMode()
})
</script> 