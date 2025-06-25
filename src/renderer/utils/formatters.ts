export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function formatNumber(num: number | string): string {
  const number = typeof num === 'string' ? parseInt(num) : num
  return new Intl.NumberFormat().format(number)
}

export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`
  } else if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(2)}s`
  } else {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0)
    return `${minutes}m ${seconds}s`
  }
}

export function formatDate(date: string | number | Date, format = 'datetime'): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return 'Invalid date'
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }

  if (format === 'datetime') {
    options.hour = '2-digit'
    options.minute = '2-digit'
    options.second = '2-digit'
  } else if (format === 'time') {
    return d.toLocaleTimeString()
  }

  return d.toLocaleDateString(undefined, options)
}

export function formatSqlValue(value: any, type?: string): string {
  if (value === null) return 'NULL'
  if (value === undefined) return ''

  // Handle different SQL types
  switch (type?.toLowerCase()) {
    case 'varchar':
    case 'char':
    case 'text':
    case 'longtext':
    case 'mediumtext':
    case 'tinytext':
      return `'${value.toString().replace(/'/g, "''")}'`
    
    case 'date':
      return `'${formatDate(value, 'date')}'`
    
    case 'datetime':
    case 'timestamp':
      return `'${formatDate(value, 'datetime')}'`
    
    case 'time':
      return `'${formatDate(value, 'time')}'`
    
    case 'boolean':
    case 'tinyint':
      return value ? '1' : '0'
    
    case 'json':
      try {
        return `'${JSON.stringify(value).replace(/'/g, "''")}'`
      } catch {
        return `'${value.toString().replace(/'/g, "''")}'`
      }
    
    default:
      if (typeof value === 'string') {
        return `'${value.replace(/'/g, "''")}'`
      }
      return value.toString()
  }
}

export function formatTableName(name: string, database?: string): string {
  if (database) {
    return `\`${database}\`.\`${name}\``
  }
  return `\`${name}\``
}

export function formatColumnName(name: string): string {
  return `\`${name}\``
}

export function truncateText(text: string, maxLength = 50): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function formatPercentage(value: number, total: number, decimals = 1): string {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

export function formatError(error: any): string {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error) return error.error
  return 'Unknown error occurred'
}

export function formatQuery(query: string): string {
  // Basic SQL formatting
  return query
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',\n  ')
    .replace(/\s*(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|ORDER BY|GROUP BY|HAVING|UNION|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s+/gi, '\n$1 ')
    .replace(/\s*(AND|OR)\s+/gi, '\n  $1 ')
    .trim()
}

export function formatConnectionString(config: {
  host: string
  port: number
  user: string
  database?: string
}): string {
  const { host, port, user, database } = config
  let connectionStr = `${user}@${host}:${port}`
  if (database) {
    connectionStr += `/${database}`
  }
  return connectionStr
}

export function formatJsonValue(value: any): string {
  try {
    if (typeof value === 'string') {
      // Try to parse as JSON first
      const parsed = JSON.parse(value)
      return JSON.stringify(parsed, null, 2)
    }
    return JSON.stringify(value, null, 2)
  } catch {
    return value?.toString() || ''
  }
}

export function formatBinaryValue(value: any): string {
  if (value instanceof ArrayBuffer) {
    return `<Binary data: ${value.byteLength} bytes>`
  }
  if (value instanceof Buffer) {
    return `<Binary data: ${value.length} bytes>`
  }
  return `<Binary data>`
}

export function detectDataType(value: any): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  
  const type = typeof value
  
  if (type === 'object') {
    if (Array.isArray(value)) return 'array'
    if (value instanceof Date) return 'date'
    if (value instanceof ArrayBuffer || value instanceof Buffer) return 'binary'
    return 'object'
  }
  
  if (type === 'string') {
    // Try to detect if it's a JSON string
    try {
      JSON.parse(value)
      return 'json'
    } catch {
      // Check if it looks like a date
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date'
      return 'string'
    }
  }
  
  return type
} 