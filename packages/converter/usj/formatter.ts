import fs from "node:fs/promises";

import { Formatter } from "../formatting/formatter.ts";
import { getSupportedMarkers } from "../formatting/supported-markers.ts";

export async function formatter(filePath: string) {
  const content = await fs.readFile(filePath, "utf8");

  const usjContent = JSON.parse(content);
  const supportedMarkers = getSupportedMarkers(usjContent);

  return new Formatter(filePath, usjContent, supportedMarkers);
}
