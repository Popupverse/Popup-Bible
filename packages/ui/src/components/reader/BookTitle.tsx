import { useLoaderData } from "@tanstack/react-router";
import { tv } from "tailwind-variants";

import { Route } from "@/route/book.$bookId";

const useStyles = tv({
  slots: {
    root: "space-y-1 p-2 text-center",
    mt1: "font-reader text-4xl leading-8 font-bold",
    mt2: "italic",
  },
});

export function BookTitle({ className }: { className?: string }) {
  const { root, mt1, mt2 } = useStyles();

  const book = useLoaderData({ from: Route.id });

  return (
    <header className={root({ className })}>
      {book.titles[1] && book.titles[2] && <h2 className={mt2()}>{book.titles[2]}</h2>}
      <h1 className={mt1()}>{book.titles[1] || book.titles[2]}</h1>
    </header>
  );
}
