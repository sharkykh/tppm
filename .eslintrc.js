module.exports = {
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
    allowImportExportEverywhere: false,
    codeFrame: true,
  },
  plugins: [
    'import',
  ],
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
    'comma-dangle': ['error', 'always-multiline'],
  },
};
