/**
 * NOTE:
 * Using BSB supported markers, for now
 */

import { bcvMarkup, type BCVMarkup } from "./bcv.ts";
import {
  flatTextContent,
  type IndexedContent,
  type IndexKey,
  type MarkedContent,
  type NumberedContent,
  type RefContent,
  type RootContent,
  type VerseKey,
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
  type: "t";
  content: string;
  selection: { chapter: number; verse: number };
  note?: Note;
}

export interface OtherText {
  type: "z";
  marker?: string;
  content: string;
}

export type Note = {
  type: "n";
  marker: string;
  quotes: { content: string | BCVMarkup[]; marker?: string }[];
};

type SectionTitle = { type: "t"; marker: string; content: string };
type SectionRef = { type: "r"; marker: string; content: BCVMarkup[] };

export interface Section {
  title: (SectionTitle | SectionRef | Exclude<Paragraph, { type: "b" }>)[];

  paragraphs: Paragraph[];
}

export type Verse = { verse: number };

export type Paragraph =
  | {
      type: "p";
      marker: string; // used for styling
      content: (OtherText | Text | Verse | Paragraph)[];
    }
  | { type: "b" };

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
      marker?: string;
      paragraph?: Exclude<Paragraph, { type: "b" }>;
    }

    function index(content: string | NumberedContent | MarkedContent | RefContent, ctx: Ctx) {
      //

      if (typeof content === "string") {
        if (ctx.$.note) {
          const markup = bcvMarkup(content);

          ctx.$.note.quotes.push({
            /* If any markup contains a bcv then this quote should be rendered as bcv markup*/
            content: markup.some((m) => m.bcv) ? markup : content,
            marker: ctx.marker,
          });
        }
        //

        else if (ctx.paragraph) {
          // add verse text if chapter and verse are defined
          if (ctx.$.chapter && ctx.$.verse) {
            ctx.paragraph.content.push(
              (ctx.$.text = {
                type: "t",
                content,
                selection: { chapter: ctx.$.chapter.n, verse: ctx.$.verse },
              }),
            );
          }
          // no verse so this is 'other' text. This is some kind of rogue text we find in the psalms before the beginning of
          // some chapters.
          else {
            ctx.paragraph.content.push({ type: "z", marker: ctx.marker, content });
          }
        }

        return;
      }

      // note `ref`s
      if ("loc" in content) {
        ctx.$.note?.quotes.push({
          content: bcvMarkup(flatTextContent(content.content)),
          marker: content.type,
        });

        return;
      }

      const markerType = getMarkerType(
        /** handle situations where ms1 is encoded as ms */
        content.marker === "ms" ? "ms1" : content.marker,
      );

      ctx.marker = content.marker;

      if (markerType === "h" && "content" in content) {
        _this.book.name = flatTextContent(content.content);
      }
      //

      else if ("number" in content) {
        if (markerType === "c") {
          ctx.$.section = { title: [], paragraphs: [] };
          ctx.$.chapter = { n: parseInt(content.number), sections: [ctx.$.section] };

          _this.book.chapters.push(ctx.$.chapter);

          delete ctx.$.verse;

          //
        } else if (ctx.paragraph) {
          ctx.$.verse = parseInt(content.number);
          ctx.paragraph.content.push({ verse: ctx.$.verse });
        }
      }
      //

      else if (_this.supportedMarkers.BOOK_TITLES_AND_SECTIONS_MARKERS?.has(markerType)) {
        if (!ctx.$.chapter) {
          // no chapter defined yet means we're still indexing book titles

          const titleLevel = getMarkerLevel(content.marker) as SupportedTitleLevels;

          _this.book.titles[titleLevel] = flatTextContent(content.content);
        }
        //

        else {
          // handle section header refs

          if (markerType === "r" || markerType === "mr") {
            //

            const ref = flatTextContent(content.content);

            if (
              /*
               * Make sure there's a title before appending parallel refs
               */
              (markerType === "r" && ctx.$.section?.title.length) ||
              /*
               * If no paragraph has yet to be appended then this is a major section ref
               */
              (markerType === "mr" && ctx.$.section?.paragraphs.length === 0)
            ) {
              ctx.$.section.title.push({ type: "r", marker: ctx.marker, content: bcvMarkup(ref) });

              //
            }
            // We have paragraphs already appended so this `mr` is a paragraph

            else if (markerType === "mr") {
              ctx.$.section?.paragraphs.push({
                type: "p",
                marker: ctx.marker,
                content: [
                  {
                    type: "t",
                    content: ref,
                    selection: { chapter: ctx.$.chapter.n, verse: ctx.$.verse! },
                  },
                ],
              });
            }
          }
          //

          else {
            // handle `d` as a paragraph because some contain verses and notes

            if (markerType === "d") {
              const p: Paragraph = { type: "p", marker: "d", content: [] };

              ctx.$.section?.title.push(p);
              ctx.paragraph = p;

              content.content?.forEach((content) => {
                // NOTE: keep beginning spaces for `d`

                index(content, ctx);
              });
            }
            //

            else {
              const title = flatTextContent(content.content);

              // append any titles found before paragraphs are found: s2, s1, ...
              if (ctx.$.section?.paragraphs.length === 0) {
                ctx.$.section.title.push({ type: "t", marker: ctx.marker, content: title });
              }
              // append new section and make it ctx.$.section

              else {
                ctx.$.chapter.sections.push(
                  (ctx.$.section = {
                    title: [{ type: "t", marker: ctx.marker, content: title }],
                    paragraphs: [],
                  }),
                );
              }
            }
          }
        }
      }
      //

      else if ((content.type === "para" || markerType === "wj") && ctx.$.section) {
        //

        const p: Paragraph =
          markerType === "b" ? { type: "b" } : { type: "p", marker: content.marker, content: [] };

        if (ctx.paragraph) {
          ctx.paragraph.content.push(p);
        } else {
          ctx.$.section.paragraphs.push(p);
        }

        if (p.type === "p") {
          ctx.paragraph = p;
        }

        content.content?.forEach((content, i) => {
          // NOTE: skip redundant beginning spaces. They cause issues in completeness tests that skips these spaces.
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
          ctx.$.note = { type: "n", marker: ctx.marker, quotes: [] };
        }

        if ("content" in content) {
          content.content?.forEach((content) => {
            index(content, ctx);
          });

          // handling text note completion under 'a was tough. So let's handle it here.
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
    //

    /**
     * Traverse paragraph trees and find all text nodes or text nodes that match the selector key `k`.
     * Notes can also be appended to the verse text if `appendNotes` is included.
     */
    const findVerses = (
      {
        appendNotes,
        ...p
      }: Exclude<Paragraph, { type: "b" }> & {
        /** For flattened indexed section content that contains note text */
        appendNotes?: boolean;
      },
      k?: VerseKey,
      v: string[] = [],
    ): [verseTexts: string[], selectorMatch: boolean] => {
      for (const _p of p.content) {
        if (typeof _p === "string") {
          if (!k) v.push(_p);
        }
        //

        else if ("content" in _p) {
          if (_p.type === "t") {
            // text node
            const t = _p;

            // use selector
            if (k) {
              if (t.selection.chapter === k.chapter && t.selection.verse === k.verse) {
                v.push(t.content);
              } else if (t.selection.chapter === k.chapter && t.selection.verse > k.verse) {
                return [v, true] as const;
              }
            } else /* Add all text nodes */ v.push(t.content);

            if (appendNotes && t.note) {
              v.push(
                t.note.quotes
                  .map((q) =>
                    typeof q.content === "string"
                      ? q.content
                      : q.content.map((b) => b.text).join(""),
                  )
                  .join(""),
              );
            }
          } else if (_p.type === "z") {
            if (!k) {
              // add other text if no selector
              v.push(_p.content);
            }
          } else {
            return findVerses({ ..._p, appendNotes }, k, v);
          }
        }
      }

      return [v, false] as const;
    };

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

      const title = section?.title
        ?.map((t) =>
          t.type === "t"
            ? t.content
            : t.type === "r"
              ? t.content.map((r) => r.text).join("")
              : // contentIndex in contract.ts uses flatTextContent for section titles which unfortunately appends notes
                // with the section titles
                findVerses({ ...t, appendNotes: true })[0].join(""),
        )
        .join("");

      return { key, section: title };
    }
    //

    else if (key.type === "verse") {
      const section = book.chapters[key.chapter - 1]?.sections[key.section];
      const paragraphs = section?.paragraphs.slice();

      const verse: string[] = [];

      if (paragraphs) {
        for (const p of paragraphs) {
          if (p.type === "p" && findVerses(p, key, verse)[1]) {
            break;
          }
        }
      }

      return { key, verse };
    }

    throw new Error("Content not found");
  }
}
