module.exports = {
  'env': {
    'es6': true,
    'node': true,
  },
  'extends': 'google',
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module',
  },
  'rules': {
    'max-len': 0,
    'require-jsdoc': 0,
    'camelcase': 0,
    'semi': 0,
    'valid-jsdoc': 0,
    'guard-for-in': 0,
    'no-invalid-this': 0
  },
};
