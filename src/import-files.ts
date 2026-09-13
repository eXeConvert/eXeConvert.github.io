import { unzipSync } from 'fflate';

/** Reads a file a document refers to by a relative path, or null when it is not available. */
export type AssetResolver = (path: string) => Promise<Uint8Array | null>;

export type ZipContentKind = 'elpx' | 'elp' | 'latex' | 'html';

const IMAGE_MIME_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  avif: 'image/avif',
  ico: 'image/x-icon',
};

/** Extensions of the images a browser can show, the only ones an imported document may embed. */
export const IMAGE_EXTENSIONS = Object.keys(IMAGE_MIME_TYPES);

export function isZip(data: Uint8Array): boolean {
  return data.length > 4 && data[0] === 0x50 && data[1] === 0x4b && data[2] === 0x03 && data[3] === 0x04;
}

export function unzipDocumentEntries(data: Uint8Array): Record<string, Uint8Array> {
  return unzipSync(data, { filter: entry => !isIgnoredZipEntry(entry.name) });
}

/** Tells an eXeLearning project from a zipped LaTeX project or web page, all of which may arrive as a .zip. */
export function detectZipContentKind(data: Uint8Array): ZipContentKind | null {
  const names: string[] = [];
  try {
    // Only the names are needed: refusing every entry lists them without inflating any.
    unzipSync(data, {
      filter: file => {
        if (!file.name.endsWith('/') && !isIgnoredZipEntry(file.name)) {
          names.push(file.name);
        }
        return false;
      },
    });
  } catch {
    return null;
  }
  if (names.includes('content.xml')) return 'elpx';
  if (names.includes('contentv3.xml')) return 'elp';
  if (names.some(name => /\.tex$/i.test(name))) return 'latex';
  return names.some(name => /\.html?$/i.test(name)) ? 'html' : null;
}

/** The shallowest entry matching the pattern, preferring the given base names (index.html, main.tex). */
export function findMainEntry(names: string[], pattern: RegExp, preferred: RegExp): string | null {
  const candidates = names.filter(name => pattern.test(name));
  if (candidates.length === 0) {
    return null;
  }
  const depth = (name: string) => name.split('/').length;
  return candidates.sort((left, right) => {
    const byDepth = depth(left) - depth(right);
    if (byDepth !== 0) return byDepth;
    const leftPreferred = preferred.test(left) ? 0 : 1;
    const rightPreferred = preferred.test(right) ? 0 : 1;
    return leftPreferred - rightPreferred || left.localeCompare(right);
  })[0];
}

export function zipEntryResolver(entries: Record<string, Uint8Array>, mainPath: string): AssetResolver {
  return async path => entries[joinPath(dirnameOf(mainPath), path)] ?? null;
}

/** Reads an image through the resolver as a data: URL. Anything that is not an image is refused. */
export async function readImageDataUrl(path: string, resolveAsset: AssetResolver): Promise<string | null> {
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) {
    return null;
  }
  let cleanPath = path.split('#')[0].split('?')[0];
  try {
    cleanPath = decodeURIComponent(cleanPath);
  } catch {
    // Keep the path as written.
  }
  // Only images are read: a document must not be able to pull any other local
  // file into the project just by naming it as an image.
  const mime = IMAGE_MIME_TYPES[cleanPath.split('.').pop()?.toLowerCase() || ''];
  if (!mime) {
    return null;
  }
  const data = await resolveAsset(cleanPath);
  return data ? `data:${mime};base64,${toBase64(data)}` : null;
}

export function dirnameOf(path: string): string {
  return path.includes('/') ? path.slice(0, path.lastIndexOf('/') + 1) : '';
}

export function joinPath(base: string, relative: string): string {
  const parts: string[] = [];
  const combined = relative.startsWith('/') ? relative.slice(1) : `${base}${relative}`;
  for (const part of combined.replaceAll('\\', '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join('/');
}

function isIgnoredZipEntry(name: string): boolean {
  return name.startsWith('__MACOSX/') || /(^|\/)\.[^/]*$/.test(name);
}

function toBase64(data: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < data.length; index += 0x8000) {
    binary += String.fromCharCode(...data.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}
