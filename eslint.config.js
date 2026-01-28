import eslintJS from '@eslint/js';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import promisePlugin from 'eslint-plugin-promise';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslintJS.configs.recommended,

  // TypeScript rules
  // Breaking this config up because the `typescript-eslint/recommended` config is applied without a `files` filter.
  tseslint.configs.recommended.find((config) => config.name === 'typescript-eslint/base') || {},
  tseslint.configs.recommended.find(
    (config) => config.name === 'typescript-eslint/eslint-recommended'
  ) || {},
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: [
          './tsconfig.json',
          './tests/ts/tsconfig.json',
          './tests/ts-nodenext/tsconfig.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...tseslint.configs.recommended.find(
        (config) => config.name === 'typescript-eslint/recommended'
      )?.rules,
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array',
        },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          minimumDescriptionLength: 5,
          'ts-check': true,
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
          'ts-nocheck': false,
        },
      ],
      '@typescript-eslint/consistent-indexed-object-style': ['error'],
      '@typescript-eslint/consistent-type-assertions': [
        'warn',
        {
          assertionStyle: 'as',
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error'],
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'no-public',
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/method-signature-style': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          custom: {
            match: true,
            regex: '^[A-Z][A-Za-z]+$',
          },
          format: ['PascalCase'],
          selector: 'typeParameter',
        },
      ],
      '@typescript-eslint/no-dynamic-delete': 'warn',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-extraneous-class': 'error',
      '@typescript-eslint/no-restricted-types': 'warn',
      '@typescript-eslint/no-unnecessary-type-arguments': 'error',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'none',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          vars: 'all',
        },
      ],
      '@typescript-eslint/no-useless-constructor': 'warn',
      '@typescript-eslint/parameter-properties': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-regexp-exec': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/prefer-ts-expect-error': 'error',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/sort-type-constituents': 'error',
      '@typescript-eslint/unified-signatures': 'error',
    },
  },

  {
    extends: [importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],
    files: ['**/*.ts'],
    rules: {
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/default': 'off',
      'import/extensions': ['error', 'always', { checkTypeImports: true }],
      'import/first': 'error',
      'import/named': 'off',
      'import/namespace': 'off',
      'import/newline-after-import': 'error',
      'import/no-absolute-path': 'error',
      'import/no-commonjs': 'off',
      'import/no-duplicates': 'error',
      'import/no-dynamic-require': 'error',
      'import/no-named-as-default': 'warn',
      'import/no-named-as-default-member': 'off',
      'import/no-relative-parent-imports': 'error',
      'import/no-self-import': 'error',
      'import/no-unresolved': ['error'],
      'import/no-useless-path-segments': 'error',
      'import/order': [
        'error',
        {
          alphabetize: { order: 'asc' },
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          named: true,
          'newlines-between': 'always',
          pathGroupsExcludedImportTypes: ['builtin'],
          sortTypesGroup: true,
        },
      ],
    },
  },

  {
    files: ['**/*.js', '**/*.ts'],
    ...promisePlugin.configs['flat/recommended'],
  },

  eslintConfigPrettier,

  // All files
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      globals: {
        ...globals.node,
      },
      sourceType: 'module',
    },
    rules: {
      'sort-keys': 'warn',
    },
  },

  // Example files
  {
    files: ['example/**/*.ts'],
    rules: {
      'import/no-relative-parent-imports': 'off',
    },
  },

  // Test files
  {
    files: ['**/__tests__/*.test.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'import/no-relative-parent-imports': 'off',
      'no-unused-expressions': 'off',
    },
  },

  // CommonJS files
  {
    files: ['tests/cjs/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  {
    // prettier-ignore
    ignores: [
      'build/**',
      'docs/**',
      'lib/**',
      'tests/*/dist/**',
      'tmp/**'
    ],
  }
);
