import { createContext, use } from "react";

export const LocaleContext = createContext<
  | {
      activate: (locale: string) => void | Promise<void>;
    }
  | undefined
>(undefined);

export function useLocale() {
  const ctx = use(LocaleContext);

  if (ctx === undefined)
    throw new Error(`${useLocale.name} must be wrapped in a ${LocaleContext.name}`);

  return ctx;
}
