import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./index.tsx", import.meta.url), "utf8");

function clientLabelsFor(os: "ios" | "windows"): string[] {
  const start = source.indexOf(`  ${os}: [`);
  assert.notEqual(start, -1, `Missing ${os} clients`);

  const labels: string[] = [];
  let depth = 0;
  let inBlock = false;

  for (const line of source.slice(start).split("\n")) {
    if (line.includes("[")) {
      depth += (line.match(/\[/g) ?? []).length;
      inBlock = true;
    }
    if (line.includes("]")) {
      depth -= (line.match(/\]/g) ?? []).length;
    }

    const label = line.match(/^ {6}label: "([^"]+)"/)?.[1];
    if (label) labels.push(label);

    if (inBlock && depth === 0) break;
  }

  return labels;
}

assert.deepEqual(clientLabelsFor("ios"), ["Clash Mi"]);

assert.deepEqual(clientLabelsFor("windows"), ["Happ", "Clash Verge", "Hiddify"]);
