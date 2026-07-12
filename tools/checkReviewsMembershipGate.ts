import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

const translations = read("src/translations/translations.ts");
const outletDetail = read("src/screens/OutletDetailScreen.tsx");
const reviewStatsCard = read("src/components/cards/ReviewStatsCard.tsx");
const reviewAuthGuard = read("src/services/reviews/reviewAuthGuard.ts");
const reviewsService = read("src/services/reviewsRatingsService.ts");

const failures: string[] = [];
const assert = (condition: boolean, message: string) => {
  if (!condition) failures.push(message);
};

assert(
  !/Guest Rating|Misafir puanı|sharedCards\.reviews\.guestRating/.test(
    `${translations}\n${outletDetail}\n${reviewStatsCard}`,
  ),
  "Guest Rating/Misafir puanı wording or legacy guestRating key remains.",
);

const languages = ["en", "tr", "es", "fr", "de", "ru", "ar", "zh"];
const requiredKeys = [
  "sharedCards.reviews.overallRating",
  "outlet.reviews",
  "writeReview.title",
  "review.signInToWrite",
  "review.signInToHelpful",
  "review.helpful",
  "outlet.reviewSortHelpful",
  "outlet.reviewSortRecent",
  "outlet.noReviews",
];

for (const language of languages) {
  const languageBlock = new RegExp(`${language}:\\s*\\{[\\s\\S]*?\\n  \\}`, "m");
  const phaseBlock = new RegExp(`${language}:\\s*\\{[\\s\\S]*?${requiredKeys.join("[\\s\\S]*?")}[\\s\\S]*?\\n  \\}`, "m");
  assert(
    language === "en" || languageBlock.test(translations),
    `Missing translation object for ${language}.`,
  );
  for (const key of requiredKeys) {
    assert(
      new RegExp(`${language}:\\s*\\{[\\s\\S]*?"${key}"\\s*:`).test(translations) ||
        (language === "en" && new RegExp(`"${key}"\\s*:`).test(translations)),
      `Missing review membership key ${key} for ${language}.`,
    );
  }
  assert(phaseBlock.test(translations), `Review membership overlay incomplete for ${language}.`);
}

assert(
  /requireReviewAuth/.test(outletDetail) && /isReviewActionAllowed/.test(reviewAuthGuard),
  "Write/helpful review actions must use the centralized review auth guard.",
);
assert(
  /action:\s*"writeReview"/.test(outletDetail) && /action:\s*"helpful"/.test(outletDetail),
  "Both write review and helpful actions must call the review auth guard.",
);
assert(
  /navigation\.navigate\("Login"\)/.test(reviewAuthGuard),
  "Review auth guard must navigate guests to the existing Login auth route.",
);

const reviewCardBody = outletDetail.slice(outletDetail.indexOf("<ReviewStatsCard"), outletDetail.indexOf("</ScrollView>"));
assert(!/isLoggedIn|currentUser/.test(reviewCardBody.split("<ReviewStatsCard")[0]), "Rating summary path appears auth-gated.");
assert(/outletReviews\.length\s*>\s*0/.test(outletDetail), "Review list/empty state rendering path is missing.");
assert(/setReviewSort\(item\.key\)/.test(outletDetail), "Review sort controls should remain visible and unchanged.");

assert(
  !/fake|mock|lorem|dummy/i.test(`${outletDetail}\n${reviewStatsCard}`),
  "Review rendering paths introduced fake/mock/lorem/dummy content.",
);
assert(
  !/averageRating\s*\|\|\s*"0\.0"/.test(outletDetail) && /averageRating\s*\?\?\s*"0\.0"/.test(outletDetail),
  "Average rating display must not use || fallbacks that hide real 0.0 values.",
);
assert(
  /helpfulCount:\s*Number\(data\.helpfulCount \|\| 0\)/.test(reviewsService) || /review\.helpfulCount \|\| 0/.test(read("src/components/ReviewItem.tsx")),
  "Helpful count zero handling changed unexpectedly.",
);

if (failures.length) {
  console.error("Reviews membership gate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Reviews membership gate check passed.");
