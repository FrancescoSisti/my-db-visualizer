import { ref, computed } from 'vue'
import { useConnectionStore } from '@/stores/connection'

export interface TableStats {
  name: string
  rows: number
  size: string
  engine: string
  collation: string
  columns: number
  isSystem: boolean
}

export function useTableInfo() {
  const connectionStore = useConnectionStore()
  const tableStats = ref<Map<string, TableStats>>(new Map())
  const loading = ref(false)

  // Get table statistics
  async function getTableStats(database: string, tableName: string): Promise<TableStats | null> {
    try {
      const query = `
        SELECT 
          table_rows as rows,
          round(((data_length + index_length) / 1024 / 1024), 2) as size_mb,
          engine,
          table_collation as collation
        FROM information_schema.tables 
        WHERE table_schema = ? AND table_name = ?
      `
      
      const result = await connectionStore.executeQuery(query, [database, tableName])
      
      if (result.success && result.data && result.data.length > 0) {
        const info = result.data[0]
        
        // Get column count
        const columnResult = await connectionStore.executeQuery(
          `SELECT COUNT(*) as column_count FROM information_schema.columns 
           WHERE table_schema = ? AND table_name = ?`,
          [database, tableName]
        )
        
        const columnCount = columnResult.success && columnResult.data 
          ? columnResult.data[0].column_count 
          : 0
        
        const stats: TableStats = {
          name: tableName,
          rows: info.rows || 0,
          size: info.size_mb ? `${info.size_mb} MB` : '0 B',
          engine: info.engine || 'Unknown',
          collation: info.collation || 'Unknown',
          columns: columnCount,
          isSystem: isSystemTable(tableName)
        }
        
        tableStats.value.set(tableName, stats)
        return stats
      }
      
      return null
    } catch (error) {
      console.error('Failed to get table stats:', error)
      return null
    }
  }

  // Get stats for multiple tables
  async function getTablesStats(database: string, tableNames: string[]): Promise<TableStats[]> {
    loading.value = true
    
    try {
      const statsPromises = tableNames.map(tableName => getTableStats(database, tableName))
      const results = await Promise.all(statsPromises)
      
      return results.filter((stat): stat is TableStats => stat !== null)
    } catch (error) {
      console.error('Failed to get tables stats:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  // Check if table is a system table
  function isSystemTable(tableName: string): boolean {
    const systemTables = ['information_schema', 'mysql', 'performance_schema', 'sys']
    return systemTables.some(sysTable => tableName.startsWith(sysTable))
  }

  // Format number with commas
  function formatNumber(num: number): string {
    if (!num) return '0'
    return num.toLocaleString()
  }

  // Format bytes to human readable format
  function formatBytes(bytes: number): string {
    if (!bytes) return '0 B'
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Get table icon based on type
  function getTableIcon(tableName: string): string {
    if (isSystemTable(tableName)) {
      return 'M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z'
    }
    return 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
  }

  // Get table color class based on type
  function getTableColorClass(tableName: string): string {
    if (isSystemTable(tableName)) {
      return 'text-red-500'
    }
    return 'text-green-500'
  }

  // Clear cached stats
  function clearStats(): void {
    tableStats.value.clear()
  }

  // Get cached stats for a table
  function getCachedStats(tableName: string): TableStats | undefined {
    return tableStats.value.get(tableName)
  }

  return {
    // State
    tableStats,
    loading,
    
    // Methods
    getTableStats,
    getTablesStats,
    isSystemTable,
    formatNumber,
    formatBytes,
    getTableIcon,
    getTableColorClass,
    clearStats,
    getCachedStats
  }
} 