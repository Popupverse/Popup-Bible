import type { Book } from "@popup-bible/flat-converter";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { useAppContainer } from "../../AppContainer";

export interface RouterContext {
  queryClient: QueryClient;

  fetchBook?: (bookId: string) => Promise<Book>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Component,
});

function Component() {
  const appContainer = useAppContainer();
  const shadowRoot = appContainer.shadowRoot ?? undefined;

  return (
    <>
      <Outlet />
      <TanStackRouterDevtools shadowDOMTarget={shadowRoot} />
    </>
  );
}
