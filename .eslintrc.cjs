module.exports = {
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react', 'prettier'],
  rules: {
    'prettier/prettier': 'warn',
    'react/prop-types': 'off',
    'no-unused-vars': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-empty': ['error', { allowEmptyCatch: true }],
    'react-hooks/purity': 'off',
    'react-hooks/set-state-in-effect': 'off'
  },
}
