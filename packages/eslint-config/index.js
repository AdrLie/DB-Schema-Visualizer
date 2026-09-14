module.exports = {
  extends: ["eslint:recommended", "prettier", "eslint-config-turbo"],
  env: {
    node: true,
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  ignorePatterns: ["node_modules/", "dist/", ".next/"],
};
