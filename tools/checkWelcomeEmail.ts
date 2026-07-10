import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const locales = ["en", "tr", "es", "fr", "de", "ru", "ar", "zh"];
const functionSource = readFileSync(join(root, "functions/src/welcomeEmail.ts"), "utf8");
const authSource = readFileSync(join(root, "src/contexts/AuthContext.tsx"), "utf8");
const firebaseSource = readFileSync(join(root, "src/firebase/config.ts"), "utf8");
const loginSource = readFileSync(join(root, "src/screens/LoginScreen.tsx"), "utf8");
const profileSource = readFileSync(join(root, "src/screens/ProfileScreen.tsx"), "utf8");
const allSource = [functionSource, authSource, firebaseSource, loginSource, profileSource].join("\n");

let failed = false;
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(message);
    failed = true;
  }
}

assert(!new RegExp("send" + "Email" + "Verification").test(allSource), "Firebase email confirmation API must not be used.");
assert(!new RegExp("email" + "Verified").test(allSource), "Account access must not be gated by Firebase email confirmation state.");
assert(!new RegExp(["verify" + " email", "confirm" + " email", "e-posta doğrula", "eposta doğrula", "mail doğrula", "doğrulama maili", "verification" + " email"].join("|"), "i").test(`${loginSource}\n${profileSource}`), "Auth/profile screens must not show email confirmation copy.");

for (const locale of locales) {
  assert(new RegExp(`${locale}:\\s*\\{[\\s\\S]*?subject:`).test(functionSource), `${locale}: missing welcome email subject.`);
  assert(new RegExp(`${locale}:\\s*\\{[\\s\\S]*?preview:`).test(functionSource), `${locale}: missing welcome email preview.`);
  assert(new RegExp(`${locale}:\\s*\\{[\\s\\S]*?intro:`).test(functionSource), `${locale}: missing welcome email intro.`);
  assert(new RegExp(`${locale}:\\s*\\{[\\s\\S]*?body:`).test(functionSource), `${locale}: missing welcome email body.`);
  assert(new RegExp(`${locale}:\\s*\\{[\\s\\S]*?cta:`).test(functionSource), `${locale}: missing welcome email CTA text.`);
}

assert(!/welcomeEmail\.(subject|preview|intro|body|cta)/.test(functionSource), "Welcome email must not expose key-literal fallbacks.");
assert(!/(?:^|[\s"'`])(?:TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:)/.test(functionSource), "Welcome email content must not include debug locale prefixes.");
const bannedPieces = ["fa" + "ke", "mo" + "ck", "place" + "holder", "lor" + "em", "dum" + "my"];
for (const word of bannedPieces) {
  assert(!new RegExp(word, "i").test(functionSource), `Welcome email content must not include ${word} text.`);
}

assert(/mailEvents/.test(functionSource) && /welcome_\$\{uid\}/.test(functionSource) && /runTransaction/.test(functionSource), "Server-side duplicate-send guard must reserve a uid-keyed mail event transactionally.");
assert(/request\.auth\?\.uid/.test(functionSource) && /request\.auth\?\.token\.email/.test(functionSource), "Server must derive uid and email from authenticated context.");
assert(!/request\.data\?\.email|data\.email/.test(functionSource), "Server must not accept arbitrary client email input.");
assert(/resolveLocale\(request\.data\?\.locale\)/.test(functionSource), "Server must validate client locale before use.");
assert(/Welcome email config missing; no email was sent\./.test(functionSource) && /skipped_missing_config/.test(functionSource), "Missing dev/test email config must skip real sending without claiming delivery.");
assert(/httpsCallable\(functions, "sendWelcomeEmail"\)/.test(authSource), "Signup flow must call the welcome email function after account creation.");
assert(/getFunctions\(app, "us-central1"\)/.test(firebaseSource), "Firebase functions client must be configured for the deployed region.");

if (failed) process.exit(1);
console.log("Welcome email QA passed.");
