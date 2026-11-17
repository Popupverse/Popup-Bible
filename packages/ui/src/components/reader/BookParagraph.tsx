import { Fragment } from "react";

import type { Paragraph } from "@popup-bible/flat-converter";
import { useSearch } from "@tanstack/react-router";
import { tv, type VariantProps } from "tailwind-variants";

import { Route } from "../app/router/routes/book.$bookId";

import { BookText } from "./BookText";

const useStyles = tv({
  base: [
    "",

    // if followed by li1
    "[&[data-marker='p']:has(+br+[data-marker='li1'])]:leading-5",
    "[&[data-marker='p']:has(+br+[data-marker='li1'])]:font-medium",
    "[&[data-marker='p']:has(+br+[data-marker='li1'])]:tracking-wide",

    // if followed by pc
    "[&:has(+[data-marker='pc'])]:mt-4",
  ],

  variants: {
    isQuote: {
      true: [
        "relative",
        "before:content-['']",
        "before:absolute",
        "before:top-0",
        "before:left-0",
        "before:h-full",
        "before:w-px",
        "before:bg-foreground/30",
      ],
    },
    marker: {
      mr: "italic",
      pmo: "px-4",
      pc: "mb-3 text-center",
      li1: [
        "relative",
        "before:absolute",
        "before:left-0",
        "before:content-['⚫︎']",
        "before:pt-0.5",
        "before:text-muted-foreground",
        "has-[>sup:first-child]:before:top-2",
        "has-[>sup:first-child]:before:leading-0",
        "ps-4",
      ],
      li2: "ps-4",
      q1: "px-3",
      q2: "px-6",
      qa: "me-2 mt-1 inline-block *:text-sm",
      qr: "text-end *:first:before:content-['—_']",
      wj: "text-orange-800 dark:text-orange-300",
    },
  },
});

function useMarkerStyles(p: Paragraph) {
  const isQuote = p.type === "p" && ["q1", "q2"].includes(p.marker);

  const marker = "marker" in p ? (p.marker as VariantProps<typeof useStyles>["marker"]) : undefined;

  return useStyles({ isQuote, marker });
}

export function BookParagraph({
  nested,
  ...p
}: Paragraph & { /** Possibly words of Jesus */ nested?: boolean }) {
  const styles = useMarkerStyles(p);

  const { chapter } = useSearch({ from: Route.id });

  const P = nested ? "span" : "p";

  return p.type === "b" ? (
    <br className="my-2 block" />
  ) : (
    <P data-marker={p.marker} className={styles}>
      {p.content.map((t, i) => (
        <Fragment key={i}>
          {t.type === "v" ? (
            t.verse !== 1 ? (
              <sup className="me-1 text-muted-foreground">{t.verse}</sup>
            ) : (
              <b className="float-left me-2 text-5xl text-muted-foreground">{chapter}</b>
            )
          ) : t.type === "t" || t.type === "z" ? (
            <BookText bookText={t} isPassage />
          ) : (
            <BookParagraph {...t} nested />
          )}
        </Fragment>
      ))}
    </P>
  );
}
