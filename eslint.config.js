import { FlatCompat } from '@eslint/eslintrc';
import eslintJS from '@eslint/js';
// import importPlugin from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

const compat = new FlatCompat();

export default typescriptEslint.config(
  eslintJS.configs.recommended,

  // TypeScript rules
  ...typescriptEslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.js'],
    ...typescriptEslint.configs.disableTypeChecked,
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      parserOptions: {
        project: [
          './tsconfig.json',
          './tests/ts/tsconfig.json',
          './tests/ts-nodenext/tsconfig.json',
        ],
        tsconfigRootDir: '.',
      },
    },
    rules: {
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
      '@typescript-eslint/brace-style': [
        'error',
        '1tbs',
        {
          allowSingleLine: true,
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
      '@typescript-eslint/member-delimiter-style': 'warn',
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
      '@typescript-eslint/no-extra-parens': ['error', 'functions'],
      '@typescript-eslint/no-extra-semi': 'error',
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
      '@typescript-eslint/object-curly-spacing': ['error', 'always'],
      '@typescript-eslint/parameter-properties': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-regexp-exec': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/prefer-ts-expect-error': 'error',
      '@typescript-eslint/quotes': [
        'error',
        'single',
        {
          allowTemplateLiterals: true,
        },
      ],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/semi': 'error',
      '@typescript-eslint/sort-type-constituents': 'error',
      '@typescript-eslint/type-annotation-spacing': 'error',
      '@typescript-eslint/unified-signatures': 'error',
    },
  },

  // This config does not support the flat config yet
  // https://github.com/standard/eslint-config-standard/issues/411
  ...compat.extends('eslint-config-standard'),

  // This plugin does not support the flat config yet
  // https://github.com/import-js/eslint-plugin-import/issues/2556
  // https://github.com/import-js/eslint-plugin-import/issues/2948
  // {
  //   files: ['**/*.js', '**/*.mjs', '**/*.ts'],
  //   languageOptions: {
  //     parser: typescriptEslint.parser
  //   },
  //   plugins: {
  //     import: importPlugin,
  //   },
  //   rules: {
  //     ...importPlugin.configs.recommended.rules,
  //     'import/no-named-as-default': 'off',
  //     'import/no-named-as-default-member': 'off',
  //     'import/order': [
  //       'error',
  //       {
  //         alphabetize: {
  //           'order': 'asc'
  //         }
  //       }
  //     ],
  //   }
  // },

  {
    files: ['**/*.js', '**/*.mjs', '**/*.ts'],
    ...promisePlugin.configs['flat/recommended'],
  },

  ...compat.extends('eslint-config-prettier'),

  // All files
  {
    files: ['**/*.js', '**/*.mjs', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      globals: {
        ...globals.node,
      },
      sourceType: 'module',
    },
    rules: {
      'no-use-before-define': 'warn',
      'sort-keys': 'warn',
    },
  },

  // Test files
  {
    files: ['**/__tests__/*.test.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/unbound-method': 'off',
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
      'cjs/**',
      'docs/**',
      'esm/**',
      'tests/*/dist/**',
      'tmp/**'
    ],
  }
);
