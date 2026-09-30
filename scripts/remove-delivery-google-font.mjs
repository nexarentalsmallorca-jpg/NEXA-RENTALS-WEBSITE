import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const LOCALE_ROOT = path.join(
  ROOT,
  "app",
  "[locale]"
);

const DELIVERY_PREFIXES = [
  "scooter-delivery-",
  "entrega-scooter-",
  "roller-lieferung-",
  "livraison-scooter-",
  "consegna-scooter-",
];

let updated = 0;
let skipped = 0;
let failed = 0;

if (!fs.existsSync(LOCALE_ROOT)) {
  console.error(
    "ERROR: app/[locale] folder not found."
  );

  process.exit(1);
}

const folders = fs.readdirSync(
  LOCALE_ROOT,
  {
    withFileTypes: true,
  }
);

for (const folder of folders) {
  if (!folder.isDirectory()) {
    continue;
  }

  const isDeliveryPage =
    DELIVERY_PREFIXES.some(
      (prefix) =>
        folder.name.startsWith(prefix)
    );

  if (!isDeliveryPage) {
    continue;
  }

  const pagePath = path.join(
    LOCALE_ROOT,
    folder.name,
    "page.tsx"
  );

  if (!fs.existsSync(pagePath)) {
    skipped += 1;
    continue;
  }

  try {
    let source = fs.readFileSync(
      pagePath,
      "utf8"
    );

    const original = source;

    /*
     * 1. Remove Google Poppins import.
     */
    source = source.replace(
      /import\s+\{\s*Poppins\s*\}\s+from\s+["']next\/font\/google["'];?\s*\r?\n/g,
      ""
    );

    /*
     * 2. Remove:
     *
     * const pageFont = Poppins({
     *   ...
     * });
     */
    source = source.replace(
      /const\s+pageFont\s*=\s*Poppins\(\{[\s\S]*?\}\);\s*\r?\n/g,
      ""
    );

    /*
     * 3. Remove pageFont.variable from <main>.
     *
     * BEFORE:
     *
     * <main className={`${pageFont.variable} nexa-seo-page`}>
     *
     * AFTER:
     *
     * <main className="nexa-seo-page">
     */
    source = source.replace(
      /<main\s+className=\{\`\$\{pageFont\.variable\}\s+nexa-seo-page\`\}>/g,
      '<main className="nexa-seo-page">'
    );

    /*
     * Safety:
     * If there is still a next/font/google
     * reference, do not write the file.
     */
    if (
      source.includes(
        "next/font/google"
      )
    ) {
      throw new Error(
        "next/font/google still exists after replacement."
      );
    }

    if (
      source === original
    ) {
      skipped += 1;

      console.log(
        `SKIPPED  ${folder.name}`
      );

      continue;
    }

    fs.writeFileSync(
      pagePath,
      source,
      "utf8"
    );

    updated += 1;

    console.log(
      `UPDATED  ${folder.name}`
    );
  } catch (error) {
    failed += 1;

    console.log(
      `FAILED   ${folder.name}`
    );

    console.log(
      error instanceof Error
        ? error.message
        : String(error)
    );
  }
}

console.log("");
console.log("========================");
console.log("RESULT");
console.log("========================");
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
console.log(`Failed:  ${failed}`);
console.log("");