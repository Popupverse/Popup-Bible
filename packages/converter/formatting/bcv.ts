import { bcv_parser } from "bible-passage-reference-parser";
import * as bcv_en from "bible-passage-reference-parser/esm/lang/en.js";

export const parser = new bcv_parser(bcv_en);

export interface BCV {
  b?: string;
  c?: number;
  v?: number;
}

export interface BCVRange {
  start: BCV;
  end?: BCV;
}

export type BCVMarkup = { text: string; bcv?: BCVRange };

export function bcvMarkup(str: string): BCVMarkup[] {
  const markup: BCVMarkup[] = [];

  const parsedEntities = (parser.parse(str) as typeof parser).parsed_entities();

  let lastIndex = 0;

  for (const possibleCollectionEntity of parsedEntities) {
    if (!possibleCollectionEntity.osis) continue;

    const mark = (entity: (typeof possibleCollectionEntity.entities)[number]) => {
      if ("entities" in entity) {
        const [startIndex, endIndex] = entity.indices;

        const pretext = str.slice(lastIndex, startIndex);
        const text = str.slice(startIndex, endIndex);

        if (pretext) markup.push({ text: pretext });

        const {
          start: { type: _1, ...start },
          end: { type: _2, ...end },
        } = entity;

        markup.push({ text, bcv: { start, end } });

        lastIndex = endIndex;
      }
    };

    if (possibleCollectionEntity.entities.length > 1) {
      // is a collection: a list of passages e.g Mat 1:1, Jud 1:3, ...
      possibleCollectionEntity.entities.forEach(mark);
    } else {
      mark(possibleCollectionEntity.entities[0]!);
    }
  }

  const root = str.slice(lastIndex);

  if (root) {
    markup.push({ text: root });
  }

  return markup;
}
