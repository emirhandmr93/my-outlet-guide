import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { outlets } from "../src/constants/outlets";
import {
  isWebSeoPublicOutlet,
  WEB_SEO_LANGUAGES,
} from "../src/constants/webSeo";

const DIST = join(process.cwd(), "dist");
const BATCH_SIZE = 100;
const publicOutlets = outlets.filter(isWebSeoPublicOutlet);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function requireIncludes(value: string, expected: string, context: string) {
  if (!value.includes(expected)) throw new Error(`${context}: missing ${JSON.stringify(expected)}`);
}

async function inBatches<T>(items: readonly T[], run: (item: T) => Promise<void>) {
  for (let index = 0; index < items.length; index += BATCH_SIZE) {
    await Promise.all(items.slice(index, index + BATCH_SIZE).map(run));
  }
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    await inBatches(publicOutlets, async (outlet) => {
      const html = await readFile(
        join(DIST, language, "outlet", `${outlet.outletId}.html`),
        "utf8",
      );
      requireIncludes(
        html,
        `data-outlet-visit-seo="${outlet.outletId}"`,
        `${language} outlet visit ${outlet.outletId}`,
      );
      requireIncludes(html, escapeHtml(outlet.name), `${language} outlet visit ${outlet.outletId} name`);
      if (outlet.address.trim()) {
        requireIncludes(
          html,
          escapeHtml(outlet.address.trim()),
          `${language} outlet visit ${outlet.outletId} address`,
        );
      }
    });
    console.log(`checkOutletVisitSeo: ${language} passed (${publicOutlets.length} outlets).`);
  }

  console.log(
    `checkOutletVisitSeo: verified visit-intent sections for ${publicOutlets.length} public outlets in ${WEB_SEO_LANGUAGES.length} languages.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
