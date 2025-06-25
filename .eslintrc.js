module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    browser: true
  },
  extends: [
    'eslint:recommended',
    '@vue/eslint-config-typescript/recommended',
    'plugin:vue/vue3-recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    // Vue specific rules
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'error',
    'vue/script-setup-uses-vars': 'error',
    
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'warn',
    
    // General rules
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.d.ts'
  ]
} 