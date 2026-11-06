import { MARKERS, type Marker } from "../usfm/v3.1.ts";
import type { MarkedContent, RefContent, RootContent } from "./contract.ts";

export type MarkerGroup = keyof typeof MARKERS;

const markerMap = Object.entries(MARKERS).reduce(
  (info, [g, ls]) => {
    ls.forEach((m) => {
      info[m.type] = { ...m, group: g as MarkerGroup };
    });

    return info;
  },
  {} as { [marker: string]: Marker & { group: MarkerGroup } },
);

export const getMarkerInfo = (m: string) => {
  const t = getMarkerType(m);

  return markerMap[t] ?? markerMap[t + "#"]!;
};

export function getSupportedMarkers(
  content: string | RootContent | MarkedContent | RefContent,
  markers: { [group in MarkerGroup]?: Set<string> } = {},
) {
  //

  if (typeof content === "string") {
  } else if ("marker" in content) {
    const { group, type } = getMarkerInfo(content.marker);

    if (!markers[group]) {
      markers[group] = new Set();
    }

    markers[group].add(type);

    content.content?.forEach((content) => getSupportedMarkers(content, markers));
  } else content.content.forEach((content) => getSupportedMarkers(content, markers));

  return markers;
}

export function getMarkerLevel(t: string) {
  return parseInt(t.match(/\w+(\d)/)?.[1] ?? "");
}

export function getMarkerType(m: string) {
  let t = m;

  if (!Number.isNaN(getMarkerLevel(m))) {
    t = t.replace(/\d/, "#");
  }

  return t as Marker["type"];
}
