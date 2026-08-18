/**
 * Post-processing step for the codegen pipeline.
 *
 * 1. orval emits `import * as zod from 'zod'` with Zod 4-style APIs (e.g.
 *    `zod.int()`), but this workspace resolves `zod` to 3.x so that
 *    `drizzle-zod` keeps working. Zod 3.25+ ships a `zod/v4` subpath that
 *    exposes the full Zod 4 API surface, so we rewrite the generated import to
 *    use that subpath.
 *
 * 2. orval also generates a TS type *and* a zod schema with the same name for
 *    request bodies/params/responses (e.g. `ApproveConversationBody`). Star
 *    re-exporting both from `lib/api-zod` conflicts (TS2308). We keep the zod
 *    schemas as the single source of truth and drop the colliding type files
 *    from `generated/types/index.ts`.
 *
 * Re-run with: pnpm --filter @workspace/api-spec run codegen
 *
 * NOTE: this script exists because orval cannot be told which zod subpath to
 * import nor how to name generated types. Once the workspace can move to
 * zod 4 unconditionally, delete this script and use 'zod' directly.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const generatedDir = resolve(dirname(fileURLToPath(import.meta.url)), "..", "api-zod", "src", "generated");
const target = resolve(generatedDir, "api.ts");
const typesIndex = resolve(generatedDir, "types", "index.ts");

// --- Step 1: rewrite the zod import to the v4 subpath ---------------------
const before = readFileSync(target, "utf-8");
const after = before.replace(
  /import \* as zod from ['"]zod['"]/,
  'import * as zod from "zod/v4"',
);

if (after === before) {
  console.log("fix-zod-import: zod import unchanged");
} else {
  writeFileSync(target, after);
  console.log("fix-zod-import: rewrote generated import to zod/v4");
}

// --- Step 2: drop type re-exports that collide with zod schema names -------
const apiSource = readFileSync(target, "utf-8");
const valueNames = new Set(
  [...apiSource.matchAll(/export const ([A-Za-z0-9_]+) =/g)].map((m) => m[1]),
);

const indexSource = readFileSync(typesIndex, "utf-8");
const keptLines = [];
const dropped = [];
for (const line of indexSource.split("\n")) {
  const match = line.match(/export \* from ['"]([^'"]+)['"]/);
  if (!match) {
    keptLines.push(line);
    continue;
  }
  const typeFile = resolve(dirname(typesIndex), `${match[1]}.ts`);
  let collides = false;
  try {
    const typeSource = readFileSync(typeFile, "utf-8");
    for (const typeMatch of typeSource.matchAll(/export (?:type|interface) ([A-Za-z0-9_]+)/g)) {
      if (valueNames.has(typeMatch[1])) {
        collides = true;
        break;
      }
    }
  } catch {
    collides = true;
  }
  if (collides) {
    dropped.push(basename(match[1]));
  } else {
    keptLines.push(line);
  }
}

if (dropped.length === 0) {
  console.log("fix-zod-import: no colliding type re-exports to drop");
} else {
  writeFileSync(typesIndex, keptLines.join("\n"));
  console.log(`fix-zod-import: dropped colliding type re-exports: ${dropped.join(", ")}`);
}
