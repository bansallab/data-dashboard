import { defineConfig } from "eslint/config";
import globals from "globals";

import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
    { files: ["**/*.{js,mjs,cjs}"] },
    {
        files: ["**/*.{js,mjs,cjs}"],
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
    },
    eslintConfigPrettier,
]);
