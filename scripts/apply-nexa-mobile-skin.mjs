import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "app");

const COMPONENT_NAME = "NexaSeoMobileSkin";

/*
 * KEEP THIS TRUE FIRST.
 *
 * TRUE  = only shows what WOULD be changed.
 * FALSE = actually modifies the pages.
 */
const DRY_RUN = false;

/*
 * Pages we already manually rebuilt with the finished mobile design.
 * Do not apply the shared skin to them again.
 */
const SKIP_ROUTES = [
  "scooter-rental-mallorca",
  "rent-a-scooter-mallorca",
  "location-scooter-magaluf",
];

function findPageFiles(directory) {
  const results = [];

  if (!fs.existsSync(directory)) {
    return results;
  }

  const entries = fs.readdirSync(directory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...findPageFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name === "page.tsx") {
      results.push(fullPath);
    }
  }

  return results;
}

/*
 * THIS is the important corrected detector.
 *
 * Your old SEO pages use:
 *
 * nexa-seo-page
 * nexa-hero-section
 * generateMetadata
 *
 * Example:
 *
 * <main className={`${pageFont.variable} nexa-seo-page`}>
 */
function looksLikeNexaSeoPage(source) {
  return (
    source.includes("nexa-seo-page") &&
    source.includes("nexa-hero-section") &&
    source.includes("generateMetadata")
  );
}

function shouldSkip(filePath, source) {
  const normalized = filePath.replaceAll("\\", "/");

  /*
   * Already converted.
   */
  if (source.includes(COMPONENT_NAME)) {
    return true;
  }

  /*
   * Protect manually completed pages.
   */
  for (const route of SKIP_ROUTES) {
    if (normalized.includes(`/${route}/page.tsx`)) {
      return true;
    }
  }

  /*
   * Additional protection.
   */
  const blockedFolders = [
    "/admin/",
    "/admin-nexa-secret/",
    "/api/",
    "/checkout/",
    "/booking/",
    "/dashboard/",
  ];

  for (const folder of blockedFolders) {
    if (normalized.includes(folder)) {
      return true;
    }
  }

  return false;
}

function getImportPath(filePath) {
  const componentPath = path.join(
    APP_DIR,
    "components",
    "NexaSeoMobileSkin"
  );

  const pageDirectory = path.dirname(filePath);

  let relativePath = path.relative(
    pageDirectory,
    componentPath
  );

  relativePath = relativePath.replaceAll("\\", "/");

  if (!relativePath.startsWith(".")) {
    relativePath = `./${relativePath}`;
  }

  return relativePath;
}

function addImport(source, importPath) {
  const importLine =
    `import ${COMPONENT_NAME} from "${importPath}";`;

  if (source.includes(importLine)) {
    return source;
  }

  const firstImport = source.search(/^import\s/m);

  if (firstImport === -1) {
    return importLine + "\n\n" + source;
  }

  return (
    source.slice(0, firstImport) +
    importLine +
    "\n" +
    source.slice(firstImport)
  );
}

function addMobileSkin(source) {
  /*
   * Robustly find the opening <main ...> that contains
   * the nexa-seo-page class.
   *
   * This works with:
   *
   * <main className={`${pageFont.variable} nexa-seo-page`}>
   *
   * as well as normal className strings.
   */

  const markerIndex = source.indexOf("nexa-seo-page");

  if (markerIndex === -1) {
    return null;
  }

  const mainStart = source.lastIndexOf("<main", markerIndex);

  if (mainStart === -1) {
    return null;
  }

  const mainEnd = source.indexOf(">", markerIndex);

  if (mainEnd === -1) {
    return null;
  }

  const openingMainTag = source.slice(
    mainStart,
    mainEnd + 1
  );

  if (!openingMainTag.includes("nexa-seo-page")) {
    return null;
  }

  const insertion =
    `\n      <${COMPONENT_NAME} />`;

  return (
    source.slice(0, mainEnd + 1) +
    insertion +
    source.slice(mainEnd + 1)
  );
}

function processFile(filePath) {
  let source = fs.readFileSync(filePath, "utf8");

  if (shouldSkip(filePath, source)) {
    return {
      status: "skipped",
      filePath,
    };
  }

  if (!looksLikeNexaSeoPage(source)) {
    return {
      status: "ignored",
      filePath,
    };
  }

  const importPath = getImportPath(filePath);

  let updatedSource = addImport(
    source,
    importPath
  );

  updatedSource = addMobileSkin(
    updatedSource
  );

  if (!updatedSource) {
    return {
      status: "failed",
      filePath,
    };
  }

  /*
   * DRY RUN:
   * show the page but DON'T edit anything.
   */
  if (DRY_RUN) {
    return {
      status: "would-update",
      filePath,
    };
  }

  /*
   * Create backup before changing anything.
   */
  const backupPath =
    `${filePath}.before-mobile-skin`;

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(
      filePath,
      backupPath
    );
  }

  fs.writeFileSync(
    filePath,
    updatedSource,
    "utf8"
  );

  return {
    status: "updated",
    filePath,
  };
}

console.log("");
console.log("====================================");
console.log("NEXA SEO MOBILE SKIN");
console.log("====================================");
console.log("");

console.log(
  DRY_RUN
    ? "MODE: DRY RUN - NOTHING WILL BE CHANGED"
    : "MODE: APPLYING CHANGES"
);

console.log("");

if (!fs.existsSync(APP_DIR)) {
  console.error(
    "ERROR: app folder was not found."
  );

  console.error(
    "Run the script from the root of the NEXA project."
  );

  process.exit(1);
}

const pageFiles =
  findPageFiles(APP_DIR);

let wouldUpdateCount = 0;
let updatedCount = 0;
let skippedCount = 0;
let ignoredCount = 0;
let failedCount = 0;

for (const filePath of pageFiles) {
  const result =
    processFile(filePath);

  const relative = path
    .relative(ROOT, result.filePath)
    .replaceAll("\\", "/");

  switch (result.status) {
    case "would-update":
      wouldUpdateCount += 1;

      console.log(
        `WOULD UPDATE  ${relative}`
      );

      break;

    case "updated":
      updatedCount += 1;

      console.log(
        `UPDATED       ${relative}`
      );

      break;

    case "skipped":
      skippedCount += 1;

      console.log(
        `SKIPPED       ${relative}`
      );

      break;

    case "failed":
      failedCount += 1;

      console.log(
        `FAILED        ${relative}`
      );

      break;

    default:
      ignoredCount += 1;
      break;
  }
}

console.log("");
console.log("====================================");
console.log("RESULT");
console.log("====================================");

console.log(
  `Would update: ${wouldUpdateCount}`
);

console.log(
  `Updated:      ${updatedCount}`
);

console.log(
  `Skipped:      ${skippedCount}`
);

console.log(
  `Ignored:      ${ignoredCount}`
);

console.log(
  `Failed:       ${failedCount}`
);

console.log("");

if (DRY_RUN) {
  console.log(
    "SAFE MODE: no files were changed."
  );

  console.log(
    "Check the WOULD UPDATE list before applying."
  );
} else {
  console.log(
    "Original files were backed up as:"
  );

  console.log(
    "page.tsx.before-mobile-skin"
  );
}

console.log("");