import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/typedef": [
        "error",
        {
          "arrayDestructuring": true,
          "arrowParameter": true,
          "memberVariableDeclaration": true,
          "objectDestructuring": true,
          "parameter": true,
          "propertyDeclaration": true,
          "variableDeclaration": true,
          "variableDeclarationIgnoreFunction": false
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "varsIgnorePattern": "^[A-Z]",
          "argsIgnorePattern": "^_",
        }
      ]
    }
  }
];
