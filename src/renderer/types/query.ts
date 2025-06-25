export interface QueryTab {
  id: string
  title: string
  content: string
  database?: string
  isModified: boolean
  isActive: boolean
  filePath?: string
}

export interface QueryHistory {
  id: string
  query: string
  database: string
  executionTime: number
  timestamp: number
  success: boolean
  error?: string
  affectedRows?: number
}

export interface QueryBookmark {
  id: string
  title: string
  query: string
  database?: string
  tags: string[]
  created: number
  updated: number
}

export interface AutoCompleteItem {
  label: string
  type: 'database' | 'table' | 'column' | 'function' | 'keyword'
  detail?: string
  documentation?: string
  insertText?: string
  database?: string
  table?: string
}

import type { QueryResult } from './database'

export interface QueryExecution {
  id: string
  tabId: string
  query: string
  startTime: number
  endTime?: number
  status: 'running' | 'completed' | 'error' | 'cancelled'
  result?: QueryResult
  error?: string
}

export interface QueryExplanation {
  id: number
  selectType: string
  table: string
  partitions: string
  type: string
  possibleKeys: string
  key: string
  keyLen: number
  ref: string
  rows: number
  filtered: number
  extra: string
}

export interface QueryOptimization {
  query: string
  suggestions: Array<{
    type: 'index' | 'rewrite' | 'structure'
    message: string
    example?: string
    impact: 'low' | 'medium' | 'high'
  }>
  estimatedImprovement?: string
}

export interface SqlSnippet {
  id: string
  title: string
  description: string
  code: string
  category: 'select' | 'insert' | 'update' | 'delete' | 'ddl' | 'function' | 'other'
  tags: string[]
  variables?: Array<{
    name: string
    type: string
    default?: string
    description?: string
  }>
}

export interface QueryTemplate {
  id: string
  name: string
  description: string
  template: string
  variables: Array<{
    name: string
    type: 'string' | 'number' | 'boolean' | 'date' | 'select'
    options?: string[]
    required: boolean
    default?: any
  }>
  category: string
}

export interface QueryValidation {
  isValid: boolean
  errors: Array<{
    line: number
    column: number
    message: string
    severity: 'error' | 'warning' | 'info'
  }>
  warnings: Array<{
    line: number
    column: number
    message: string
    type: 'performance' | 'syntax' | 'deprecated'
  }>
}

export interface QueryFormatOptions {
  keywordCase: 'upper' | 'lower' | 'capitalize'
  indentSize: number
  maxLineLength: number
  commaPosition: 'before' | 'after'
  alignColumns: boolean
  breakBeforeComma: boolean
}

export type QueryResultFormat = 'table' | 'json' | 'csv' | 'xml' | 'chart'

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter'
  xAxis: string
  yAxis: string[]
  groupBy?: string
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
} 