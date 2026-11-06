import fs from "node:fs/promises";
import { getSupportedMarkers } from "../formatting/supported-markers.ts";
import { Formatter } from "../formatting/formatter.ts";

export async function formatter(filePath: string) {
  const content = await fs.readFile(filePath, "utf8");

  const usjContent = JSON.parse(content);
  const supportedMarkers = getSupportedMarkers(usjContent);

  return new Formatter(filePath, usjContent, supportedMarkers);
}
