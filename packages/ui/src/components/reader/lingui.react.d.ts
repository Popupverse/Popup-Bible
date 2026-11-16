import "react";

declare module "react" {
  interface Attributes {
    _lingui_tag?: string; // replace with your `jsxPlaceholderAttribute` value
  }
}
