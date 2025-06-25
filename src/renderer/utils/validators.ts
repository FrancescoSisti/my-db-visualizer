export interface ValidationResult {
  isValid: boolean
  message?: string
}

export function validateDatabaseName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: false, message: 'Database name is required' }
  }

  if (name.length > 64) {
    return { isValid: false, message: 'Database name must be 64 characters or less' }
  }

  // MySQL identifier rules
  const validPattern = /^[a-zA-Z0-9_$]+$/
  if (!validPattern.test(name)) {
    return { isValid: false, message: 'Database name can only contain letters, numbers, underscores, and dollar signs' }
  }

  // Reserved words
  const reservedWords = [
    'DATABASE', 'TABLE', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP',
    'ALTER', 'INDEX', 'VIEW', 'PROCEDURE', 'FUNCTION', 'TRIGGER', 'USER', 'SCHEMA'
  ]

  if (reservedWords.includes(name.toUpperCase())) {
    return { isValid: false, message: 'Database name cannot be a reserved SQL keyword' }
  }

  return { isValid: true }
}

export function validateTableName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: false, message: 'Table name is required' }
  }

  if (name.length > 64) {
    return { isValid: false, message: 'Table name must be 64 characters or less' }
  }

  // MySQL identifier rules
  const validPattern = /^[a-zA-Z0-9_$]+$/
  if (!validPattern.test(name)) {
    return { isValid: false, message: 'Table name can only contain letters, numbers, underscores, and dollar signs' }
  }

  return { isValid: true }
}

export function validateColumnName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: false, message: 'Column name is required' }
  }

  if (name.length > 64) {
    return { isValid: false, message: 'Column name must be 64 characters or less' }
  }

  // MySQL identifier rules
  const validPattern = /^[a-zA-Z0-9_$]+$/
  if (!validPattern.test(name)) {
    return { isValid: false, message: 'Column name can only contain letters, numbers, underscores, and dollar signs' }
  }

  return { isValid: true }
}

export function validateConnectionConfig(config: {
  host: string
  port: number
  user: string
  password: string
}): ValidationResult {
  const { host, port, user, password } = config

  if (!host || host.trim() === '') {
    return { isValid: false, message: 'Host is required' }
  }

  if (!port || port < 1 || port > 65535) {
    return { isValid: false, message: 'Port must be between 1 and 65535' }
  }

  if (!user || user.trim() === '') {
    return { isValid: false, message: 'Username is required' }
  }

  if (!password || password.trim() === '') {
    return { isValid: false, message: 'Password is required' }
  }

  // Validate host format (IP or hostname)
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/
  const hostnamePattern = /^[a-zA-Z0-9.-]+$/

  if (!ipPattern.test(host) && !hostnamePattern.test(host)) {
    return { isValid: false, message: 'Invalid host format' }
  }

  return { isValid: true }
}

export function validateSQL(sql: string): ValidationResult {
  if (!sql || sql.trim() === '') {
    return { isValid: false, message: 'SQL query is required' }
  }

  // Basic SQL injection protection
  const dangerousPatterns = [
    /DROP\s+DATABASE/i,
    /DROP\s+SCHEMA/i,
    /TRUNCATE\s+DATABASE/i,
    /DELETE\s+FROM\s+mysql\./i,
    /UPDATE\s+mysql\./i,
    /INSERT\s+INTO\s+mysql\./i,
    /--\s*$/m, // SQL comments at end of line
    /\/\*.*?\*\//gs // Multi-line comments
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sql)) {
      return { isValid: false, message: 'Potentially dangerous SQL detected' }
    }
  }

  return { isValid: true }
}

export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, message: 'Email is required' }
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    return { isValid: false, message: 'Invalid email format' }
  }

  return { isValid: true }
}

export function validatePassword(password: string): ValidationResult {
  if (!password || password.trim() === '') {
    return { isValid: false, message: 'Password is required' }
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' }
  }

  // Check for at least one uppercase, one lowercase, one number
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)

  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' }
  }

  return { isValid: true }
}

export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim() === '') {
    return { isValid: false, message: 'URL is required' }
  }

  try {
    new URL(url)
    return { isValid: true }
  } catch {
    return { isValid: false, message: 'Invalid URL format' }
  }
}

export function validateFileExtension(filename: string, allowedExtensions: string[]): ValidationResult {
  if (!filename || filename.trim() === '') {
    return { isValid: false, message: 'Filename is required' }
  }

  const extension = filename.split('.').pop()?.toLowerCase()
  
  if (!extension) {
    return { isValid: false, message: 'File must have an extension' }
  }

  if (!allowedExtensions.includes(extension)) {
    return { isValid: false, message: `File extension must be one of: ${allowedExtensions.join(', ')}` }
  }

  return { isValid: true }
}

export function validateJson(jsonString: string): ValidationResult {
  if (!jsonString || jsonString.trim() === '') {
    return { isValid: false, message: 'JSON string is required' }
  }

  try {
    JSON.parse(jsonString)
    return { isValid: true }
  } catch (error) {
    return { isValid: false, message: `Invalid JSON: ${error}` }
  }
}

export function validateNumberRange(value: number, min: number, max: number): ValidationResult {
  if (isNaN(value)) {
    return { isValid: false, message: 'Value must be a number' }
  }

  if (value < min || value > max) {
    return { isValid: false, message: `Value must be between ${min} and ${max}` }
  }

  return { isValid: true }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes to prevent SQL injection
    .trim()
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function validateDataType(value: any, expectedType: string): ValidationResult {
  const actualType = typeof value

  switch (expectedType.toLowerCase()) {
    case 'string':
      if (actualType !== 'string') {
        return { isValid: false, message: 'Value must be a string' }
      }
      break
    
    case 'number':
      if (actualType !== 'number' || isNaN(value)) {
        return { isValid: false, message: 'Value must be a valid number' }
      }
      break
    
    case 'boolean':
      if (actualType !== 'boolean') {
        return { isValid: false, message: 'Value must be a boolean' }
      }
      break
    
    case 'array':
      if (!Array.isArray(value)) {
        return { isValid: false, message: 'Value must be an array' }
      }
      break
    
    case 'object':
      if (actualType !== 'object' || value === null || Array.isArray(value)) {
        return { isValid: false, message: 'Value must be an object' }
      }
      break
    
    case 'date':
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return { isValid: false, message: 'Value must be a valid date' }
      }
      break
  }

  return { isValid: true }
} 