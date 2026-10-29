import type { ImportedProject } from './docx-import.js';

// Importers embed every image as a data: URL. Left like that, each one sits in
// content.xml and again in the preview pages, a third bigger than the file, and
// at whatever size it came: a photo from Google Sites or a camera can weigh
// several megabytes. eXeLearning keeps images as files in content/resources and
// its content column is far narrower than 1920 px, even on high-density
// screens. The limit and the quality are those of the default preset of
// elpx-optimizer, the tool that lightens .elpx projects:
// https://github.com/ateeducacion/elpx-optimizer/blob/main/docs/profiles.md
const MAX_IMAGE_DIMENSION = 1920;
const LOSSY_QUALITY = 82;

const RESOURCES_DIR = 'content/resources';
const CONTEXT_PATH = '{{context_path}}';

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/bmp': 'bmp',
  'image/avif': 'avif',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
};

const DATA_IMAGE_SRC = /(\ssrc\s*=\s*)(["'])data:(image\/[\w.+-]+)[^,"']*;base64,([^"']*)\2/gi;

type RasterFormat = 'jpeg' | 'png' | 'webp';

interface RasterInfo {
  width: number;
  height: number;
  /** Animation, CMYK… : anything a decode and re-encode would spoil. */
  keepAsIs: boolean;
}

/**
 * Moves the images embedded as data: URLs into content/resources/<folder>/,
 * where eXeLearning keeps them, and points each <img> at its file with
 * {{context_path}}. Images larger than eXeLearning shows them are reduced.
 * Returns the files to add to the package.
 */
export async function moveImagesToResources(
  project: ImportedProject,
  folder: string,
): Promise<Record<string, Uint8Array>> {
  const files: Record<string, Uint8Array> = {};
  const pathsByPayload = new Map<string, string>();

  for (const page of project.pages) {
    for (const block of page.blocks) {
      const matches = Array.from(block.html.matchAll(DATA_IMAGE_SRC));
      if (matches.length === 0) {
        continue;
      }
      let html = '';
      let lastIndex = 0;
      for (const match of matches) {
        const [whole, before, quote, rawMime, rawPayload] = match;
        const mime = rawMime.toLowerCase();
        const extension = EXTENSIONS[mime];
        const payload = rawPayload.replace(/\s+/g, '');
        html += block.html.slice(lastIndex, match.index);
        lastIndex = (match.index ?? 0) + whole.length;

        let path = pathsByPayload.get(payload);
        if (!path && extension) {
          const data = fromBase64(payload);
          if (data) {
            // The same image twice is one file, as eXeLearning stores it.
            path = `${folder}/imagen-${pathsByPayload.size + 1}.${extension}`;
            files[`${RESOURCES_DIR}/${path}`] = await reduceImage(data, mime);
            pathsByPayload.set(payload, path);
          }
        }
        html += path ? `${before}${quote}${CONTEXT_PATH}/${path}${quote}` : whole;
      }
      block.html = html + block.html.slice(lastIndex);
    }
  }
  return files;
}

/** The {{context_path}} references of a block, rewritten for a page that sits `prefix` away from the package root. */
export function resolveContextPath(html: string, prefix: string): string {
  return html.split(`${CONTEXT_PATH}/`).join(`${prefix}${RESOURCES_DIR}/`);
}

async function reduceImage(data: Uint8Array, mime: string): Promise<Uint8Array> {
  const format: RasterFormat | null =
    mime === 'image/jpeg' || mime === 'image/jpg' ? 'jpeg' : mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : null;
  // GIF may be animated and SVG is not made of pixels; the rest are rare
  // enough on the web to be kept as they come.
  if (!format) {
    return data;
  }
  const info = readRasterInfo(data, format);
  if (!info || info.keepAsIs || Math.max(info.width, info.height) <= MAX_IMAGE_DIMENSION) {
    return data;
  }

  try {
    const image = await decodeImage(data, format);
    const scale = MAX_IMAGE_DIMENSION / Math.max(image.width, image.height);
    const resize = (await import('@jsquash/resize')).default;
    const resized = await resize(image, {
      width: Math.max(1, Math.round(image.width * scale)),
      height: Math.max(1, Math.round(image.height * scale)),
      method: 'lanczos3',
      fitMethod: 'stretch',
      premultiply: true,
      linearRGB: true,
    });
    const encoded = new Uint8Array(await encodeImage(resized, format));
    // The original is kept whenever the result is not lighter.
    return encoded.length > 0 && encoded.length < data.length ? encoded : data;
  } catch {
    return data;
  }
}

async function decodeImage(data: Uint8Array, format: RasterFormat): Promise<ImageData> {
  const buffer = data.slice().buffer;
  if (format === 'jpeg') {
    // The re-encoded file carries no EXIF, so the rotation goes into the pixels.
    return (await import('@jsquash/jpeg/decode.js')).default(buffer, { preserveOrientation: true });
  }
  if (format === 'png') {
    return (await import('@jsquash/png/decode.js')).default(buffer);
  }
  const image = await (await import('@jsquash/webp/decode.js')).default(buffer);
  if (!image) {
    throw new Error('WebP decoding failed.');
  }
  return image;
}

async function encodeImage(image: ImageData, format: RasterFormat): Promise<ArrayBuffer> {
  if (format === 'jpeg') {
    return (await import('@jsquash/jpeg/encode.js')).default(image, { quality: LOSSY_QUALITY, progressive: true, optimize_coding: true });
  }
  if (format === 'png') {
    // OxiPNG picks the lightest lossless form (grey, palette…) on its own.
    return (await import('@jsquash/oxipng/optimise.js')).default(image, { level: 2 });
  }
  return (await import('@jsquash/webp/encode.js')).default(image, { quality: LOSSY_QUALITY });
}

/** Size and red flags from the file header, so small images are never decoded. */
function readRasterInfo(data: Uint8Array, format: RasterFormat): RasterInfo | null {
  if (format === 'png') {
    if (data.length < 24 || data[0] !== 0x89 || ascii(data, 12, 4) !== 'IHDR') {
      return null;
    }
    // An animated PNG keeps its frames in chunks a decoder ignores.
    let animated = false;
    for (let offset = 8; offset + 8 <= data.length; ) {
      const length = readUint32(data, offset);
      const type = ascii(data, offset + 4, 4);
      if (type === 'acTL') animated = true;
      if (type === 'IDAT' || type === 'IEND') break;
      offset += 12 + length;
    }
    // 16-bit channels would be cut to 8.
    return { width: readUint32(data, 16), height: readUint32(data, 20), keepAsIs: animated || data[24] === 16 };
  }

  if (format === 'webp') {
    if (data.length < 30 || ascii(data, 0, 4) !== 'RIFF' || ascii(data, 8, 4) !== 'WEBP') {
      return null;
    }
    const chunk = ascii(data, 12, 4);
    if (chunk === 'VP8X') {
      const animated = (data[20] & 0x02) !== 0;
      const width = 1 + (data[24] | (data[25] << 8) | (data[26] << 16));
      const height = 1 + (data[27] | (data[28] << 8) | (data[29] << 16));
      return { width, height, keepAsIs: animated };
    }
    if (chunk === 'VP8L') {
      const bits = data[21] | (data[22] << 8) | (data[23] << 16) | (data[24] << 24);
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff), keepAsIs: false };
    }
    if (chunk === 'VP8 ') {
      return { width: (data[26] | (data[27] << 8)) & 0x3fff, height: (data[28] | (data[29] << 8)) & 0x3fff, keepAsIs: false };
    }
    return null;
  }

  if (data[0] !== 0xff || data[1] !== 0xd8) {
    return null;
  }
  for (let offset = 2; offset + 9 < data.length; ) {
    if (data[offset] !== 0xff) {
      return null;
    }
    const marker = data[offset + 1];
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01 || marker === 0xff) {
      offset += marker === 0xff ? 1 : 2;
      continue;
    }
    const length = (data[offset + 2] << 8) | data[offset + 3];
    // Start-of-frame markers, except DHT (C4), JPG (C8) and DAC (CC).
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const height = (data[offset + 5] << 8) | data[offset + 6];
      const width = (data[offset + 7] << 8) | data[offset + 8];
      // CMYK would come back with other colours.
      return { width, height, keepAsIs: data[offset + 9] === 4 };
    }
    offset += 2 + length;
  }
  return null;
}

function readUint32(data: Uint8Array, offset: number): number {
  return ((data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3]) >>> 0;
}

function ascii(data: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...data.subarray(offset, offset + length));
}

function fromBase64(value: string): Uint8Array | null {
  try {
    const binary = atob(value);
    const data = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      data[index] = binary.charCodeAt(index);
    }
    return data;
  } catch {
    return null;
  }
}
