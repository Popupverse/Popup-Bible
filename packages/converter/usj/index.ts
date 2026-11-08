#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

import { Crust } from "@crustjs/core";
import { help, version } from "@crustjs/extensions";

import { bcv_parser } from "bible-passage-reference-parser";
import * as bcv_en from "bible-passage-reference-parser/esm/lang/en.js";

import pkg from "../package.json" with { type: "json" };
import { formatter } from "./formatter.ts";

const parser = new bcv_parser(bcv_en);

parser.set_options({
  book_alone_strategy: "full",
});

const app = new Crust("popup-bible-flat-converter", { version: pkg.version })
  .extend(version(), help())
  .args({
    name: "input",
    type: "string",
    description:
      "Path to usj file or folder containing usj files. Defaults to the current directory",
    default: ".",
  })
  .args({
    name: "output",
    type: "string",
    description: "Output folder. Defaults to current directory",
    default: ".",
  })
  .flags({ name: "verbose", type: "boolean", default: false })
  .action(async ({ args }) => {
    const inputPath = args.input === "." ? process.cwd() : args.input;
    const outputDir = args.output === "." ? process.cwd() : args.output;

    // make sure output dir is available
    await fs.mkdir(outputDir, { recursive: true });

    const stats = await fs.stat(inputPath);

    const convert = async (filePath: string) => {
      const f = await formatter(filePath);

      const formatted = f.format();

      const osis = parser.parse(formatted.name).osis();

      const outputPath = path.join(outputDir, osis + ".js");

      const output = `
/**
 * @type {import('#formatter').Book}
 */
const content = ${JSON.stringify(formatted, null, 2)}; 

export default content;
`;

      await fs.writeFile(outputPath, output, "utf8");
    };

    if (stats.isDirectory()) {
      const files = await fs.readdir(inputPath, { withFileTypes: true });

      for (const file of files) {
        // using `resolve` to get absolute file path that will set in `book.path``
        await convert(path.resolve(file.parentPath, file.name));
      }
    } else {
      await convert(inputPath);
    }
  });

await app.execute();
