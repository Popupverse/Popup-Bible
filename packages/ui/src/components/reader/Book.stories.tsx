import preview from "#.storybook/preview";

import { App } from "../app/App";
import { Route } from "../app/router/routes/book.$bookId";

const meta = preview.meta({
  decorators: [
    (Story) => (
      <App container={document.body}>
        <Story />
      </App>
    ),
  ],
});

export const mr = meta.story({
  name: "mr",
  parameters: {
    tanstack: {
      router: {
        route: Route,
        path: "/book/$bookId",
        params: { bookId: "Hab" },
        query: { chapter: 3, verse: 19 },
        routeOverrides: {
          "/book/$bookId": {
            loader: async () => (await import("@popup-bible/flat-converter/bsb/Hab")).default,
          },
        },
      },
    },
  },
});

export const ms = meta.story({
  name: "ms#",
  parameters: {
    tanstack: {
      router: {
        route: Route,
        path: "/book/$bookId",
        params: { bookId: "Ps" },
        query: { chapter: 1 },
        routeOverrides: {
          "/book/$bookId": {
            loader: async () => (await import("@popup-bible/flat-converter/bsb/Ps")).default,
          },
        },
      },
    },
  },
});

export const d = meta.story({
  name: "d",
  parameters: {
    tanstack: {
      router: {
        route: Route,
        path: "/book/$bookId",
        params: { bookId: "Zech" },
        query: { chapter: 12 },
        routeOverrides: {
          "/book/$bookId": {
            loader: async () => (await import("@popup-bible/flat-converter/bsb/Zech")).default,
          },
        },
      },
    },
  },
});

export const pmo = meta.story({
  name: "pmo",
  parameters: {
    tanstack: {
      router: {
        route: Route,
        path: "/book/$bookId",
        params: { bookId: "Rev" },
        query: { chapter: 3 },
        routeOverrides: {
          "/book/$bookId": {
            loader: async () => (await import("@popup-bible/flat-converter/bsb/Rev")).default,
          },
        },
      },
    },
  },
});

export const pc = meta.story({
  name: "pc",
  parameters: {
    tanstack: {
      router: {
        route: Route,
        path: "/book/$bookId",
        params: { bookId: "Dan" },
        query: { chapter: 5, verse: 25 },
        routeOverrides: {
          "/book/$bookId": {
            loader: async () => (await import("@popup-bible/flat-converter/bsb/Dan")).default,
          },
        },
      },
    },
  },
});

export const qr = meta.story({
  name: "qr",
  parameters: {
    tanstack: {
      router: {
        route: Route,
        path: "/book/$bookId",
        params: { bookId: "Zeph" },
        query: { chapter: 1, verse: 2 },
        routeOverrides: {
          "/book/$bookId": {
            loader: async () => (await import("@popup-bible/flat-converter/bsb/Zeph")).default,
          },
        },
      },
    },
  },
});

export const qa = meta.story({
  name: "qa",
  parameters: {
    tanstack: {
      router: {
        route: Route,
        path: "/book/$bookId",
        params: { bookId: "Ps" },
        query: { chapter: 119, verse: 136 },
        routeOverrides: {
          "/book/$bookId": {
            loader: async () => (await import("@popup-bible/flat-converter/bsb/Ps")).default,
          },
        },
      },
    },
  },
});

export const fv = meta.story({
  name: "fv",
  parameters: {
    tanstack: {
      router: {
        route: Route,
        path: "/book/$bookId",
        params: { bookId: "Mark" },
        query: { chapter: 16, verse: 8 },
        routeOverrides: {
          "/book/$bookId": {
            loader: async () => (await import("@popup-bible/flat-converter/bsb/Mark")).default,
          },
        },
      },
    },
  },
});
