import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "lib/blog-slug-index.ts");

execSync("npx tsx scripts/generate-blog-slug-index-runner.ts", {
  cwd: root,
  stdio: "inherit",
});
