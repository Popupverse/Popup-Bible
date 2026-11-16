import { defineConfig } from "@lingui/cli";

export default defineConfig({
  sourceLocale: "en",
  locales: ["en"],

  catalogs: [
    {
      include: ["src"], // where the Trans are
      path: "<rootDir>/src/locales/{locale}", // ICU MessageFormat output files
    },
  ],
});
