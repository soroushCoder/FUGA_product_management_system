
module.exports = {
  overrides: [
    {
      files: ["**/*.test.ts"],
      env: { "vitest/globals": true },
      rules: {
        // keep strict in app, but be pragmatic in tests:
        "@typescript-eslint/no-explicit-any": "off"
      }
    }
  ]
}
