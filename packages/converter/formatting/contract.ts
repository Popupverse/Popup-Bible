import { getMarkerType, type getSupportedMarkers } from "./supported-markers.ts";

export interface RootContent {
  content: MarkedContent[];
}

export interface NumberedContent {
  type: "chapter" | "verse";
  marker: string;
  number: string;
}

export interface RefContent {
  type: "ref";
  loc: string;
  content: string[];
}

export interface MarkedContent {
  type: string;
  marker: string;
  content?: (string | MarkedContent | RefContent)[]; // `b` don't have `content`'s
}

export function flatTextContent(content?: (string | MarkedContent | RefContent)[], text = "") {
  content?.forEach((content) => {
    if (typeof content === "string") {
      text += content;
    } else {
      text = flatTextContent(content.content, text);
    }
  });

  return text;
}

type Note = [keyTextIndexInVerse: number, note: string];

type ChapterKey = { type: "chapter"; chapter: number };
type SectionKey = { type: "section"; chapter: number; section: number };
type VerseKey = { type: "verse"; chapter: number; section: number; verse: number };

export type IndexKey = "title" | "intro" | ChapterKey | SectionKey | VerseKey;

interface IndexContext {
  verses: string[];
  title?: string[];
  intro?: string[];
  section?: string[];
  note?: Note[];
}

export type IndexTitle = { key: "title"; title: string };
export type IndexIntro = { key: "intro"; introduction: string };

export type IndexSection = { key: IndexKey; section?: string };
export type IndexVerse = { key: IndexKey; verse: string[]; note?: Note[] };

export type IndexedContent = IndexTitle | IndexIntro | IndexSection | IndexVerse;

export function* contentIndex(
  contents: string | RootContent | NumberedContent | MarkedContent | RefContent,
  supportedMarkers: ReturnType<typeof getSupportedMarkers>,
  iterator: { key?: IndexKey } = {},
  ctx: IndexContext = { verses: [] },
): Generator<IndexedContent, void, void> {
  const flushSection = function* () {
    if (ctx.section) {
      yield { key: iterator.key!, section: ctx.section.join("") };

      delete ctx.section;
    }
  };

  const flushVerse = function* () {
    if (ctx.verses.length) {
      const verse: IndexVerse = { key: iterator.key!, verse: ctx.verses };

      if (ctx.note) {
        verse.note = ctx.note;

        delete ctx.note;
      }

      yield verse;
    }
  };

  const flushTitleAndIntros = function* () {
    if (ctx.title) {
      yield { key: "title" as const, title: ctx.title.join("") };

      delete ctx.title;
    }

    if (ctx.intro) {
      yield { key: "intro" as const, introduction: ctx.intro.join("") };

      delete ctx.intro;
    }
  };

  if (typeof contents === "string") {
    if (contents.trim()) {
      ctx.verses.push(contents);
    }
  }
  //

  else if ("number" in contents) {
    yield* flushVerse();
    yield* flushTitleAndIntros();

    if (contents.type === "chapter") {
      iterator.key = { type: "chapter", chapter: parseInt(contents.number) };
    }
    //

    else if (typeof iterator.key === "object" && "section" in iterator.key) {
      iterator.key = { ...iterator.key, type: "verse", verse: parseInt(contents.number) };
    }

    // reset verse at either new chapter or verse
    ctx.verses = [];
  }
  //

  else {
    if ("marker" in contents) {
      const markerType = getMarkerType(contents.marker);

      if (supportedMarkers.BOOK_TITLES_AND_SECTIONS_MARKERS?.has(markerType)) {
        if (!iterator.key) {
          if (!ctx.title) ctx.title = [];

          return (ctx.title.push(flatTextContent(contents.content)), void 0);
        }
        //

        else {
          /* NOTE: just for typing */
          if (typeof iterator.key === "string") return;

          if (!ctx.section) {
            const section = "section" in iterator.key ? iterator.key.section + 1 : 0;

            iterator.key = { ...iterator.key, type: "section", section };
            ctx.section = [];
          }

          ctx.section.push(flatTextContent(contents.content));
        }
      }
      //

      else if (supportedMarkers.BOOK_INTRO_MARKERS?.has(markerType)) {
        if (!ctx.intro) ctx.intro = [];

        return (ctx.intro.push(flatTextContent(contents.content)), void 0);
      }
      //

      else if (
        supportedMarkers.BODY_PARAGRAPH_MARKERS?.has(markerType) ||
        supportedMarkers.POETRY_MARK?.has(markerType) ||
        supportedMarkers.POETRY_CHAR_MARK?.has(markerType) ||
        supportedMarkers.LIST_MARKERS?.has(markerType) ||
        supportedMarkers.LIST_CHAR_MARKERS?.has(markerType) ||
        supportedMarkers.TABLE_MARKERS?.has(markerType) ||
        supportedMarkers.TABLE_CELL_MARKERS?.has(markerType) ||
        supportedMarkers.TEXT_FEATURES_CHAR_MARKERS?.has(markerType) ||
        supportedMarkers.TEXT_FORMATTING_CHAR_MARKERS?.has(markerType)
      ) {
        yield* flushSection();

        if (!contents.content) return; // for `b` and the likes

        for (const content of contents.content) {
          yield* contentIndex(content, supportedMarkers, iterator, ctx);
        }
      }
      //

      else if (
        supportedMarkers.FOOTNOTE_MARKERS?.has(markerType) ||
        supportedMarkers.CROSS_REFERENCE_MARKERS?.has(markerType)
      ) {
        if (!ctx.note) {
          ctx.note = [];
        }

        // last verse entry is the key to the note
        ctx.note.push([ctx.verses.length - 1, flatTextContent(contents.content)]);
      }
      //

      else if (!supportedMarkers.BOOK_IDENTIFICATION_MARKERS?.has(markerType)) {
        throw Error(`Unexpected marker found: ${markerType}`);
      }
    }
    //

    else if (contents.content) {
      // Handles iterating over all direct contents of the root (book) content
      for (const content of contents.content) {
        yield* contentIndex(content, supportedMarkers, iterator, ctx);
      }
    } else {
      throw Error(`Unexpected marker found`);
    }
  }
}
