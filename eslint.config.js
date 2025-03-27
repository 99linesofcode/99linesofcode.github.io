import stylistic from '@stylistic/eslint-plugin';

export default [
  stylistic.configs.recommended,
  {
    files: [
      '**/*.js',
      '**/*.mjs',
      '**/*.ts',
    ],
    rules: {
      '@stylistic/array-bracket-newline': [
        'error',
        'always',
      ],
      '@stylistic/array-bracket-spacing': [
        'error',
        'always',
      ],
      '@stylistic/array-element-newline': [
        'error',
        'always',
      ],
      '@stylistic/comma-dangle': [
        'error',
        'always-multiline',
      ],
      '@stylistic/indent': [
        'error',
        2,
      ],
      '@stylistic/semi': [
        'error',
        'always',
      ],
      '@stylistic/quotes': [
        'error',
        'single',
      ],
    },
  },
];
