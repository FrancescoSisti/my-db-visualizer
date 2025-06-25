export interface DatabaseInfo {
  name: string
  charset: string
  collation: string
  tableCount?: number
  size?: string
}

export interface TableInfo {
  name: string
  engine: string
  rows: number
  dataLength: string
  indexLength: string
  collation: string
  comment: string
  created: string
  updated: string
}

export interface ColumnInfo {
  field: string
  type: string
  null: 'YES' | 'NO'
  key: '' | 'PRI' | 'UNI' | 'MUL'
  default: string | null
  extra: string
  comment: string
}

export interface IndexInfo {
  table: string
  nonUnique: number
  keyName: string
  seqInIndex: number
  columnName: string
  collation: string
  cardinality: number
  subPart: number | null
  packed: string | null
  null: string
  indexType: string
  comment: string
}

export interface ForeignKeyInfo {
  constraintName: string
  tableName: string
  columnName: string
  referencedTableName: string
  referencedColumnName: string
  updateRule: string
  deleteRule: string
}

export interface TriggerInfo {
  trigger: string
  event: string
  table: string
  statement: string
  timing: string
  created: string
  sqlMode: string
  definer: string
}

export interface ViewInfo {
  table: string
  viewDefinition: string
  checkOption: string
  isUpdatable: string
  definer: string
  securityType: string
}

export interface DatabaseStats {
  totalDatabases: number
  totalTables: number
  totalSize: string
  mysqlVersion: string
  uptime: string
}

export interface TableData {
  columns: string[]
  rows: Record<string, any>[]
  totalRows: number
  offset: number
  limit: number
}

export interface QueryResult {
  columns: Array<{
    name: string
    type: string
    length?: number
  }>
  rows: Record<string, any>[]
  affectedRows?: number
  insertId?: number
  executionTime: number
  query: string
}

export interface DatabaseStructure {
  database: string
  tables: Array<{
    name: string
    type: 'table' | 'view'
    columns: ColumnInfo[]
    indexes: IndexInfo[]
    foreignKeys: ForeignKeyInfo[]
    triggers: TriggerInfo[]
  }>
}

export interface ExportOptions {
  format: 'sql' | 'csv' | 'json' | 'xml'
  includeStructure: boolean
  includeData: boolean
  tables: string[]
  whereConditions?: Record<string, string>
  compression?: 'none' | 'gzip' | 'zip'
}

export interface ImportOptions {
  format: 'sql' | 'csv' | 'json'
  file: string
  database: string
  table?: string
  replaceExisting: boolean
  ignoreErrors: boolean
  encoding: string
} 