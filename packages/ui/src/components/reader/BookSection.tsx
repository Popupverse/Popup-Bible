import type { Section } from "@popup-bible/flat-converter";
import { useSearch } from "@tanstack/react-router";
import { Fragment, type ComponentPropsWithRef } from "react";
import { tv } from "tailwind-variants";

import { Route } from "@/route/book.$bookId";

import { BookParagraph } from "./BookParagraph";
import { BookLink } from "./BookText";

const useStyles = tv({
  slots: {
    root: "",
    d: ["font-normal has-[+:is([data-marker='s1'],[data-marker='s2'])]:mb-4"],
  },
});

export function BookSection({ title, paragraphs }: Section) {
  const { root, d } = useStyles();

  return (
    <section className={root()}>
      <header className="pt-4 pb-3 text-center">
        {title.map((t, i) => (
          <Fragment key={i}>
            {t.type === "t" && (
              <Title data-marker={t.marker} level={i}>
                {t.content}
              </Title>
            )}
            {t.type === "p" && (
              <Title data-marker={t.marker} level={i} className={d()}>
                <BookParagraph {...t} />
              </Title>
            )}
            {t.type === "r" && (
              <Title data-marker={t.marker} level={i}>
                {t.content.map((markup, i) => (
                  <BookLink key={i} marker={t.marker} {...markup} />
                ))}
              </Title>
            )}
          </Fragment>
        ))}
      </header>
      {paragraphs.map((p, i) => (
        <BookParagraph {...p} key={i} />
      ))}
    </section>
  );
}

const headings = ["h3", "h4", "h5"] as const;

const useHeadingStyles = tv({
  base: "font-medium",
  variants: {
    isBlurred: { true: "text-muted-foreground" },
    tag: {
      h3: "font-bold tracking-wide",
      h4: "text-sm tracking-tight",
      h5: "",
    },
  },
});

function Title({ level, className, ...props }: { level: number } & ComponentPropsWithRef<"h1">) {
  const Heading: (typeof headings)[number] | undefined = headings[level];

  const { verse } = useSearch({ from: Route.id });

  const styles = useHeadingStyles({ className, tag: Heading, isBlurred: !!verse });

  return Heading ? <Heading {...props} className={styles} /> : null;
}
