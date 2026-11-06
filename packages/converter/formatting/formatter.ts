/**
 * NOTE:
 * Using BSB supported markers, for now
 */

import type { BCVRange } from "./bcv.ts";
import {
  flatTextContent,
  type IndexedContent,
  type IndexKey,
  type MarkedContent,
  type NumberedContent,
  type RefContent,
  type RootContent,
} from "./contract.ts";
import { getMarkerLevel, getMarkerType, type getSupportedMarkers } from "./supported-markers.ts";

type SupportedTitleLevels = 1 | 2;

export interface Book {
  /** The `h` Book Identification marker*/
  name: string;
  /** Path to original file */
  path: string;

  /** [0]: mt1, [1]: mt2 */
  titles: { [level in SupportedTitleLevels]?: string };

  chapters: Chapter[];
}

export interface Chapter {
  /** The chapter number */
  n: number;
  sections: Section[];
}

export interface Text {
  content: string;
  selection: { chapter: number; verse: number };
  note?: Note;
}

export type Note = { marker: string; quotes: { content: string; marker?: string }[] };

export interface Section {
  /** title is undefined if there's no section */
  title?: {
    marker: string; // used for css styling. css styling will deal with levels too
    content: string;
    ref?: { content: string; bcv?: BCVRange }[]; // parallel refs
  };

  paragraphs: Paragraph[];
}

export type Verse = { verse: number };

export type Paragraph =
  | {
      type: "content";
      marker: string; // used for styling
      content: (Text | Verse | Paragraph)[];
    }
  | { type: "blank" };

export class Formatter {
  private contents: RootContent;
  private supportedMarkers: ReturnType<typeof getSupportedMarkers>;
  private book: Book;

  constructor(
    /** Path to original file */
    path: string,
    contents: RootContent,
    supportedMarkers: ReturnType<typeof getSupportedMarkers>,
  ) {
    this.contents = contents;
    this.supportedMarkers = supportedMarkers;

    this.book = { path, name: "", titles: {}, chapters: [] };
  }

  format() {
    // oxlint-disable-next-line typescript/no-this-alias
    const _this = this;

    interface GlobalCtx {
      chapter?: Chapter;
      /** For setting parallel refs */
      section?: Section;
      verse?: number;
      text?: Text;
      note?: Note;
    }

    interface Ctx {
      $: GlobalCtx;
      paragraph?: Exclude<Paragraph, { type: "blank" }>;
      marker?: string;
    }

    function index(content: string | NumberedContent | MarkedContent | RefContent, ctx: Ctx) {
      //

      if (typeof content === "string") {
        if (ctx.$.note) {
          // TODO: Parse bcv, find refs, etc

          ctx.$.note.quotes.push({ content, marker: ctx.marker });
        }
        //

        else if (ctx.$.chapter && ctx.$.verse && ctx.paragraph) {
          ctx.paragraph.content.push(
            (ctx.$.text = {
              content,
              selection: { chapter: ctx.$.chapter.n, verse: ctx.$.verse },
            }),
          );
        }

        return;
      }

      if ("loc" in content) {
        ctx.$.note?.quotes.push({
          content: flatTextContent(content.content),
          marker: content.type,
        });

        return;
      }

      const markerType = getMarkerType((ctx.marker = content.marker));

      if (markerType === "h" && "content" in content) {
        _this.book.name = flatTextContent(content.content);
      }
      //

      else if ("number" in content) {
        if (markerType === "c") {
          ctx.$.section = { paragraphs: [] };
          ctx.$.chapter = { n: parseInt(content.number), sections: [ctx.$.section] };

          _this.book.chapters.push(ctx.$.chapter);

          //
        } else if (ctx.paragraph) {
          ctx.$.verse = parseInt(content.number);
          ctx.paragraph.content.push({ verse: ctx.$.verse });
        }
      }
      //

      else if (_this.supportedMarkers.BOOK_TITLES_AND_SECTIONS_MARKERS?.has(markerType)) {
        if (!ctx.$.chapter) {
          //

          const titleLevel = getMarkerLevel(content.marker) as SupportedTitleLevels;

          _this.book.titles[titleLevel] = flatTextContent(content.content);
        }
        //

        else {
          // handle section header refs

          if (markerType === "r" || markerType === "mr") {
            //

            if (ctx.$.section?.title) {
              // TODO: parse bcv references

              ctx.$.section.title.ref = [{ content: flatTextContent(content.content) }];
            }
          } else {
            //
            ctx.$.section = {
              title: { content: flatTextContent(content.content), marker: content.marker },
              paragraphs: [],
            };

            if (ctx.$.chapter.sections[0]?.paragraphs.length === 0) {
              ctx.$.chapter.sections[0] = ctx.$.section;
            }
            //

            else {
              ctx.$.chapter.sections.push(ctx.$.section);
            }
          }
        }
      }
      //

      else if (content.type === "para" && ctx.$.section) {
        //

        const p: Paragraph =
          markerType === "b"
            ? { type: "blank" }
            : {
                type: "content",
                marker: content.marker,
                content: [],
              };

        if (ctx.paragraph) {
          ctx.paragraph.content.push(p);
        } else {
          ctx.$.section.paragraphs.push(p);
        }

        if (p.type === "content") {
          ctx.paragraph = p;
        }

        content.content?.forEach((content, i) => {
          if (i === 0 && typeof content === "string" && !content.trim()) {
            return;
          }

          index(content, ctx);
        });
      }
      //

      else if (
        _this.supportedMarkers.FOOTNOTE_MARKERS?.has(markerType) ||
        _this.supportedMarkers.CROSS_REFERENCE_MARKERS?.has(markerType)
      ) {
        let create = !ctx.$.note;

        if (create) {
          ctx.$.note = { marker: ctx.marker, quotes: [] };
        }

        if ("content" in content) {
          content.content?.forEach((content) => {
            index(content, ctx);
          });

          if (create && ctx.$.text) {
            ctx.$.text.note = ctx.$.note;

            delete ctx.$.text;
            delete ctx.$.note;
          }
        }
      }
    }

    const $: GlobalCtx = {};

    for (const content of this.contents.content) {
      index(content, { $ });
    }

    return this.book;
  }

  static extractContent(book: Book, key: IndexKey): IndexedContent {
    if (key === "title") {
      const { 1: _1, 2: _2 } = book.titles;

      return { key, title: [_2, _1].filter(Boolean).join("") };
    }
    //

    else if (key === "intro") {
      // NOOP: BSB doesn't provide intros
    }
    //

    else if (key.type === "section") {
      const section = book.chapters[key.chapter - 1]?.sections[key.section];

      const ref = section?.title?.ref?.map((r) => r.content).join();
      const title = section?.title?.content;

      let s: string | undefined;

      if (title) s = title;
      if (ref && s) s += ref;

      return { key, section: s };
    }
    //

    else if (key.type === "verse") {
      const section = book.chapters[key.chapter - 1]?.sections[key.section];
      const paragraphs = section?.paragraphs.slice();

      const verse: string[] = [];

      const findVerses = (p: Exclude<Paragraph, { type: "blank" }>) => {
        for (const t of p.content) {
          if ("content" in t) {
            if ("selection" in t) {
              if (t.selection.chapter === key.chapter && t.selection.verse === key.verse) {
                verse.push(t.content);
              } else if (t.selection.chapter === key.chapter && t.selection.verse > key.verse) {
                return true;
              }
            } else {
              findVerses(t);
            }
          }
        }
      };

      if (paragraphs) {
        for (const p of paragraphs) {
          if (p.type === "content" && findVerses(p)) {
            break;
          }
        }
      }

      return { key, verse };
    }

    throw new Error("Content not found");
  }
}
