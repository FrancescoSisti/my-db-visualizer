<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div v-if="isOpen" class="modal-backdrop" @click="handleBackdropClick">
        <div class="modal-container" @click.stop>
          <div class="modal-content">
            <!-- Header -->
            <div class="modal-header">
              <h3 class="modal-title">{{ title }}</h3>
              <button
                v-if="showCloseButton"
                @click="closeModal"
                class="modal-close-btn"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="modal-body">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="modal-footer">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  title: string
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  showCloseButton: true,
  closeOnBackdrop: true
})

const emit = defineEmits<Emits>()

function closeModal() {
  emit('close')
}

function handleBackdropClick() {
  if (props.closeOnBackdrop) {
    closeModal()
  }
}
</script>

<style scoped>
.modal-backdrop {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-container {
  @apply w-full max-w-md max-h-full overflow-auto;
}

.modal-content {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-xl;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.modal-close-btn {
  @apply text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors;
}

.modal-body {
  @apply p-6;
}

.modal-footer {
  @apply p-6 border-t border-gray-200 dark:border-gray-700;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}
</style> 