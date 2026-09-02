const LOCAL_BASE_URL = process.env.SEO_LOCAL_BASE_URL || "http://localhost:3000";
const PRODUCTION_BASE_URL = "https://www.nexarentals.es";
const CAMPAIGN_LAST_MODIFIED = "2026-08-29";
const EXPECTED_URL_COUNT = 110;
const EXPECTED_HREFLANGS = ["en", "de", "fr", "it", "es", "x-default"];
const CONCURRENCY = 1;

function decodeHtml(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function getAttribute(tag, attribute) {
  const expression = new RegExp(
    `\\b${attribute}\\s*=\\s*["']([^"']*)["']`,
    "i",
  );

  return decodeHtml(tag.match(expression)?.[1] || "");
}

function findTagByAttribute(html, tagName, attribute, expectedValue) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) || [];

  return (
    tags.find(
      (tag) =>
        getAttribute(tag, attribute).toLowerCase() ===
        expectedValue.toLowerCase(),
    ) || ""
  );
}

function extractTagText(html, tagName) {
  const expression = new RegExp(
    `<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`,
    "i",
  );

  return decodeHtml(html.match(expression)?.[1]?.trim() || "");
}

function extractCampaignUrls(sitemapXml) {
  const blocks = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/gi)];

  return blocks
    .map((match) => match[1])
    .filter((block) => block.includes(CAMPAIGN_LAST_MODIFIED))
    .map((block) => {
      const location = decodeHtml(
        block.match(/<loc>([\s\S]*?)<\/loc>/i)?.[1]?.trim() || "",
      );

      const hreflangs = new Set(
        [...block.matchAll(/hreflang=["']([^"']+)["']/gi)].map(
          (match) => match[1].toLowerCase(),
        ),
      );

      return { location, hreflangs };
    })
    .filter((entry) => entry.location);
}

async function auditPage(entry) {
  const productionUrl = new URL(entry.location);
  const localUrl = new URL(productionUrl.pathname, LOCAL_BASE_URL);
  const expectedLanguage = productionUrl.pathname.split("/").filter(Boolean)[0];
  const errors = [];
  const warnings = [];

  for (const hreflang of EXPECTED_HREFLANGS) {
    if (!entry.hreflangs.has(hreflang)) {
      errors.push(`sitemap missing hreflang=${hreflang}`);
    }
  }

  let response;

  try {
    response = await fetch(localUrl, { redirect: "manual" });
  } catch (error) {
    return {
      url: entry.location,
      title: "",
      errors: [`request failed: ${error.message}`],
      warnings,
    };
  }

  if (response.status !== 200) {
    const destination = response.headers.get("location");
    errors.push(
      destination
        ? `HTTP ${response.status} redirects to ${destination}`
        : `HTTP ${response.status}`,
    );

    return {
      url: entry.location,
      title: "",
      errors,
      warnings,
    };
  }

  const html = await response.text();
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] || "";
  const htmlLanguage = getAttribute(htmlTag, "lang");
  const title = extractTagText(html, "title");

  const descriptionTag = findTagByAttribute(
    html,
    "meta",
    "name",
    "description",
  );
  const description = getAttribute(descriptionTag, "content");

  const canonicalTag = findTagByAttribute(html, "link", "rel", "canonical");
  const canonical = getAttribute(canonicalTag, "href");

  const robotsTag = findTagByAttribute(html, "meta", "name", "robots");
  const robots = getAttribute(robotsTag, "content").toLowerCase();

  if (htmlLanguage !== expectedLanguage) {
    errors.push(
      `html lang is "${htmlLanguage || "missing"}", expected "${expectedLanguage}"`,
    );
  }

  if (!title) {
    errors.push("missing title");
  } else if (title.length < 25 || title.length > 65) {
    warnings.push(`title length ${title.length}`);
  }

  if (!description) {
    errors.push("missing meta description");
  } else if (description.length < 100 || description.length > 170) {
    warnings.push(`description length ${description.length}`);
  }

  if (canonical !== entry.location) {
    errors.push(
      `canonical is "${canonical || "missing"}", expected "${entry.location}"`,
    );
  }

  if (!robots) {
    warnings.push("missing robots meta (defaults to index/follow)");
  } else if (robots.includes("noindex")) {
    errors.push(`robots contains "${robots}"`);
  }

  return {
    url: entry.location,
    title,
    errors,
    warnings,
  };
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, runWorker),
  );

  return results;
}

async function main() {
  const sitemapUrl = `${LOCAL_BASE_URL}/sitemap.xml`;
  const sitemapResponse = await fetch(sitemapUrl);

  if (!sitemapResponse.ok) {
    throw new Error(
      `Could not load ${sitemapUrl}: HTTP ${sitemapResponse.status}`,
    );
  }

  const sitemapXml = await sitemapResponse.text();
  const campaignEntries = extractCampaignUrls(sitemapXml);

  console.log(`Found ${campaignEntries.length} campaign URLs in the sitemap.`);

  if (campaignEntries.length !== EXPECTED_URL_COUNT) {
    console.error(
      `Expected ${EXPECTED_URL_COUNT} URLs with lastmod ${CAMPAIGN_LAST_MODIFIED}.`,
    );
  }

  const results = await mapWithConcurrency(
    campaignEntries,
    CONCURRENCY,
    auditPage,
  );

  const titleOwners = new Map();

  for (const result of results) {
    if (!result.title) continue;

    const owners = titleOwners.get(result.title) || [];
    owners.push(result.url);
    titleOwners.set(result.title, owners);
  }

  for (const [title, urls] of titleOwners) {
    if (urls.length < 2) continue;

    for (const url of urls) {
      const result = results.find((item) => item.url === url);
      result?.errors.push(`duplicate title: "${title}"`);
    }
  }

  const failed = results.filter((result) => result.errors.length > 0);
  const warned = results.filter((result) => result.warnings.length > 0);
  const passed = results.length - failed.length;

  for (const result of results) {
    if (result.errors.length === 0 && result.warnings.length === 0) continue;

    console.log(`\n${result.url}`);

    for (const error of result.errors) {
      console.log(`  ERROR: ${error}`);
    }

    for (const warning of result.warnings) {
      console.log(`  WARNING: ${warning}`);
    }
  }

  console.log("\nSEO AUDIT SUMMARY");
  console.log(`Passed:   ${passed}`);
  console.log(`Failed:   ${failed.length}`);
  console.log(`Warnings: ${warned.length}`);
  console.log(`Total:    ${results.length}`);

  if (
    campaignEntries.length !== EXPECTED_URL_COUNT ||
    failed.length > 0
  ) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`SEO audit failed: ${error.message}`);
  process.exitCode = 1;
});
