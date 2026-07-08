import fs from "node:fs";

export type MediaFileInspection = {
  exists: boolean;
  format: "webp" | "jpeg" | "png" | "avif" | "unknown";
  width?: number;
  height?: number;
  fileSizeBytes: number;
};

export const minimumReasonableMediaFileSizeBytes = 1024;

function readUInt24LE(buffer: Buffer, offset: number): number {
  return (
    buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16)
  );
}

function inspectWebp(
  buffer: Buffer,
): Pick<MediaFileInspection, "format" | "width" | "height"> | undefined {
  if (
    buffer.length < 30 ||
    buffer.subarray(0, 4).toString("ascii") !== "RIFF" ||
    buffer.subarray(8, 12).toString("ascii") !== "WEBP"
  ) {
    return undefined;
  }

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const chunkType = buffer.subarray(offset, offset + 4).toString("ascii");
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const payloadOffset = offset + 8;

    if (payloadOffset + chunkSize > buffer.length) {
      break;
    }

    if (chunkType === "VP8X" && chunkSize >= 10) {
      return {
        format: "webp",
        width: readUInt24LE(buffer, payloadOffset + 4) + 1,
        height: readUInt24LE(buffer, payloadOffset + 7) + 1,
      };
    }

    if (chunkType === "VP8 " && chunkSize >= 10) {
      const frameOffset = payloadOffset + 3;
      if (
        buffer[frameOffset] === 0x9d &&
        buffer[frameOffset + 1] === 0x01 &&
        buffer[frameOffset + 2] === 0x2a
      ) {
        return {
          format: "webp",
          width: buffer.readUInt16LE(frameOffset + 3) & 0x3fff,
          height: buffer.readUInt16LE(frameOffset + 5) & 0x3fff,
        };
      }
    }

    if (
      chunkType === "VP8L" &&
      chunkSize >= 5 &&
      buffer[payloadOffset] === 0x2f
    ) {
      const bits = buffer.readUInt32LE(payloadOffset + 1);
      return {
        format: "webp",
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }

    offset = payloadOffset + chunkSize + (chunkSize % 2);
  }

  return { format: "webp" };
}

function inspectJpeg(
  buffer: Buffer,
): Pick<MediaFileInspection, "format" | "width" | "height"> | undefined {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return undefined;
  }

  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    offset += 2;

    if (marker === 0xd9 || marker === 0xda) {
      break;
    }

    if (offset + 2 > buffer.length) {
      break;
    }

    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > buffer.length) {
      break;
    }

    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      return {
        format: "jpeg",
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }

    offset += segmentLength;
  }

  return { format: "jpeg" };
}

function inspectPng(
  buffer: Buffer,
): Pick<MediaFileInspection, "format" | "width" | "height"> | undefined {
  if (
    buffer.length < 24 ||
    buffer[0] !== 0x89 ||
    buffer.subarray(1, 4).toString("ascii") !== "PNG" ||
    buffer[4] !== 0x0d ||
    buffer[5] !== 0x0a ||
    buffer[6] !== 0x1a ||
    buffer[7] !== 0x0a ||
    buffer.subarray(12, 16).toString("ascii") !== "IHDR"
  ) {
    return undefined;
  }

  return {
    format: "png",
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function inspectAvif(
  buffer: Buffer,
): Pick<MediaFileInspection, "format" | "width" | "height"> | undefined {
  if (
    buffer.length >= 12 &&
    buffer.subarray(4, 8).toString("ascii") === "ftyp" &&
    buffer.subarray(8, 12).toString("ascii") === "avif"
  ) {
    return { format: "avif" };
  }

  return undefined;
}

export function inspectMediaFile(filePath: string): MediaFileInspection {
  if (!fs.existsSync(filePath)) {
    return { exists: false, format: "unknown", fileSizeBytes: 0 };
  }

  const fileSizeBytes = fs.statSync(filePath).size;
  const buffer = fs.readFileSync(filePath);
  const inspection = inspectWebp(buffer) ??
    inspectJpeg(buffer) ??
    inspectPng(buffer) ??
    inspectAvif(buffer) ?? { format: "unknown" as const };

  return { exists: true, fileSizeBytes, ...inspection };
}

export function assertVerifiedWebp(
  filePath: string,
  expected: { targetAssetPath: string; width?: number; height?: number },
): MediaFileInspection {
  const inspection = inspectMediaFile(filePath);

  if (!inspection.exists) {
    throw new Error(
      `${expected.targetAssetPath}: converted output does not exist.`,
    );
  }

  if (inspection.format !== "webp") {
    throw new Error(
      `${expected.targetAssetPath}: converted output must be a real WebP file; detected ${inspection.format}.`,
    );
  }

  if (inspection.fileSizeBytes < minimumReasonableMediaFileSizeBytes) {
    throw new Error(
      `${expected.targetAssetPath}: converted output is suspiciously small (${inspection.fileSizeBytes} bytes).`,
    );
  }

  if (expected.width !== undefined && inspection.width !== expected.width) {
    throw new Error(
      `${expected.targetAssetPath}: converted width ${inspection.width ?? "unknown"} does not match requested width ${expected.width}.`,
    );
  }

  if (expected.height !== undefined && inspection.height !== expected.height) {
    throw new Error(
      `${expected.targetAssetPath}: converted height ${inspection.height ?? "unknown"} does not match requested height ${expected.height}.`,
    );
  }

  return inspection;
}
