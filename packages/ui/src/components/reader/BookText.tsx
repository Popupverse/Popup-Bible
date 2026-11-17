import { useLayoutEffect, useRef, type ComponentPropsWithRef } from "react";

import { Trans } from "@lingui/react/macro";
import type { BCVMarkup, Note, OtherText, Text } from "@popup-bible/flat-converter";
import { Link } from "@tanstack/react-router";
import { useSearch } from "@tanstack/react-router";
import { NotebookDotIcon } from "lucide-react";
import { tv, type VariantProps } from "tailwind-variants";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "#ui/popover";

import { Route } from "@/route/book.$bookId";

import { useAppContainer } from "../app/AppContainer";

const useStyles = tv({
  slots: {
    popoverContent: "",
    popoverTitle: "flex items-center gap-1 text-muted-foreground",
    textContent: [
      "data-[marker='fr']:hidden [[data-marker=f]_&[data-marker=fqa]]:text-foreground", // data-[marker='fqa']:italic
      "[:nth-child(1_of_[data-marker='fv'])]:mx-1",
      "[:nth-child(1_of_[data-marker='fv'])]:align-super",
      "[:nth-child(1_of_[data-marker='fv'])]:text-xs",
      "[:nth-child(1_of_[data-marker='fv'])]:italic",
      "[[data-marker=f]_&[data-marker=fv]]:text-foreground",
    ],
  },
  variants: {
    isPassage: {
      true: {
        textContent: "font-reader text-lg",
      },
    },
    hasNote: {
      true: { textContent: "underline decoration-dashed" },
    },
    isBlurred: {
      true: { textContent: "text-muted-foreground" },
    },
  },
});

export function BookText({
  bookText,
  isPassage,
  children,
  className,
  ...props
}: { bookText?: Text | OtherText } & VariantProps<typeof useStyles> &
  ComponentPropsWithRef<"span">) {
  const { verse } = useSearch({ from: Route.id });

  const hasNote = bookText?.type === "t" && !!bookText.note;
  const isBlurred = bookText?.type === "t" && !!verse && bookText.selection.verse !== verse;

  const { popoverTitle, popoverContent, textContent } = useStyles({
    className,
    isPassage,
    hasNote,
    isBlurred,
  });

  const scrollIntoView = useRef(bookText?.type === "t" && bookText.selection.verse === verse);

  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (scrollIntoView.current) {
      requestIdleCallback(
        () => {
          ref.current?.scrollIntoView({ block: "center" });
        },
        { timeout: 1e3 },
      );
    }
  }, []);

  const appContainer = useAppContainer();

  const content = (
    <span {...props} ref={ref} className={textContent()}>
      {bookText?.content ?? children}
    </span>
  );

  return bookText?.type === "t" && bookText?.note ? (
    <Popover>
      <PopoverTrigger openOnHover nativeButton={false} render={content} />
      <PopoverContent
        container={appContainer}
        className={popoverContent()}
        render={<aside />}
        data-marker={bookText.note.marker}
      >
        <header className="space-y-1">
          <PopoverTitle className={popoverTitle()}>
            <NotebookDotIcon size={14} />
            <Trans>Note</Trans>
          </PopoverTitle>
          <PopoverDescription>
            {bookText.note.quotes.map((q, i) => (
              <BookNote key={i} {...q} />
            ))}
          </PopoverDescription>
        </header>
      </PopoverContent>
    </Popover>
  ) : (
    content
  );
}

function BookNote({ marker, content }: Note["quotes"][number]) {
  return typeof content === "string" ? (
    <BookText data-marker={marker}>{content}</BookText>
  ) : (
    content.map((markup, i) => <BookLink key={i} {...markup} marker={marker} />)
  );
}

export function BookLink({ marker, text, bcv }: BCVMarkup & { marker?: string }) {
  const content = <BookText data-marker={marker}>{text}</BookText>;

  return (
    <>
      {bcv?.start.b && bcv.start.c ? (
        <Link
          to="/book/$bookId"
          params={{ bookId: bcv?.start.b }}
          search={{ chapter: bcv?.start.c, verse: bcv?.start.v }}
          className="underline"
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </>
  );
}
