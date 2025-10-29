const tsParser = require('@typescript-eslint/parser')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const reactPlugin = require('eslint-plugin-react')
const reactHooksPlugin = require('eslint-plugin-react-hooks')
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y')
const importPlugin = require('eslint-plugin-import')
const unicornPlugin = require('eslint-plugin-unicorn')
const promisePlugin = require('eslint-plugin-promise')
const turboPlugin = require('eslint-plugin-turbo')
const tailwindcssPlugin = require('eslint-plugin-tailwindcss')
const securityPlugin = require('eslint-plugin-security')
const prismaPlugin = require('eslint-plugin-prisma')
const sonarjsPlugin = require('eslint-plugin-sonarjs')

const isProd = process.env.NODE_ENV === 'production'

const base = {
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.turbo/**',
    '**/coverage/**',
    '**/.next/**',
    'packages/db/node_modules/.prisma/**',
    '**/prisma/migrations/**',
  ],
}

/** 全局（不加 files）基础配置 */
const common = {
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
      project: false,
    },
    globals: {
      NodeJS: 'readonly',
    },
  },
  plugins: {
    '@typescript-eslint': tsPlugin,
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
    'jsx-a11y': jsxA11yPlugin,
    import: importPlugin,
    unicorn: unicornPlugin,
    promise: promisePlugin,
    turbo: turboPlugin,
    tailwindcss: tailwindcssPlugin,
    security: securityPlugin,
    prisma: prismaPlugin,
    sonarjs: sonarjsPlugin,
  },
  settings: {
    react: { version: 'detect' },
    // import 解析 TS path alias（tsconfig.base.json）
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['./tsconfig.base.json'],
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts', '.mjs', '.cjs'],
      },
    },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],

    // import/order 与去默认导出偏好（可按需调整）
    'import/order': [
      'warn',
      {
        groups: [
          'type',
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'object',
          'unknown',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
    'import/no-default-export': 'off', // 若希望禁止默认导出，设为 'warn' 或 'error'

    // 通用可读性/健壮性
    eqeqeq: ['error', 'smart'],
    curly: ['error', 'all'],
    'no-var': 'error',
    'prefer-const': ['warn', { destructuring: 'all' }],
    'no-unused-expressions': [
      'error',
      { allowShortCircuit: true, allowTernary: true },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'TSEnumDeclaration',
        message: 'Avoid TypeScript enums; prefer union types or const objects.',
      },
    ],

    // console 处理：生产环境更严格
    'no-console': isProd ? ['warn', { allow: ['warn', 'error'] }] : 'off',

    // promise 与 unicorn、sonarjs
    'promise/always-return': 'off',
    'promise/no-nesting': 'off',
    'promise/no-new-statics': 'error',
    'promise/no-return-wrap': 'error',
    'unicorn/prefer-node-protocol': 'warn',
    'unicorn/filename-case': [
      'off',
      {
        cases: { camelCase: true, pascalCase: true, kebabCase: true },
      },
    ],
    'sonarjs/no-small-switch': 'warn',
    'sonarjs/no-duplicate-string': 'off',

    // turbo (monorepo)
    'turbo/no-undeclared-env-vars': 'off',
  },
}

/** 前端（React + Vite + shadcn/ui + Tailwind） */
const feOverrides = {
  files: ['apps/*/web*/src/**/*.{ts,tsx}', 'apps/**/web*/src/**/*.{ts,tsx}'],
  languageOptions: {
    ...common.languageOptions,
    globals: {
      ...common.languageOptions.globals,
      window: 'readonly',
      document: 'readonly',
      navigator: 'readonly',
    },
  },
  settings: {
    ...common.settings,
    react: { version: 'detect' },
  },
  rules: {
    // 继承部分推荐（通过直接并入规则）
    ...reactPlugin.configs.recommended.rules,
    ...jsxA11yPlugin.configs.recommended.rules,

    // React/JSX
    'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
    'react/react-in-jsx-scope': 'off', // Vite/Next 无需显式 import React
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',

    // Hooks
    ...reactHooksPlugin.configs.recommended.rules,

    // A11y
    'jsx-a11y/anchor-is-valid': 'warn',

    // Tailwind
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-custom-classname': 'off',
    'tailwindcss/no-contradicting-classname': 'warn',
  },
}

/** 后端（NestJS + Prisma + Node） */
const beOverrides = {
  files: [
    'apps/*/backend*/src/**/*.{ts,tsx,js}',
    'apps/**/backend*/src/**/*.{ts,tsx,js}',
  ],
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.jest,
    },
    sourceType: 'commonjs',
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  plugins: [],
  rules: {
    ...tseslint.configs.recommendedTypeChecked.reduce(
      (rules, config) => Object.assign(rules, config.rules),
      {},
    ),
    ...(eslint.configs?.recommended?.rules || {}),
    ...(eslintPluginPrettierRecommended?.rules || {}),
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
  },
}

/** packages 下库场景（更偏库安全） */
const pkgOverrides = {
  files: ['packages/**/src/**/*.{ts,tsx,js}'],
  rules: {
    // 库中更倾向于无默认导出（如需保持一致把这里也设为 off）
    'import/no-default-export': 'off',
    // 限制副作用引入
    'import/no-unassigned-import': ['warn', { allow: ['**/*.css'] }],
    // 侧重 API 稳定性
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
}

module.exports = [base, common, feOverrides, beOverrides, pkgOverrides]
