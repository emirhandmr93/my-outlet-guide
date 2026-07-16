import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

type ExpoConfig = {
  expo?: {
    name?: string;
    icon?: string;
    splash?: { image?: string };
    android?: { adaptiveIcon?: { foregroundImage?: string; backgroundImage?: string; monochromeImage?: string } };
    web?: { favicon?: string };
  };
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
  console.log(`OK: ${message}`);
}

function appPath(assetPath: string) {
  return assetPath.replace(/^\.\//, "");
}

function readPng(path: string) {
  const buffer = readFileSync(path);
  assert(buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${path} is a PNG`);

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat: Buffer[] = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    }
    if (type === "IDAT") idat.push(data);
    offset += length + 12;
  }
  return { width, height, bitDepth, colorType, idat: Buffer.concat(idat) };
}

function assertOpaquePng(path: string) {
  const png = readPng(path);
  assert(png.bitDepth === 8, `${path} uses 8-bit channels for iOS opacity validation`);
  assert(png.colorType === 2 || png.colorType === 6, `${path} has a supported truecolor PNG format`);
  if (png.colorType === 2) {
    console.log(`OK: ${path} is opaque for iOS`);
    return;
  }

  const bytesPerPixel = 4;
  const stride = png.width * bytesPerPixel;
  const data = inflateSync(png.idat);
  let previous = Buffer.alloc(stride);
  let offset = 0;
  for (let row = 0; row < png.height; row += 1) {
    const filter = data[offset++];
    const current = Buffer.from(data.subarray(offset, offset + stride));
    offset += stride;
    for (let index = 0; index < stride; index += 1) {
      const left = index >= bytesPerPixel ? current[index - bytesPerPixel] : 0;
      const above = previous[index];
      const upperLeft = index >= bytesPerPixel ? previous[index - bytesPerPixel] : 0;
      if (filter === 1) current[index] = (current[index] + left) & 255;
      if (filter === 2) current[index] = (current[index] + above) & 255;
      if (filter === 3) current[index] = (current[index] + Math.floor((left + above) / 2)) & 255;
      if (filter === 4) {
        const prediction = left + above - upperLeft;
        const leftDistance = Math.abs(prediction - left);
        const aboveDistance = Math.abs(prediction - above);
        const upperLeftDistance = Math.abs(prediction - upperLeft);
        const paeth = leftDistance <= aboveDistance && leftDistance <= upperLeftDistance ? left : aboveDistance <= upperLeftDistance ? above : upperLeft;
        current[index] = (current[index] + paeth) & 255;
      }
    }
    for (let index = 3; index < stride; index += bytesPerPixel) assert(current[index] === 255, `${path} is opaque for iOS`);
    previous = current;
  }
  console.log(`OK: ${path} is opaque for iOS`);
}

const configText = readFileSync("app.json", "utf8");
const config = JSON.parse(configText) as ExpoConfig;
const expo = config.expo ?? {};
const adaptiveIcon = expo.android?.adaptiveIcon ?? {};
const homeHeader = readFileSync("src/components/HomeHeader.tsx", "utf8");
const requiredPaths = [expo.icon, adaptiveIcon.foregroundImage, adaptiveIcon.backgroundImage, adaptiveIcon.monochromeImage, expo.web?.favicon, expo.splash?.image].filter((path): path is string => Boolean(path));

assert(expo.name === "My Outlet Guide", "app name remains My Outlet Guide");
assert(expo.icon === "./assets/icon.png", "iOS icon uses ./assets/icon.png");
assert(adaptiveIcon.foregroundImage === "./assets/adaptive-icon-foreground.png", "Android adaptive foreground uses the final local asset");
assert(adaptiveIcon.backgroundImage === "./assets/adaptive-icon-background.png", "Android adaptive background uses the final local asset");
assert(adaptiveIcon.monochromeImage === "./assets/adaptive-icon-monochrome.png", "Android adaptive monochrome uses the final local asset");
assert(expo.web?.favicon === "./assets/favicon.png", "favicon uses the final local asset");
assert(expo.splash?.image === "./assets/splash-icon.png", "splash uses the final local asset when configured");
for (const assetPath of requiredPaths) assert(existsSync(appPath(assetPath)), `configured branding asset exists: ${assetPath}`);

assert(!/android-icon-/i.test(configText), "app config has no old android-icon references");
assert(!/(expo[- ]?default|default[- ]?icon|placeholder[- ]?icon)/i.test(configText), "app config has no Expo/default/placeholder icon references");
assert(!/https?:\/\//i.test(configText), "app config has no remote icon URLs");
assert(!/(A-letter|MOG-letter|letter[- ]?icon)/i.test(configText + homeHeader), "branding has no A-letter or MOG-letter references");
assert(homeHeader.includes('const brandIcon = require("../../assets/icon.png")'), "Home header loads the final local icon asset");
assert(homeHeader.includes("source={brandIcon}") && homeHeader.includes("MY OUTLET GUIDE"), "Home header renders the final icon with MY OUTLET GUIDE text");

const mainIcon = readPng("assets/icon.png");
assert(mainIcon.width === mainIcon.height, "main icon is square");
assert(mainIcon.width >= 1024, "main icon is at least 1024x1024");
assertOpaquePng("assets/icon.png");
for (const path of ["assets/adaptive-icon-foreground.png", "assets/adaptive-icon-background.png", "assets/adaptive-icon-monochrome.png"]) {
  const png = readPng(path);
  assert(png.width === png.height, `${path} is square`);
}

const changedAssets = execFileSync("git", ["diff", "--name-only", "HEAD", "--", "assets"], { encoding: "utf8" }).trim();
assert(changedAssets.length === 0, "working task diff does not change files under assets/");
console.log("App icon branding checks passed.");
