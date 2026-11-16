import type { Paragraph, Text } from "@popup-bible/flat-converter";
import book from "@popup-bible/flat-converter/bsb/Acts";

import preview from "#.storybook/preview";

import { App } from "../app/App.tsx";
import { BookText } from "./BookText.tsx";

const meta = preview.meta({
  component: BookText,
  decorators: [
    (Story) => (
      <App container={document.body}>
        <Story />
      </App>
    ),
  ],
});

const pWithNotedText = book.chapters[0]?.sections[0]?.paragraphs.find(
  (p) => p.type === "p" && p.content.some((t) => "note" in t),
);

let bookTextWithNote!: Text;

const possibleBookTextWithNote =
  pWithNotedText?.type === "p" && pWithNotedText.content.find((t) => "note" in t);

if (possibleBookTextWithNote && "note" in possibleBookTextWithNote) {
  bookTextWithNote = possibleBookTextWithNote;
}

export const Note = meta.story({
  name: "with Note",

  args: { bookText: bookTextWithNote, isPassage: true },

  play: async ({ canvas, userEvent }) => {
    const text = canvas.getByText(bookTextWithNote.content);

    await userEvent.click(text);
  },
});

function isPWithBCVNotedText(p: Paragraph) {
  return (
    p.type === "p" &&
    p.content.some((t) => {
      if ("note" in t) {
        const Q = t.note?.quotes.filter(
          (q) => Array.isArray(q.content) && q.content.some((m) => m.bcv),
        );

        return Q?.length && Q.length >= 2;
      }

      return false;
    })
  );
}

const pWithBCVNotedText = book.chapters
  .find((c) => c.sections.some((s) => s.paragraphs.some(isPWithBCVNotedText)))
  ?.sections.find((s) => s.paragraphs.some(isPWithBCVNotedText))
  ?.paragraphs.find(isPWithBCVNotedText);

let bookTextWithBCVNote!: Text;

const possibleBookTextWithBCVNote =
  pWithBCVNotedText?.type === "p" && pWithBCVNotedText.content.find((t) => "note" in t);

if (possibleBookTextWithBCVNote && "note" in possibleBookTextWithBCVNote) {
  bookTextWithBCVNote = possibleBookTextWithBCVNote;
}

export const BCVNote = meta.story({
  name: "with BCV in Note",

  args: { bookText: bookTextWithBCVNote, isPassage: true },

  play: async ({ canvas, userEvent }) => {
    const text = canvas.getByText(bookTextWithBCVNote.content);

    await userEvent.click(text);
  },
});
