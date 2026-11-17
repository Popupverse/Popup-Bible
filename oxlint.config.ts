import {
  expoJsPlugin,
  expoRules,
  reactHooksJsPlugin,
  reactHooksRules,
  disabledNativeReactHooksCompilerRules,
  reactNativeConfig,
} from "expo-config-oxlint";
import type { OxlintConfig } from "oxlint";
import { defineConfig } from "oxlint";
import native from "oxlint-config-universe/native";
import nativeTsAnalysis from "oxlint-config-universe/typescript-analysis";

const flatReactHooksRules: OxlintConfig["rules"] = {
  ...disabledNativeReactHooksCompilerRules,
  ...reactHooksRules,
};

const flatExpoRules: OxlintConfig["rules"] = {
  ...native.rules,
  ...nativeTsAnalysis.rules,
  ...expoRules,
  ...reactNativeConfig.rules,
};

export default defineConfig({
  $schema: "./node_modules/oxlint/configuration_schema.json",

  plugins: ["typescript", "unicorn", "oxc"],

  categories: {
    correctness: "error",
  },

  options: {
    typeAware: true,
    typeCheck: true, // almost equivalent of `tsc --noEmit`
    reportUnusedDisableDirectives: "warn",
  },

  rules: {
    "no-unused-vars": "warn",

    // Oxlint doesn't read the plugin's configs, so the recommended rules have to be listed explicitly:
    "turbo/no-undeclared-env-vars": "warn",
  },

  env: {
    builtin: true,
  },

  jsPlugins: ["eslint-plugin-turbo"],

  ignorePatterns: ["routeTree.gen.ts"],

  overrides: [
    {
      files: ["**/*.tsx"],
      plugins: ["react"], // might be redundant
      jsPlugins: [reactHooksJsPlugin],
      rules: flatReactHooksRules,
    },

    {
      files: ["./packages/ui/**/*"],

      jsPlugins: ["eslint-plugin-lingui"],

      rules: {
        // also not enabled explicitly (see: marker `a`)
        "lingui/t-call-in-function": "error",
        "lingui/no-single-tag-to-translate": "warn",
        "lingui/no-single-variables-to-translate": "warn",
        "lingui/no-trans-inside-trans": "warn",
        "lingui/no-expression-in-message": "warn",
        "lingui/require-directive-reset": "warn",
        "lingui/no-unnamed-tag-placeholders": [
          "error",
          {
            jsxPlaceholderAttribute: "_lingui_tag",
          },
        ],
      },
    },

    {
      files: ["./packages/native-ui/**/*"],
      env: native.env,
      globals: native.globals,
      plugins: [...(native.plugins ?? [])],
      jsPlugins: [expoJsPlugin, ...reactNativeConfig.jsPlugins],

      rules: flatExpoRules,
    },
  ],
});
