process.env.ESLINT_TSCONFIG = './tsconfig.json';

module.exports = {
  root: true,
  env: {
    node: true
  },
  globals: {
    NodeJS: 'readonly'
  },
  plugins: ['guide'],
  extends: [
    'plugin:guide/base',
    'plugin:guide/typeScript'
  ],
  rules: {
    'import/extensions': ['error', 'never', {
      json: 'always'
    }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }]
  }
};
