import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const GUIDES_DIR = "src/content/guides";
const OG_DIR = "public";
const URL_PATTERN = /https?:\/\/[^\s)"'<>]+/g;
const DATE_IN_URL = /(20\d{2})[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])/;

const problems = [];

for (const file of (await readdir(GUIDES_DIR)).filter((f) => f.endsWith(".md"))) {
  const source = await readFile(join(GUIDES_DIR, file), "utf8");

  const slug = file.replace(/\.md$/, "");
  const ogCard = join(OG_DIR, `og-${slug}.png`);
  if (!existsSync(ogCard)) {
    problems.push(
      `${file}: no Open Graph card at ${ogCard}\n    run: node scripts/generate-og-images.mjs`
    );
  }

  const declared = source.match(/^publishDate:\s*(\S+)/m)?.[1];
  if (!declared) {
    problems.push(`${file}: no publishDate in frontmatter`);
    continue;
  }

  for (const url of source.match(URL_PATTERN) ?? []) {
    const found = url.match(DATE_IN_URL);
    if (!found) continue;

    const cited = found[0].replaceAll("/", "-");
    if (cited > declared) {
      problems.push(
        `${file}: published ${declared} but cites a source dated ${cited}\n    ${url}`
      );
    }
  }
}

if (problems.length > 0) {
  console.error("\nGuide checks failed:\n");
  for (const problem of problems) console.error(`  ${problem}`);
  console.error(
    "\nFor a date conflict: move the guide's publishDate on or after the cited date, or cite a revision that existed when the guide was published.\n"
  );
  process.exit(1);
}

const count = (await readdir(GUIDES_DIR)).filter((f) => f.endsWith(".md")).length;
console.log(`Guide checks passed (${count} guides: citation dates, OG cards).`);
