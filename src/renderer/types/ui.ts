export interface MenuItem {
  id: string
  label: string
  icon?: string
  shortcut?: string
  action?: () => void
  submenu?: MenuItem[]
  separator?: boolean
  disabled?: boolean
}

export interface ContextMenuPosition {
  x: number
  y: number
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  type?: 'text' | 'number' | 'date' | 'boolean' | 'json' | 'binary'
  formatter?: (value: any, row: any) => string
  copyable?: boolean
  searchable?: boolean
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  startItem: number
  endItem: number
}

export interface SortInfo {
  column: string
  direction: 'asc' | 'desc'
}

export interface FilterInfo {
  column: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greater' | 'less' | 'between' | 'in' | 'isNull' | 'isNotNull'
  value: any
  value2?: any // For 'between' operator
}

export interface SearchInfo {
  query: string
  columns: string[]
  caseSensitive: boolean
  wholeWord: boolean
  regex: boolean
}

export interface WindowState {
  x?: number
  y?: number
  width: number
  height: number
  maximized: boolean
  fullscreen: boolean
}

export interface ThemeConfig {
  name: string
  primaryColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  accentColor: string
  errorColor: string
  warningColor: string
  successColor: string
  borderRadius: number
  fontSize: number
  fontFamily: string
}

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  action: string
  description: string
  category: string
}

export interface PreferencesData {
  theme: 'light' | 'dark' | 'auto'
  language: string
  fontSize: number
  fontFamily: string
  autoSave: boolean
  autoSaveInterval: number
  confirmDelete: boolean
  showLineNumbers: boolean
  wordWrap: boolean
  tabSize: number
  maxHistoryItems: number
  defaultRowLimit: number
  showSystemTables: boolean
  keyboardShortcuts: KeyboardShortcut[]
  recentConnections: number
  compression: boolean
  backupInterval: number
}

export interface SidebarItem {
  id: string
  label: string
  icon: string
  type: 'database' | 'table' | 'view' | 'procedure' | 'function' | 'trigger' | 'folder'
  children?: SidebarItem[]
  expanded?: boolean
  loading?: boolean
  contextMenu?: MenuItem[]
  metadata?: Record<string, any>
}

export interface EditorPosition {
  line: number
  column: number
}

export interface EditorSelection {
  start: EditorPosition
  end: EditorPosition
}

export interface StatusBarInfo {
  connectionStatus: 'connected' | 'disconnected' | 'connecting'
  currentDatabase?: string
  rowsSelected?: number
  totalRows?: number
  executionTime?: number
  cursor?: EditorPosition
  encoding?: string
  lineEnding?: 'lf' | 'crlf'
}

export interface ProgressInfo {
  current: number
  total: number
  message: string
  cancellable: boolean
}

export interface NotificationData {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
  persistent?: boolean
}

export interface TabInfo {
  id: string
  title: string
  type: 'query' | 'table' | 'structure' | 'export' | 'import'
  icon?: string
  closable?: boolean
  modified?: boolean
  active?: boolean
}

export interface DragDropInfo {
  type: string
  data: any
  source: string
  target?: string
  position?: 'before' | 'after' | 'inside'
} 