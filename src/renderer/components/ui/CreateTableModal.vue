<template>
  <Modal :is-open="isOpen" @close="$emit('close')" title="Create New Table">
    <div class="space-y-6">
      <!-- Table Name -->
      <div>
        <label for="tableName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Table Name
        </label>
        <input
          id="tableName"
          v-model="form.tableName"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter table name"
          :class="{ 'border-red-500': errors.tableName }"
        />
        <p v-if="errors.tableName" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ errors.tableName }}
        </p>
      </div>

      <!-- Columns -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Columns
          </label>
          <button
            @click="addColumn"
            type="button"
            class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            + Add Column
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="(column, index) in form.columns"
            :key="index"
            class="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md"
          >
            <!-- Column Name -->
            <div class="flex-1">
              <input
                v-model="column.name"
                type="text"
                class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Column name"
                :class="{ 'border-red-500': getColumnError(index, 'name') }"
              />
            </div>

            <!-- Data Type -->
            <div class="w-32">
              <select
                v-model="column.type"
                class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="INT">INT</option>
                <option value="VARCHAR">VARCHAR</option>
                <option value="TEXT">TEXT</option>
                <option value="DATETIME">DATETIME</option>
                <option value="DATE">DATE</option>
                <option value="DECIMAL">DECIMAL</option>
                <option value="BOOLEAN">BOOLEAN</option>
                <option value="JSON">JSON</option>
                <option value="BLOB">BLOB</option>
              </select>
            </div>

            <!-- Length/Precision -->
            <div class="w-20">
              <input
                v-model="column.length"
                type="text"
                class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Length"
              />
            </div>

            <!-- Constraints -->
            <div class="flex items-center space-x-1">
              <input
                v-model="column.notNull"
                type="checkbox"
                class="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span class="text-xs text-gray-600 dark:text-gray-400">NOT NULL</span>
            </div>

            <div class="flex items-center space-x-1">
              <input
                v-model="column.primaryKey"
                type="checkbox"
                class="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                @change="handlePrimaryKeyChange(index)"
              />
              <span class="text-xs text-gray-600 dark:text-gray-400">PK</span>
            </div>

            <div class="flex items-center space-x-1">
              <input
                v-model="column.autoIncrement"
                type="checkbox"
                class="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span class="text-xs text-gray-600 dark:text-gray-400">AI</span>
            </div>

            <!-- Remove Column -->
            <button
              @click="removeColumn(index)"
              type="button"
              class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              title="Remove column"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <p v-if="errors.columns" class="mt-2 text-sm text-red-600 dark:text-red-400">
          {{ errors.columns }}
        </p>
      </div>

      <!-- Table Options -->
      <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Table Options</h4>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="engine" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Storage Engine
            </label>
            <select
              id="engine"
              v-model="form.engine"
              class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="InnoDB">InnoDB</option>
              <option value="MyISAM">MyISAM</option>
              <option value="MEMORY">MEMORY</option>
            </select>
          </div>

          <div>
            <label for="charset" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Character Set
            </label>
            <select
              id="charset"
              v-model="form.charset"
              class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="utf8mb4">utf8mb4</option>
              <option value="utf8">utf8</option>
              <option value="latin1">latin1</option>
            </select>
          </div>
        </div>
      </div>

      <!-- SQL Preview -->
      <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SQL Preview</h4>
        <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          <pre class="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ sqlPreview }}</pre>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          @click="createTable"
          :disabled="isCreating || !isFormValid"
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isCreating" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating...
          </span>
          <span v-else>Create Table</span>
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from './Modal.vue'
import { useUIStore } from '@/stores/ui'

interface Column {
  name: string
  type: string
  length: string
  notNull: boolean
  primaryKey: boolean
  autoIncrement: boolean
}

interface FormData {
  tableName: string
  columns: Column[]
  engine: string
  charset: string
}

interface Errors {
  tableName?: string
  columns?: string
}

const props = defineProps<{
  isOpen: boolean
  databaseName: string
}>()

const emit = defineEmits<{
  close: []
  created: [tableName: string]
}>()

const uiStore = useUIStore()
const isCreating = ref(false)

const form = ref<FormData>({
  tableName: '',
  columns: [
    {
      name: 'id',
      type: 'INT',
      length: '11',
      notNull: true,
      primaryKey: true,
      autoIncrement: true
    }
  ],
  engine: 'InnoDB',
  charset: 'utf8mb4'
})

const errors = ref<Errors>({})

// Validation
const isFormValid = computed(() => {
  return props.databaseName && 
         form.value.tableName.trim() !== '' && 
         form.value.columns.length > 0 &&
         form.value.columns.every(col => col.name.trim() !== '')
})

// SQL Preview
const sqlPreview = computed(() => {
  if (!form.value.tableName.trim()) return '-- Enter table name to see SQL preview'
  
  const columns = form.value.columns
    .filter(col => col.name.trim() !== '')
    .map(col => {
      let definition = `\`${col.name}\` ${col.type}`
      
      if (col.length && col.type !== 'TEXT' && col.type !== 'JSON' && col.type !== 'BLOB') {
        definition += `(${col.length})`
      }
      
      if (col.notNull) {
        definition += ' NOT NULL'
      }
      
      if (col.autoIncrement) {
        definition += ' AUTO_INCREMENT'
      }
      
      return definition
    })
    .join(',\n  ')
  
  const primaryKeys = form.value.columns
    .filter(col => col.primaryKey && col.name.trim() !== '')
    .map(col => `\`${col.name}\``)
  
  let sql = `CREATE TABLE \`${props.databaseName}\`.\`${form.value.tableName}\` (\n  ${columns}`
  
  if (primaryKeys.length > 0) {
    sql += `,\n  PRIMARY KEY (${primaryKeys.join(', ')})`
  }
  
  sql += `\n) ENGINE=${form.value.engine} DEFAULT CHARSET=${form.value.charset};`
  
  return sql
})

// Methods
function addColumn() {
  form.value.columns.push({
    name: '',
    type: 'VARCHAR',
    length: '255',
    notNull: false,
    primaryKey: false,
    autoIncrement: false
  })
}

function removeColumn(index: number) {
  if (form.value.columns.length > 1) {
    form.value.columns.splice(index, 1)
  }
}

function handlePrimaryKeyChange(index: number) {
  // Ensure only one primary key
  if (form.value.columns[index].primaryKey) {
    form.value.columns.forEach((col, i) => {
      if (i !== index) {
        col.primaryKey = false
      }
    })
  }
}

function getColumnError(_index: number, _field: string): string | undefined {
  // Add column-specific validation if needed
  return undefined
}

function validateForm(): boolean {
  errors.value = {}
  
  // Validate table name
  if (!form.value.tableName.trim()) {
    errors.value.tableName = 'Table name is required'
  } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(form.value.tableName)) {
    errors.value.tableName = 'Table name must start with a letter or underscore and contain only letters, numbers, and underscores'
  }
  
  // Validate columns
  if (form.value.columns.length === 0) {
    errors.value.columns = 'At least one column is required'
  } else {
    const emptyColumns = form.value.columns.filter(col => !col.name.trim())
    if (emptyColumns.length > 0) {
      errors.value.columns = 'All columns must have a name'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

async function createTable() {
  if (!validateForm()) return
  
  try {
    isCreating.value = true
    
    const result = await window.electronAPI.database.executeQuery(sqlPreview.value)
    
    if (result.success) {
      uiStore.showToast({
        title: 'Success',
        message: `Table '${form.value.tableName}' created successfully`,
        type: 'success'
      })
      
      emit('created', form.value.tableName)
      resetForm()
    } else {
      uiStore.showToast({
        title: 'Error',
        message: result.message || 'Failed to create table',
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
  form.value = {
    tableName: '',
    columns: [
      {
        name: 'id',
        type: 'INT',
        length: '11',
        notNull: true,
        primaryKey: true,
        autoIncrement: true
      }
    ],
    engine: 'InnoDB',
    charset: 'utf8mb4'
  }
  errors.value = {}
}

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})
</script> 