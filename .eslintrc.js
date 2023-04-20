module.exports = {
  parserOptions: {
    parser: '@babel/eslint-parser',
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
    'no-console': 'off',
    'no-debugger': 'off',
    'object-curly-spacing': ['warn', 'always'],
    'capitalized-comments': 'warn',
    'comma-dangle': ['warn', 'always-multiline'],
    'import/order': ['warn', {
      'newlines-between': 'always',
    }],
    'arrow-body-style': 'off',
  },
  settings: {
    'import/resolver': 'webpack',
  },
};
