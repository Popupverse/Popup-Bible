import type { ComponentPropsWithRef } from "react";

import { useSearch } from "@tanstack/react-router";
import { cn } from "cn";
import { tv } from "tailwind-variants";

import { Route } from "@/route/book.$bookId";

import { BookTitle } from "./BookTitle";

const useStyles = tv({
  base: "p-4",
});

export function BookChapter({ children, className, ...props }: ComponentPropsWithRef<"article">) {
  const styles = useStyles({ className });

  const { chapter } = useSearch({ from: Route.id });

  return (
    <article {...props} className={styles} data-chapter={chapter}>
      <BookTitle className={cn(chapter !== 1 && "sr-only")} />
      {children}
    </article>
  );
}
