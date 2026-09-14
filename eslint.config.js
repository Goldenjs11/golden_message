import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['backend/src/**/*.js', 'tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'no-console': 'off'
    }
  }
];
