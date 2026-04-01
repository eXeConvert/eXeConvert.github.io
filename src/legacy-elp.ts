import { unzipSync } from 'fflate';
import * as Y from 'yjs';
import type { DocxImportProgress, ImportToElpxResult } from './docx-import.js';

interface ExelearningImportResult {
  pages: number;
  blocks: number;
  components: number;
  assets: number;
  theme?: string | null;
}

interface ExelearningExportResult {
  success: boolean;
  filename?: string;
  data?: Uint8Array | Blob;
  error?: string;
}

interface ExelearningImporterCore {
  importFromBuffer(
    buffer: Uint8Array,
    options?: {
      clearExisting?: boolean;
      parentId?: string | null;
      onProgress?: (progress: { phase: string; percent: number; message: string }) => void;
    },
  ): Promise<ExelearningImportResult>;
}

interface ExelearningExporter {
  export(options?: { filename?: string }): Promise<ExelearningExportResult>;
}

interface StoredAsset {
  id: string;
  blob: Blob;
  mime: string;
  filename: string;
  originalPath: string;
  folderPath: string;
  hash: string;
  size: number;
  projectId: string;
}

interface WindowWithExelearning extends Window {
  Y?: typeof Y;
  eXeLearning?: { version?: string };
  process?: { env?: Record<string, string | undefined> };
  ElpxImporterCore?: new (ydoc: Y.Doc, assetHandler?: MemoryAssetHandler | null) => ExelearningImporterCore;
  createExporter?: (
    format: string,
    documentManager: MemoryDocumentManager,
    assetCache: null,
    resourceFetcher: BundleResourceFetcher,
    assetManager?: MemoryAssetStore | null,
  ) => ExelearningExporter;
}

const EXELEARNING_BASE_PATH = 'exelearning';
const APP_VERSION = 'v0.1.0';
const MIME_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  mkv: 'video/x-matroska',
  ogg: 'video/ogg',
  ogv: 'video/ogg',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
  aac: 'audio/aac',
  flac: 'audio/flac',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  zip: 'application/zip',
  rar: 'application/vnd.rar',
  '7z': 'application/x-7z-compressed',
  gltf: 'model/gltf+json',
  glb: 'model/gltf-binary',
  stl: 'model/stl',
  css: 'text/css',
  js: 'application/javascript',
  txt: 'text/plain',
  html: 'text/html',
  htm: 'text/html',
  json: 'application/json',
  csv: 'text/csv',
  rtf: 'application/rtf',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odp: 'application/vnd.oasis.opendocument.presentation',
  epub: 'application/epub+zip',
  mobi: 'application/x-mobipocket-ebook',
  woff: 'font/woff',
  woff2: 'font/woff2',
  eot: 'application/vnd.ms-fontobject',
  ttf: 'font/ttf',
  otf: 'font/otf',
  xml: 'application/xml',
};

const IDEVICE_TYPE_MAP: Record<string, string> = {
  text: 'text',
  freetext: 'text',
  textactivity: 'text',
  fileattach: 'download-source-file',
  fileattachactivity: 'download-source-file',
  downloadpackage: 'download-source-file',
  'download-package': 'download-source-file',
  downloadsourcefile: 'download-source-file',
  casestudy: 'casestudy',
  multichoice: 'quiz',
  truefalse: 'trueorfalse',
  gallery: 'image-gallery',
  imagegallery: 'image-gallery',
  imagemagnifier: 'magnifier',
  wikipedia: 'wikipedia',
  rss: 'rss',
  fill: 'fill',
  dropdown: 'dropdown',
  geogebra: 'geogebra-activity',
  interactivevideo: 'interactive-video',
  quiz: 'quick-questions',
  quizactivity: 'quick-questions',
  nota: 'udl-content',
};

let bundleLoadPromise: Promise<void> | null = null;
let previewObjectUrls: string[] = [];
const loadedScriptUrls = new Set<string>();

export async function convertElpToElpx(
  file: File,
  onProgress?: (progress: DocxImportProgress) => void,
): Promise<ImportToElpxResult> {
  await ensureExelearningBundles();

  onProgress?.({ phase: 'read', message: 'Leyendo el archivo .elp...', messageKey: 'progress.readElp' });
  const input = new Uint8Array(await file.arrayBuffer());

  onProgress?.({ phase: 'parse', message: 'Importando el .elp con el pipeline de eXeLearning...', messageKey: 'progress.parseLegacyElp' });
  const ydoc = new Y.Doc();
  const assets = new MemoryAssetStore();
  const assetHandler = new MemoryAssetHandler(assets);
  const importerCtor = windowProxy().ElpxImporterCore;
  if (!importerCtor) {
    throw new Error('No se ha podido inicializar el importador de eXeLearning.');
  }
  const importer = new importerCtor(ydoc, assetHandler);

  const importResult = await importer.importFromBuffer(input, {
    clearExisting: true,
    onProgress: (progress: { phase: string; percent: number; message: string }) => {
      if (progress.phase === 'decompress') {
        onProgress?.({ phase: 'parse', message: progress.message, messageKey: 'progress.parseLegacyElp' });
        return;
      }
      if (progress.phase === 'assets') {
        onProgress?.({ phase: 'template', message: progress.message, messageKey: 'progress.applyTemplate' });
        return;
      }
      onProgress?.({ phase: 'parse', message: progress.message, messageKey: 'progress.parseLegacyElp' });
    },
  });

  onProgress?.({ phase: 'template', message: 'Generando el archivo .elpx con el exportador de eXeLearning...', messageKey: 'progress.applyTemplate' });
  const documentManager = new MemoryDocumentManager(ydoc, assets.projectId);
  const resources = new BundleResourceFetcher();
  const createExporter = windowProxy().createExporter;
  if (!createExporter) {
    throw new Error('No se ha podido inicializar el exportador de eXeLearning.');
  }
  const exporter = createExporter('elpx', documentManager, null, resources, assets);
  const exportResult = await exporter.export({ filename: toElpxFilename(file.name) });

  if (!exportResult.success || !exportResult.data) {
    throw new Error(exportResult.error || 'No se ha podido generar el archivo .elpx.');
  }

  const blob = exportResult.data instanceof Blob ? exportResult.data : new Blob([toBlobPart(exportResult.data)], { type: 'application/zip' });
  const blobBytes = new Uint8Array(await blob.arrayBuffer());

  onProgress?.({ phase: 'pack', message: 'Generando el archivo .elpx...', messageKey: 'progress.packElpx' });
  const previewPages = buildPreviewPagesFromElpx(blobBytes);
  const previewHtml =
    previewPages['index.html'] ||
    '<!doctype html><html lang="es"><body><p>No se ha podido generar la previsualización.</p></body></html>';

  return {
    blob,
    filename: toElpxFilename(file.name),
    pageCount: importResult.pages,
    blockCount: importResult.blocks,
    previewHtml,
    previewPages,
  };
}

async function ensureExelearningBundles(): Promise<void> {
  if (bundleLoadPromise) {
    return bundleLoadPromise;
  }

  bundleLoadPromise = (async () => {
    const win = windowProxy();
    win.Y = Y;
    win.eXeLearning = { version: APP_VERSION };
    win.process = win.process || { env: {} };
    win.process.env = win.process.env || {};
    await loadScript(resolvePublicUrl(`${EXELEARNING_BASE_PATH}/importers.bundle.js`));
    await loadScript(resolvePublicUrl(`${EXELEARNING_BASE_PATH}/exporters.bundle.js`));

    if (!win.ElpxImporterCore || !win.createExporter) {
      throw new Error('No se han podido cargar los bundles de eXeLearning.');
    }
  })();

  return bundleLoadPromise;
}

function windowProxy(): WindowWithExelearning {
  return window as WindowWithExelearning;
}

function resolvePublicUrl(path: string): string {
  const normalizedPath = path.replace(/^\/+/, '');
  const baseUrl = import.meta.env?.BASE_URL ?? '/';
  return new URL(normalizedPath, new URL(baseUrl, 'http://localhost/')).pathname;
}

function loadScript(src: string): Promise<void> {
  if (isNodeLikeRuntime()) {
    if (loadedScriptUrls.has(src)) {
      return Promise.resolve();
    }

    return (async () => {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`No se ha podido cargar ${src}`);
      }
      const code = await response.text();
      globalThis.eval(`${code}\n//# sourceURL=${src}`);
      loadedScriptUrls.add(src);
    })();
  }

  const existing = document.querySelector<HTMLScriptElement>(`script[data-exe-src="${src}"]`);
  if (existing) {
    if (existing.dataset.loaded === 'true') {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`No se ha podido cargar ${src}`)), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.exeSrc = src;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    }, { once: true });
    script.addEventListener('error', () => reject(new Error(`No se ha podido cargar ${src}`)), { once: true });
    document.head.append(script);
  });
}

function isNodeLikeRuntime(): boolean {
  return typeof process !== 'undefined' && !!process.versions?.node;
}

class MemoryDocumentManager {
  readonly projectId: string;

  constructor(
    private readonly ydoc: Y.Doc,
    projectId?: string,
  ) {
    this.projectId = projectId || crypto.randomUUID();
  }

  getDoc(): Y.Doc {
    return this.ydoc;
  }

  getMetadata(): Y.Map<unknown> {
    return this.ydoc.getMap('metadata');
  }

  getNavigation(): Y.Array<unknown> {
    return this.ydoc.getArray('navigation');
  }
}

class MemoryAssetStore {
  readonly projectId = crypto.randomUUID();
  private readonly assets = new Map<string, StoredAsset>();

  upsert(asset: StoredAsset): void {
    this.assets.set(asset.id, asset);
  }

  async getProjectAssets(): Promise<StoredAsset[]> {
    return Array.from(this.assets.values());
  }

  async getAsset(assetId: string): Promise<StoredAsset | null> {
    return this.assets.get(assetId) || null;
  }

  async getAllAssetsRaw(): Promise<StoredAsset[]> {
    return Array.from(this.assets.values());
  }

  async resolveAssetURL(assetUrl: string): Promise<string | null> {
    const assetId = parseAssetId(assetUrl);
    if (!assetId) {
      return null;
    }
    const asset = this.assets.get(assetId);
    if (!asset) {
      return null;
    }
    return URL.createObjectURL(asset.blob);
  }
}

class MemoryAssetHandler {
  constructor(private readonly store: MemoryAssetStore) {}

  async storeAsset(
    id: string,
    data: Uint8Array,
    metadata: { filename: string; mimeType: string; folderPath?: string; originalPath?: string },
  ): Promise<string> {
    const blob = new Blob([toBlobPart(data)], { type: metadata.mimeType || getMimeType(metadata.filename) });
    const hash = await calculateHash(blob);
    this.store.upsert({
      id,
      blob,
      mime: metadata.mimeType || getMimeType(metadata.filename),
      filename: metadata.filename,
      originalPath: metadata.originalPath || metadata.filename,
      folderPath: metadata.folderPath || '',
      hash,
      size: data.length,
      projectId: this.store.projectId,
    });
    return id;
  }

  async extractAssetsFromZip(
    zip: Record<string, Uint8Array>,
    onAssetProgress?: (current: number, total: number, filename: string) => void,
  ): Promise<Map<string, string>> {
    const assetMap = new Map<string, string>();
    const assetFiles: Array<{ path: string; fileData: Uint8Array }> = [];
    const isLegacyFormat = Object.keys(zip).some(path => path === 'contentv3.xml' || path.endsWith('/contentv3.xml'));
    const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    const customIdPattern = /^(idevice|block|page)-[a-z0-9]+-[a-z0-9]+$/i;

    for (const [relativePath, fileData] of Object.entries(zip)) {
      if (relativePath.endsWith('/')) {
        continue;
      }
      if (relativePath.startsWith('__MACOSX')) {
        continue;
      }
      if (relativePath.endsWith('.xml') || relativePath.endsWith('.xsd') || relativePath.endsWith('.data')) {
        continue;
      }

      const isSystemFile =
        relativePath.startsWith('idevices/') ||
        relativePath.startsWith('libs/') ||
        relativePath.startsWith('theme/') ||
        relativePath.startsWith('content/css/') ||
        relativePath.startsWith('content/img/') ||
        relativePath.startsWith('html/') ||
        relativePath === 'index.html' ||
        relativePath === 'base.css' ||
        relativePath === 'common_i18n.js' ||
        relativePath === 'common.js';

      if (isSystemFile) {
        continue;
      }

      let shouldInclude = false;
      if (isLegacyFormat) {
        shouldInclude = !relativePath.includes('/');
      } else {
        const isResourceFile =
          relativePath.startsWith('resources/') ||
          relativePath.startsWith('content/resources/') ||
          relativePath.includes('/resources/');

        if (isResourceFile) {
          shouldInclude = true;
        }

        if (!shouldInclude) {
          const pathParts = relativePath.split('/');
          if (pathParts.length >= 2) {
            const firstFolder = pathParts[0];
            if (uuidPattern.test(firstFolder) || customIdPattern.test(firstFolder)) {
              shouldInclude = true;
            }
          }
        }

        if (!shouldInclude) {
          const isCustomFolderFile = relativePath.startsWith('custom/') && !relativePath.endsWith('/');
          const customFilename = isCustomFolderFile ? relativePath.split('/').pop() : '';
          const isCustomPlaceholder = Boolean(customFilename) && customFilename!.startsWith('.');
          if (isCustomFolderFile && !isCustomPlaceholder) {
            shouldInclude = true;
          }
        }
      }

      if (shouldInclude) {
        assetFiles.push({ path: relativePath, fileData });
      }
    }

    for (let index = 0; index < assetFiles.length; index += 1) {
      const { path, fileData } = assetFiles[index];
      onAssetProgress?.(index + 1, assetFiles.length, path.split('/').pop() || path);

      const mime = getMimeType(path);
      const blob = new Blob([toBlobPart(fileData)], { type: mime });
      const hash = await calculateHash(blob);
      const assetId = hashToUUID(hash);
      const filename = path.split('/').pop() || assetId;
      const folderPath = extractFolderPathFromImport(path, assetId);

      this.store.upsert({
        id: assetId,
        blob,
        mime,
        filename,
        originalPath: path,
        folderPath,
        hash,
        size: blob.size,
        projectId: this.store.projectId,
      });
      assetMap.set(path, assetId);

      if (path.startsWith('custom/') && path.includes(' ')) {
        assetMap.set(path.replace(/ /g, '_'), assetId);
      }
    }

    return assetMap;
  }

  convertContextPathToAssetRefs(html: string, assetMap: Map<string, string>): string {
    if (!html) {
      return html;
    }

    let convertedHtml = html;

    const findAssetUrl = (assetPath: string): string | null => {
      const cleanPath = assetPath.replace(/[\\\s]+$/, '').trim();
      if (assetMap.has(cleanPath)) {
        return buildAssetUrl(assetMap.get(cleanPath)!, cleanPath.split('/').pop() || cleanPath);
      }

      for (const prefix of ['', 'content/', 'content/resources/', 'resources/']) {
        const fullPath = `${prefix}${cleanPath}`;
        if (assetMap.has(fullPath)) {
          return buildAssetUrl(assetMap.get(fullPath)!, cleanPath.split('/').pop() || cleanPath);
        }
      }

      const filename = cleanPath.split('/').pop() || cleanPath;
      for (const [path, assetId] of assetMap.entries()) {
        if (path.endsWith(`/${filename}`) || path === filename) {
          return buildAssetUrl(assetId, filename);
        }
      }

      const pathParts = cleanPath.split('/');
      if (pathParts.length >= 2) {
        const shortPath = pathParts.slice(-2).join('/');
        for (const [path, assetId] of assetMap.entries()) {
          if (path.endsWith(shortPath)) {
            return buildAssetUrl(assetId, pathParts[pathParts.length - 1]);
          }
        }
      }

      const customPath = `custom/${filename}`;
      if (assetMap.has(customPath)) {
        return buildAssetUrl(assetMap.get(customPath)!, filename);
      }

      const denormalizedFilename = filename.replace(/_/g, ' ');
      if (denormalizedFilename !== filename) {
        const customDenormalized = `custom/${denormalizedFilename}`;
        if (assetMap.has(customDenormalized)) {
          return buildAssetUrl(assetMap.get(customDenormalized)!, denormalizedFilename);
        }
      }

      for (const [mapPath, assetId] of assetMap.entries()) {
        if (!mapPath.startsWith('custom/')) {
          continue;
        }
        const mapFilename = mapPath.split('/').pop() || mapPath;
        if (mapFilename === denormalizedFilename || mapFilename === filename) {
          return buildAssetUrl(assetId, mapFilename);
        }
      }

      return null;
    };

    convertedHtml = convertedHtml.replace(/\{\{context_path\}\}\/([^"'<>]+)/g, (fullMatch, assetPath) => {
      const url = findAssetUrl(assetPath);
      return url || fullMatch;
    });

    convertedHtml = convertedHtml.replace(
      /(src|href)=(["'])resources\/([^"']+)\2/gi,
      (fullMatch, attr, quote, assetPath) => {
        const url = findAssetUrl(`resources/${assetPath}`) || findAssetUrl(assetPath);
        return url ? `${attr}=${quote}${url}${quote}` : fullMatch;
      },
    );

    return convertedHtml;
  }

  async preloadAllAssets(): Promise<void> {}
}

class BundleResourceFetcher {
  private readonly bundleCache = new Map<string, Promise<Map<string, Blob>>>();
  private readonly ideviceCache = new Map<string, Map<string, Blob>>();
  private libsBundlePromise: Promise<Map<string, Blob>> | null = null;
  private commonBundlePromise: Promise<Map<string, Blob>> | null = null;

  async fetchTheme(themeName: string): Promise<Map<string, Blob>> {
    return this.loadZipBundle(`${EXELEARNING_BASE_PATH}/bundles/themes/${themeName}.zip`);
  }

  async fetchIdevice(ideviceType: string): Promise<Map<string, Blob>> {
    const normalized = normalizeIdeviceType(ideviceType);
    if (!this.ideviceCache.has(normalized)) {
      const allFiles = await this.loadZipBundle(`${EXELEARNING_BASE_PATH}/bundles/idevices.zip`);
      const grouped = new Map<string, Map<string, Blob>>();
      for (const [path, blob] of allFiles.entries()) {
        const parts = path.split('/');
        if (parts.length < 2) {
          continue;
        }
        const bucket = grouped.get(parts[0]) || new Map<string, Blob>();
        bucket.set(parts.slice(1).join('/'), blob);
        grouped.set(parts[0], bucket);
      }
      for (const [key, files] of grouped.entries()) {
        this.ideviceCache.set(key, files);
      }
    }
    return this.ideviceCache.get(normalized) || new Map();
  }

  async fetchBaseLibraries(): Promise<Map<string, Blob>> {
    if (!this.libsBundlePromise) {
      this.libsBundlePromise = this.loadZipBundle(`${EXELEARNING_BASE_PATH}/bundles/libs.zip`);
    }
    return new Map(await this.libsBundlePromise);
  }

  async fetchScormFiles(): Promise<Map<string, Blob>> {
    return new Map();
  }

  async fetchLibraryFiles(paths: string[]): Promise<Map<string, Blob>> {
    const result = new Map<string, Blob>();
    const [libs, common] = await Promise.all([this.fetchBaseLibraries(), this.fetchCommonBundle()]);
    for (const path of paths) {
      const file = libs.get(path) || common.get(path);
      if (file) {
        result.set(path, file);
      }
    }
    return result;
  }

  async fetchLibraryDirectory(libraryName: string): Promise<Map<string, Blob>> {
    const result = new Map<string, Blob>();
    const [libs, common] = await Promise.all([this.fetchBaseLibraries(), this.fetchCommonBundle()]);
    const prefix = `${libraryName}/`;

    for (const [path, blob] of libs.entries()) {
      if (path.startsWith(prefix)) {
        result.set(path, blob);
      }
    }
    for (const [path, blob] of common.entries()) {
      if (path.startsWith(prefix)) {
        result.set(path, blob);
      }
    }

    return result;
  }

  async fetchExeLogo(): Promise<Blob | null> {
    const response = await fetch(resolvePublicUrl(`${EXELEARNING_BASE_PATH}/app/common/exe_powered_logo/exe_powered_logo.png`));
    if (!response.ok) {
      return null;
    }
    return response.blob();
  }

  async fetchContentCss(): Promise<Map<string, Blob>> {
    return this.loadZipBundle(`${EXELEARNING_BASE_PATH}/bundles/content-css.zip`);
  }

  async fetchGlobalFontFiles(): Promise<Map<string, Blob>> {
    return new Map();
  }

  private async fetchCommonBundle(): Promise<Map<string, Blob>> {
    if (!this.commonBundlePromise) {
      this.commonBundlePromise = this.loadZipBundle(`${EXELEARNING_BASE_PATH}/bundles/common.zip`);
    }
    return new Map(await this.commonBundlePromise);
  }

  private loadZipBundle(relativePath: string): Promise<Map<string, Blob>> {
    const url = resolvePublicUrl(relativePath);
    const cached = this.bundleCache.get(url);
    if (cached) {
      return cached;
    }

    const promise = (async () => {
      const response = await fetch(url);
      if (!response.ok) {
        return new Map<string, Blob>();
      }
      const bytes = new Uint8Array(await response.arrayBuffer());
      const entries = unzipSync(bytes);
      const files = new Map<string, Blob>();
      for (const [path, data] of Object.entries(entries)) {
        files.set(path, new Blob([toBlobPart(data)], { type: getMimeType(path) }));
      }
      return files;
    })();

    this.bundleCache.set(url, promise);
    return promise;
  }
}

function toElpxFilename(filename: string): string {
  return filename.replace(/\.[^.]+$/u, '') + '.elpx';
}

function getMimeType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return MIME_TYPES[extension] || 'application/octet-stream';
}

async function calculateHash(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();

  if (crypto.subtle?.digest) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(value => value.toString(16).padStart(2, '0'))
      .join('');
  }

  const data = new Uint8Array(arrayBuffer);
  let hash = 2166136261;
  for (let index = 0; index < data.length; index += 1) {
    hash ^= data[index];
    hash = (hash * 16777619) >>> 0;
  }

  const sizeHash = (data.length * 2654435761) >>> 0;
  const sample1 = data.length > 0 ? data[0] : 0;
  const sample2 = data.length > 100 ? data[100] : 0;
  const sample3 = data.length > 1000 ? data[1000] : 0;
  return [
    hash.toString(16).padStart(8, '0'),
    sizeHash.toString(16).padStart(8, '0'),
    (hash ^ sizeHash).toString(16).padStart(8, '0'),
    ((hash + sample1 + sample2 + sample3) >>> 0).toString(16).padStart(8, '0'),
    data.length.toString(16).padStart(8, '0'),
    ((hash * 31 + sizeHash) >>> 0).toString(16).padStart(8, '0'),
    ((sizeHash ^ sample1 ^ sample2 ^ sample3) >>> 0).toString(16).padStart(8, '0'),
    ((hash ^ data.length) >>> 0).toString(16).padStart(8, '0'),
  ].join('');
}

function hashToUUID(hash: string): string {
  const value = hash.substring(0, 32);
  return `${value.substring(0, 8)}-${value.substring(8, 12)}-${value.substring(12, 16)}-${value.substring(16, 20)}-${value.substring(20, 32)}`;
}

function buildAssetUrl(assetId: string, filename: string): string {
  const extension = filename.includes('.') ? filename.split('.').pop()?.toLowerCase() : '';
  return extension ? `asset://${assetId}.${extension}` : `asset://${assetId}`;
}

function toBlobPart(data: Uint8Array): ArrayBuffer {
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

function parseAssetId(assetUrl: string): string | null {
  if (!assetUrl.startsWith('asset://')) {
    return null;
  }
  const value = assetUrl.slice('asset://'.length);
  return value.split('.')[0] || null;
}

function extractFolderPathFromImport(path: string, assetId: string): string {
  let cleanPath = path;
  if (cleanPath.startsWith('content/resources/')) {
    cleanPath = cleanPath.slice('content/resources/'.length);
  } else if (cleanPath.startsWith('resources/')) {
    cleanPath = cleanPath.slice('resources/'.length);
  }

  const parts = cleanPath.split('/');
  parts.pop();

  if (parts.length === 0) {
    return '';
  }

  const firstPart = parts[0];
  const isUuidLike = /^[a-f0-9-]{8,}$/i.test(firstPart);

  if (isUuidLike && parts.length === 1) {
    if (firstPart === assetId || firstPart.startsWith(assetId.split('-')[0])) {
      return '';
    }
  }

  if (isUuidLike && parts.length > 1) {
    return parts.slice(1).join('/');
  }

  return parts.join('/');
}

function normalizeIdeviceType(typeName: string): string {
  if (!typeName) {
    return 'text';
  }
  const normalized = typeName.toLowerCase().replace(/-?idevice$/i, '');
  return IDEVICE_TYPE_MAP[normalized] || normalized || 'text';
}

function buildPreviewPagesFromElpx(elpxData: Uint8Array): Record<string, string> {
  revokePreviewObjectUrls();
  const entries = unzipSync(elpxData);
  const htmlEntries = new Set(Object.keys(entries).filter(path => path === 'index.html' || path.startsWith('html/')));
  const blobUrls = new Map<string, string>();

  for (const [path, data] of Object.entries(entries)) {
    if (htmlEntries.has(path) || path.endsWith('/') || path === 'content.xml' || path === 'content.dtd') {
      continue;
    }
    const url = URL.createObjectURL(new Blob([toBlobPart(data)], { type: getMimeType(path) }));
    blobUrls.set(path, url);
    previewObjectUrls.push(url);
  }

  for (const [path, data] of Object.entries(entries)) {
    if (htmlEntries.has(path) || !path.toLowerCase().endsWith('.css')) {
      continue;
    }
    const rewrittenCss = rewriteCssUrls(new TextDecoder().decode(data), path, blobUrls);
    const oldUrl = blobUrls.get(path);
    if (oldUrl) {
      URL.revokeObjectURL(oldUrl);
      previewObjectUrls = previewObjectUrls.filter(url => url !== oldUrl);
    }
    const cssUrl = URL.createObjectURL(new Blob([rewrittenCss], { type: 'text/css' }));
    blobUrls.set(path, cssUrl);
    previewObjectUrls.push(cssUrl);
  }

  const pages: Record<string, string> = {};
  for (const htmlPath of htmlEntries) {
    const source = new TextDecoder().decode(entries[htmlPath]);
    pages[htmlPath] = rewritePreviewHtml(source, htmlPath, entries, htmlEntries, blobUrls);
  }

  return pages;
}

function revokePreviewObjectUrls(): void {
  for (const url of previewObjectUrls) {
    URL.revokeObjectURL(url);
  }
  previewObjectUrls = [];
}

function rewritePreviewHtml(
  html: string,
  currentPath: string,
  entries: Record<string, Uint8Array>,
  htmlEntries: Set<string>,
  blobUrls: Map<string, string>,
): string {
  const document = new DOMParser().parseFromString(html, 'text/html');

  for (const link of Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]'))) {
    const href = link.getAttribute('href');
    if (!href) {
      continue;
    }
    const resolved = resolveZipPath(currentPath, href);
    if (!resolved) {
      continue;
    }
    const blobUrl = blobUrls.get(resolved);
    if (blobUrl) {
      link.setAttribute('href', blobUrl);
    }
  }

  for (const script of Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]'))) {
    const src = script.getAttribute('src');
    if (!src) {
      continue;
    }
    const resolved = resolveZipPath(currentPath, src);
    if (!resolved) {
      continue;
    }
    const blobUrl = blobUrls.get(resolved);
    if (blobUrl) {
      script.setAttribute('src', blobUrl);
    }
  }

  const attributes: Array<'src' | 'href' | 'poster' | 'data'> = ['src', 'href', 'poster', 'data'];
  for (const attribute of attributes) {
    for (const element of Array.from(document.querySelectorAll<HTMLElement>(`[${attribute}]`))) {
      const value = element.getAttribute(attribute);
      if (!value || isExternalUrl(value) || value.startsWith('#')) {
        continue;
      }

      const resolved = resolveZipPath(currentPath, value);
      if (!resolved) {
        continue;
      }

      if (attribute === 'href' && htmlEntries.has(resolved)) {
        continue;
      }

      const blobUrl = blobUrls.get(resolved);
      if (blobUrl) {
        element.setAttribute(attribute, blobUrl);
      }
    }
  }

  return '<!doctype html>\n' + document.documentElement.outerHTML;
}

function rewriteCssUrls(css: string, cssPath: string, blobUrls: Map<string, string>): string {
  return css.replace(/url\(([^)]+)\)/g, (fullMatch, rawValue) => {
    const unquoted = rawValue.trim().replace(/^['"]|['"]$/g, '');
    if (!unquoted || isExternalUrl(unquoted) || unquoted.startsWith('data:')) {
      return fullMatch;
    }

    const resolved = resolveZipPath(cssPath, unquoted);
    if (!resolved) {
      return fullMatch;
    }

    const blobUrl = blobUrls.get(resolved);
    if (!blobUrl) {
      return fullMatch;
    }

    return `url("${blobUrl}")`;
  });
}

function resolveZipPath(fromPath: string, targetPath: string): string | null {
  if (!targetPath || isExternalUrl(targetPath)) {
    return null;
  }

  const cleanTarget = targetPath.split('#')[0].split('?')[0];
  if (!cleanTarget) {
    return null;
  }

  const segments = fromPath.split('/');
  segments.pop();

  const parts = cleanTarget.split('/');
  const output = cleanTarget.startsWith('/') ? [] : segments;
  for (const part of parts) {
    if (!part || part === '.') {
      continue;
    }
    if (part === '..') {
      output.pop();
      continue;
    }
    output.push(part);
  }
  return output.join('/');
}

function isExternalUrl(value: string): boolean {
  return /^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith('blob:') || value.startsWith('data:') || value.startsWith('mailto:');
}
