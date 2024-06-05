const { defineConfig } = require('eslint-define-config')

const eslintrc = defineConfig({
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  globals: {
    sleep: true,
    prettyFormat: true,
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 10,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  parser: 'vue-eslint-parser',
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/consistent-type-imports': 'warn',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': 'off',
    'vue/multi-word-component-names': 'off',
    'no-console': 'warn',
  },
})

module.exports = eslintrc
