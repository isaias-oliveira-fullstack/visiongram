// Import plugin configs directly to avoid resolution issues with string extends
const vuePlugin = require('eslint-plugin-vue')
const tsEslintPlugin = require('@typescript-eslint/eslint-plugin')
const vueConfig = (vuePlugin && vuePlugin.configs && (vuePlugin.configs['vue3-recommended'] || vuePlugin.configs.recommended)) || {}
const tsConfig = (tsEslintPlugin && tsEslintPlugin.configs && tsEslintPlugin.configs.recommended) || {}

// Remove 'extends' keys from imported configs (flat config disallows 'extends')
if (vueConfig && vueConfig.extends) delete vueConfig.extends
if (tsConfig && tsConfig.extends) delete tsConfig.extends

// Ensure plugin references exist on the same config objects (required by flat config)
if (vueConfig && !vueConfig.plugins) vueConfig.plugins = { vue: vuePlugin }
if (tsConfig && !tsConfig.plugins) tsConfig.plugins = { '@typescript-eslint': tsEslintPlugin }

module.exports = [
  // Apply plugin-provided config objects first
  vueConfig,
  tsConfig,

  // Project-specific overrides and settings
  {
    ignores: ['dist/**', 'node_modules/**', 'public/**', '.eslintrc.cjs', 'eslint.config.cjs', '.eslint-report.json', 'backend/**'],
    languageOptions: {
      // Use vue-eslint-parser for SFCs and delegate script parsing to TypeScript parser
      parser: require('vue-eslint-parser'),
      parserOptions: {
        parser: require('@typescript-eslint/parser'),
        ecmaVersion: 2024,
        sourceType: 'module',
        extraFileExtensions: ['.vue']
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        process: 'readonly'
      }
    },
    plugins: {
      vue: vuePlugin,
      '@typescript-eslint': tsEslintPlugin
    },
    settings: {
      'vue/setup-compiler-macros': true
    },
    rules: {
      // Allow some flexibility for the existing codebase while keeping lint useful
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'vue/no-v-html': 'warn'
    },
    files: ['**/*.js', '**/*.cjs', '**/*.mjs', '**/*.ts', '**/*.mts', '**/*.tsx', '**/*.vue']
  }
]
