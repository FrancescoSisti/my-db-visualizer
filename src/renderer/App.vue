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

// Initialize theme on mount
onMounted(() => {
  uiStore.initializeTheme()
})
</script> 