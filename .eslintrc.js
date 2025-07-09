module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: [
    '@nuxt/eslint-config',
    'plugin:prettier/recommended',
  ],
  plugins: [],
  rules: {
    'vue/multi-word-component-names': 'off',
  },
};
