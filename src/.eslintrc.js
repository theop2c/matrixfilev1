module.exports = {
  root: true,
  env: {
    es2021: true, // Support modern ES2021 features
    node: true, // Enable Node.js global variables like `module` and `__dirname`
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021, // Support ES2021 syntax
    sourceType: "module", // Use ECMAScript modules
    tsconfigRootDir: __dirname, // Resolve tsconfig.json correctly
    project: ["tsconfig.json", "tsconfig.dev.json"],
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files
    "/generated/**/*", // Ignore generated files
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
    "no-console": "warn", // Warn on console statements
    "@typescript-eslint/no-explicit-any": "warn", // Discourage use of `any`
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
  },
};
