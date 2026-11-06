import fs from "node:fs/promises";
import path from "node:path";

import { describe, it } from "node:test";

import assert from "node:assert/strict";
import { contentIndex } from "./contract.ts";
import { getSupportedMarkers } from "./supported-markers.ts";
import { Formatter, type Book } from "./formatter.ts";

await describe("Content completeness", async (ctx) => {
  const files = await fs.readdir(path.resolve(ctx.filePath!, "../../usj/assets/bsb/formatted/"), {
    withFileTypes: true,
  });

  for (const file of files) {
    const { default: book } = (await import(path.join(file.parentPath, file.name))) as {
      default: Book;
    };

    const originalContent = JSON.parse(await fs.readFile(book.path, "utf8"));

    const supportedMarkers = getSupportedMarkers(originalContent);
    const index = contentIndex(originalContent, supportedMarkers);

    for (const indexedContent of index) {
      if (indexedContent.key === "title") {
        await it("preserves titles", () => {
          const content = Formatter.extractContent(book, "title");

          if ("title" in content && "title" in indexedContent) {
            assert.equal(content.title, indexedContent.title);
          }
        });
      }
      //

      else if (indexedContent.key === "intro") {
        //skip for now
      }
      //

      else if (indexedContent.key.type === "section") {
        //

        await it(`preserves (chapter ${indexedContent.key.chapter}: section ${indexedContent.key.section})`, () => {
          const content = Formatter.extractContent(book, indexedContent.key);

          if ("section" in content && "section" in indexedContent) {
            assert.equal(content.section, indexedContent.section);
          }
        });

        //
      } else if (indexedContent.key.type === "verse") {
        //

        await it(`preserves (chapter ${indexedContent.key.chapter}: section ${indexedContent.key.section} : verse ${indexedContent.key.verse})`, () => {
          const content = Formatter.extractContent(book, indexedContent.key);

          if ("verse" in content && "verse" in indexedContent) {
            assert.equal(content.verse.join(), indexedContent.verse.join());
          }
        });
      }
    }
  }
});
