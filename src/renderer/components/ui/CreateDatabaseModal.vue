<template>
  <Modal :is-open="isOpen" @close="$emit('close')" title="Create New Database">
    <div class="space-y-6">
      <!-- Database Name Input -->
      <div>
        <label for="database-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Database Name
        </label>
        <input
          id="database-name"
          v-model="databaseName"
          type="text"
          class="form-input w-full"
          :class="{ 'border-red-500': nameError }"
          placeholder="Enter database name"
          @input="validateName"
          @keyup.enter="handleCreate"
        />
        <p v-if="nameError" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ nameError }}
        </p>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Database names can contain letters, numbers, and underscores. Must start with a letter.
        </p>
      </div>

      <!-- Character Set Selection -->
      <div>
        <label for="charset" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Character Set
        </label>
        <select
          id="charset"
          v-model="selectedCharset"
          class="form-select w-full"
        >
          <option value="utf8mb4">utf8mb4 (Recommended)</option>
          <option value="utf8">utf8</option>
          <option value="latin1">latin1</option>
          <option value="ascii">ascii</option>
        </select>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          utf8mb4 supports full Unicode including emojis and special characters
        </p>
      </div>

      <!-- Collation Selection -->
      <div>
        <label for="collation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Collation
        </label>
        <select
          id="collation"
          v-model="selectedCollation"
          class="form-select w-full"
        >
          <option value="utf8mb4_unicode_ci">utf8mb4_unicode_ci (Recommended)</option>
          <option value="utf8mb4_general_ci">utf8mb4_general_ci</option>
          <option value="utf8_unicode_ci">utf8_unicode_ci</option>
          <option value="utf8_general_ci">utf8_general_ci</option>
        </select>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Collation determines how strings are compared and sorted
        </p>
      </div>

      <!-- Advanced Options -->
      <div>
        <button
          @click="showAdvanced = !showAdvanced"
          type="button"
          class="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <svg
            class="w-4 h-4 mr-1 transition-transform"
            :class="{ 'rotate-90': showAdvanced }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          Advanced Options
        </button>

        <div v-if="showAdvanced" class="mt-3 space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
          <!-- SQL Mode -->
          <div>
            <label for="sql-mode" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SQL Mode
            </label>
            <select
              id="sql-mode"
              v-model="selectedSqlMode"
              class="form-select w-full"
            >
              <option value="">Default</option>
              <option value="STRICT_TRANS_TABLES">STRICT_TRANS_TABLES</option>
              <option value="NO_ZERO_DATE">NO_ZERO_DATE</option>
              <option value="NO_ZERO_IN_DATE">NO_ZERO_IN_DATE</option>
              <option value="ERROR_FOR_DIVISION_BY_ZERO">ERROR_FOR_DIVISION_BY_ZERO</option>
            </select>
          </div>

          <!-- Create SQL Preview -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SQL Preview
            </label>
            <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              <code class="text-sm text-gray-800 dark:text-gray-200">
                {{ generateSqlPreview() }}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="btn-secondary"
          :disabled="isCreating"
        >
          Cancel
        </button>
        <button
          @click="handleCreate"
          class="btn-primary"
          :disabled="!isValid || isCreating"
        >
          <svg
            v-if="isCreating"
            class="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ isCreating ? 'Creating...' : 'Create Database' }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from './Modal.vue'
import { useUIStore } from '@/stores/ui'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'created', databaseName: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const uiStore = useUIStore()

// Form data
const databaseName = ref('')
const selectedCharset = ref('utf8mb4')
const selectedCollation = ref('utf8mb4_unicode_ci')
const selectedSqlMode = ref('')
const showAdvanced = ref(false)

// State
const isCreating = ref(false)
const nameError = ref('')

// Computed
const isValid = computed(() => {
  return databaseName.value.trim() !== '' && !nameError.value
})

// Methods
function validateName() {
  const name = databaseName.value.trim()
  
  if (!name) {
    nameError.value = 'Database name is required'
    return
  }
  
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
    nameError.value = 'Database name must start with a letter and contain only letters, numbers, and underscores'
    return
  }
  
  if (name.length > 64) {
    nameError.value = 'Database name cannot exceed 64 characters'
    return
  }
  
  // Check for reserved words
  const reservedWords = [
    'information_schema', 'mysql', 'performance_schema', 'sys',
    'test', 'tmp', 'temp', 'backup', 'old', 'new'
  ]
  
  if (reservedWords.includes(name.toLowerCase())) {
    nameError.value = 'This name is reserved and cannot be used'
    return
  }
  
  nameError.value = ''
}

function generateSqlPreview(): string {
  const name = databaseName.value.trim()
  if (!name) return ''
  
  let sql = `CREATE DATABASE \`${name}\``
  
  if (selectedCharset.value) {
    sql += ` CHARACTER SET ${selectedCharset.value}`
  }
  
  if (selectedCollation.value) {
    sql += ` COLLATE ${selectedCollation.value}`
  }
  
  return sql + ';'
}

async function handleCreate() {
  if (!isValid.value) return
  
  try {
    isCreating.value = true
    
    const sql = generateSqlPreview()
    const result = await window.electronAPI.database.executeQuery(sql)
    
    if (result.success) {
      uiStore.showToast({
        title: 'Success',
        message: `Database '${databaseName.value}' created successfully`,
        type: 'success'
      })
      
      emit('created', databaseName.value)
      resetForm()
    } else {
      uiStore.showToast({
        title: 'Error',
        message: result.message || 'Failed to create database',
        type: 'error'
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    uiStore.showToast({
      title: 'Error',
      message,
      type: 'error'
    })
  } finally {
    isCreating.value = false
  }
}

function resetForm() {
  databaseName.value = ''
  selectedCharset.value = 'utf8mb4'
  selectedCollation.value = 'utf8mb4_unicode_ci'
  selectedSqlMode.value = ''
  showAdvanced.value = false
  nameError.value = ''
}

// Watch for modal open/close
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})
</script>

<style scoped>
.form-input,
.form-select {
  @apply block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400;
}

.form-input:focus,
.form-select:focus {
  @apply ring-2 ring-primary-500 border-primary-500 dark:ring-primary-400 dark:border-primary-400;
}

.btn-primary {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style> 