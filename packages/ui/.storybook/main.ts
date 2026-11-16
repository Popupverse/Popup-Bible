import { defineMain } from "@storybook/tanstack-react/node";

export default defineMain({
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-vitest"],
  framework: "@storybook/tanstack-react",
});
