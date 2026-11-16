import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { useMemo } from "react";

import type { RouterContext } from "./routes/__root.tsx";
import { routeTree } from "./routeTree.gen.ts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {},
  },
});

function initRouter(initialEntries: string[] = []) {
  const history = createMemoryHistory({ initialEntries });

  const router = createRouter({ history, routeTree, context: { queryClient } });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof initRouter>;
  }
}

export function Router({
  fetchBook,
  initialEntries,
}: Pick<RouterContext, "fetchBook"> & { initialEntries?: string[] }) {
  const router = useMemo(() => initRouter(initialEntries), []);

  return <RouterProvider router={router} context={{ fetchBook }} />;
}
