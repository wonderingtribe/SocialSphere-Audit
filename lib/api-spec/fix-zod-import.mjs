/**
 * Post-processing step for the codegen pipeline.
 *
 * orval emits `import * as zod from 'zod'` with Zod 4-style APIs (e.g.
 * `zod.int()`), but this workspace resolves `zod` to 3.x so that
 * `drizzle-zod` keeps working. Zod 3.25+ ships a `zod/v4` subpath that
 * exposes the full Zod 4 API surface, so we rewrite the generated import to
 * use that subpath.
 *
 * Re-run with: pnpm --filter @workspace/api-spec run codegen
 *
 * NOTE: this script exists because orval cannot be told which zod subpath to
 * import. Once the workspace can move to zod 4 unconditionally, delete this
 * script and use 'zod' directly.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const target = resolve(
  import.meta.dirname,
  "..",
  "api-zod",
  "src",
  "generated",
  "api.ts",
);

const before = readFileSync(target, "utf-8");
const after = before.replace(
  /import \* as zod from ['"]zod['"]/,
  'import * as zod from "zod/v4"',
);

if (after === before) {
  console.log("fix-zod-import: no change needed");
} else {
  writeFileSync(target, after);
  console.log("fix-zod-import: rewrote generated import to zod/v4");
}