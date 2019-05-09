module.exports = {
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
    allowImportExportEverywhere: false,
    codeFrame: true,
  },
  extends: [
    'xo-space',
    'plugin:vue/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  globals: {
    __VERSION__: 'readonly',
  },
  rules: {
    'no-console': 0,
    'no-debugger': 0,
    'object-curly-spacing': 0,
    'capitalized-comments': 1,
    'comma-dangle': ['error', 'always-multiline'],
    'import/order': ['error', {
      'newlines-between': 'always',
    }],
  },
  settings: {
    'import/resolver': 'webpack',
  },
};
