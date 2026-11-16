import { createContext, use } from "react";

export const AppContainerContext = createContext<HTMLElement | undefined>(undefined);

export function useAppContainer() {
  const ctx = use(AppContainerContext);

  if (ctx === undefined)
    throw `${useAppContainer.name} must be wrapped within a ${AppContainerContext.name}`;

  return ctx;
}
