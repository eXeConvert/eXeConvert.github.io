import './style.css';
import {
  buildPrintableHtmlDocument,
  convertElpxToDocx,
  convertElpxToHtml,
  inspectElpxPages,
  type ConvertProgress,
  type ElpxPageInfo,
} from './converter';
import { convertDocxToElpx, type DocxImportProgress, type Heading1Mode, type HeadingMode } from './docx-import';
import { convertElpxToMarkdown } from './elpx-markdown';
import { convertElpToElpx } from './legacy-elp';
import { convertMarkdownToElpx } from './markdown-import';
import { createI18n, persistLocale, resolveInitialLocale, type Locale } from './i18n';
import MarkdownIt from 'markdown-it';
// @ts-expect-error markdown-it-texmath does not ship TypeScript declarations.
import texmath from 'markdown-it-texmath';
import temml from 'temml';

interface FilePickerWindow extends Window {
  showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: Array<{
    description?: string;
    accept: Record<string, string[]>;
  }>;
}

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}

interface PendingSaveTarget {
  handle: FileSystemFileHandle;
  filename: string;
}

type InputKind = 'docx' | 'markdown' | 'elpx' | 'elp';
type ConversionKind = 'docx' | 'markdown' | 'elpx' | 'pdf';
type OutputKind = ConversionKind;
type MarkdownPreviewMode = 'formatted' | 'source';

interface IntermediateElpxSave {
  blob: Blob;
  filename: string;
  pageCount: number;
  blockCount?: number;
  previewHtml?: string;
  previewPages?: Record<string, string>;
  previewStartPath?: string;
}

interface PreparedConversion {
  signature: string;
  kind: ConversionKind;
  blob: Blob | null;
  filename: string;
  pageCount: number;
  blockCount?: number;
  previewType: 'html' | 'markdown';
  previewContent: string;
  previewPages?: Record<string, string>;
  previewStartPath?: string;
  intermediateElpx?: IntermediateElpxSave;
}

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('No se ha encontrado el contenedor principal.');
}

const APP_VERSION = 'v0.1.0-beta.6';
const ANALYTICS_FALLBACK_ENDPOINT = 'https://bilateria.org/app/estadistica/execonvert/track.php';
const ANALYTICS_FALLBACK_STATS_URL = 'https://bilateria.org/app/estadistica/execonvert/admin-stats.php';
const locale = resolveInitialLocale();
const { t } = createI18n(locale);

const materialSymbolsHref =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,500,0,0';
if (!document.querySelector(`link[href="${materialSymbolsHref}"]`)) {
  const materialSymbolsLink = document.createElement('link');
  materialSymbolsLink.rel = 'stylesheet';
  materialSymbolsLink.href = materialSymbolsHref;
  document.head.append(materialSymbolsLink);
}

app.innerHTML = `
  <main class="shell">
    <section class="hero" aria-label="${escapeAttribute(t('app.heroAria'))}">
      <div class="hero-top">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true">
            <img src="./favicon.svg" alt="" />
          </span>
          <div class="brand-copy">
            <h1>eXeConvert</h1>
            <p class="subtitle">${t('app.subtitle')}</p>
          </div>
        </div>
        <div class="locale-picker">
          <select id="language-select" aria-label="${escapeAttribute(t('lang.label'))}">
            <option value="es" ${locale === 'es' ? 'selected' : ''}>${t('lang.es')}</option>
            <option value="ca" ${locale === 'ca' ? 'selected' : ''}>${t('lang.ca')}</option>
            <option value="en" ${locale === 'en' ? 'selected' : ''}>${t('lang.en')}</option>
          </select>
        </div>
      </div>
      <p class="lede">
        ${t('app.lede')}
      </p>
      <p class="hero-links">
        <a href="./info/index.html?lang=${locale}" target="_blank" rel="noopener">${t('app.infographicLink')}</a>
      </p>
    </section>

    <section class="panel">
      <h2>${t('panel.conversion')}</h2>
      <form id="conversion-form" class="form">
        <div id="drop-field" class="dropzone" tabindex="0" role="button" aria-describedby="drop-help">
          <input id="file-input" type="file" accept=".elp,.elpx,.zip,.docx,.md,.markdown,.mdown,.txt" hidden />
          <p class="dropzone-title">${t('drop.title')}</p>
          <p id="drop-help" class="drop-help">
            ${t('drop.help')}
          </p>
          <div class="dropzone-actions">
            <button id="pick-button" type="button">
              <span class="material-symbols-rounded" aria-hidden="true">upload_file</span>
              <span class="btn-label">${t('button.openFile')}</span>
            </button>
            <span id="file-name" class="picked-file">${t('file.none')}</span>
          </div>
        </div>

        <div id="detected-field" class="field" hidden>
          <span>${t('detected.title')}</span>
          <p id="detected-help" class="field-help"></p>
        </div>

        <div id="output-field" class="field" hidden>
          <span>${t('output.title')}</span>
          <div class="radio-group" role="radiogroup" aria-label="${escapeAttribute(t('output.aria'))}">
            <label id="output-option-elpx" class="radio-row" hidden>
              <input type="radio" name="output-kind" value="elpx" />
              <span>${t('output.elpx')}</span>
            </label>
            <label id="output-option-docx" class="radio-row">
              <input type="radio" name="output-kind" value="docx" checked />
              <span>${t('output.docx')}</span>
            </label>
            <label id="output-option-markdown" class="radio-row">
              <input type="radio" name="output-kind" value="markdown" />
              <span>${t('output.md')}</span>
            </label>
            <label id="output-option-pdf" class="radio-row">
              <input type="radio" name="output-kind" value="pdf" />
              <span>${t('output.pdf')}</span>
            </label>
          </div>
        </div>

        <div id="legacy-save-field" class="field" hidden>
          <span>${t('legacySave.title')}</span>
          <label class="checkbox-row">
            <input id="legacy-save-elpx" type="checkbox" />
            <span>${t('legacySave.include')}</span>
          </label>
          <p class="field-help">${t('legacySave.help')}</p>
        </div>

        <div id="page-selection-field" class="field" hidden>
          <span>${t('pages.title')}</span>
          <div class="page-selection-actions">
            <button id="pages-all" type="button" class="ghost-button">
              <span class="material-symbols-rounded" aria-hidden="true">done_all</span>
              <span class="btn-label">${t('pages.all')}</span>
            </button>
            <button id="pages-none" type="button" class="ghost-button">
              <span class="material-symbols-rounded" aria-hidden="true">remove_done</span>
              <span class="btn-label">${t('pages.none')}</span>
            </button>
          </div>
          <div id="page-selection-list" class="page-selection-list"></div>
          <p id="page-selection-help" class="field-help">
            ${t('pages.help')}
          </p>
        </div>

        <div id="structure-field" class="field" hidden>
          <span>${t('structure.title')}</span>
          <table class="mapping-table">
            <thead>
              <tr>
                <th>${t('structure.level')}</th>
                <th>${t('structure.target')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row"><code>${t('structure.heading1')}</code></th>
                <td>
                  <select id="heading1-mode">
                    <option value="page" selected>${t('structure.h1.page')}</option>
                    <option value="resource">${t('structure.h1.resource')}</option>
                  </select>
                </td>
              </tr>
              <tr>
                <th scope="row"><code>${t('structure.heading2')}</code></th>
                <td>
                  <select id="heading2-mode">
                    <option value="block" selected>${t('structure.block')}</option>
                    <option value="page">${t('structure.subpage')}</option>
                  </select>
                </td>
              </tr>
              <tr>
                <th scope="row"><code>${t('structure.heading3')}</code></th>
                <td>
                  <select id="heading3-mode">
                    <option value="block" selected>${t('structure.block')}</option>
                    <option value="page">${t('structure.subpage')}</option>
                  </select>
                </td>
              </tr>
              <tr>
                <th scope="row"><code>${t('structure.heading4')}</code></th>
                <td>
                  <select id="heading4-mode">
                    <option value="block" selected>${t('structure.block')}</option>
                    <option value="page">${t('structure.subpage')}</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="field-help">
            ${t('structure.help.chain')}
          </p>
          <p class="field-help">
            ${t('structure.help.shift')}
          </p>
        </div>

        <div id="markdown-images-field" class="field" hidden>
          <span>${t('mdImages.title')}</span>
          <label class="checkbox-row">
            <input id="markdown-images" type="checkbox" />
            <span>${t('mdImages.include')}</span>
          </label>
          <p class="field-help">${t('mdImages.help')}</p>
        </div>

        <div class="actions">
          <button id="preview-button" type="button" disabled hidden>
            <span class="material-symbols-rounded" aria-hidden="true">preview</span>
            <span class="btn-label">${t('button.preview')}</span>
          </button>
          <button id="save-intermediate-button" type="button" hidden>
            <span class="material-symbols-rounded" aria-hidden="true">save</span>
            <span class="btn-label">${t('button.saveElpx')}</span>
          </button>
          <button id="submit-button" type="submit" disabled hidden>
            <span class="material-symbols-rounded" aria-hidden="true">save</span>
            <span class="btn-label">${t('button.save')}</span>
          </button>
        </div>
        <p id="actions-help" class="actions-help" hidden></p>
      </form>

      <div id="progress-shell" class="progress-shell" hidden aria-hidden="true">
        <div class="progress-track">
          <div id="progress-bar" class="progress-bar"></div>
        </div>
      </div>
      <div class="status-shell">
        <span id="status-spinner" class="status-spinner" hidden aria-hidden="true"></span>
        <p id="status" class="status" aria-live="polite">
          ${t('status.idle')}
        </p>
      </div>

      <div id="preview-field" class="field preview-field" hidden>
        <div class="preview-heading">
          <span>${t('preview.title')}</span>
          <button id="preview-popout-button" type="button" class="ghost-button" hidden>
            <span class="material-symbols-rounded" aria-hidden="true">open_in_new</span>
            <span class="btn-label">${t('preview.openWindow')}</span>
          </button>
        </div>
        <p class="field-help">${t('preview.help')}</p>
        <div id="preview-markdown-mode-field" class="preview-mode" hidden>
          <span class="preview-mode-label">${t('preview.markdownMode')}</span>
          <div class="preview-mode-actions" role="group" aria-label="${escapeAttribute(t('preview.markdownMode'))}">
            <button id="preview-markdown-formatted" type="button" class="ghost-button preview-mode-button">
              ${t('preview.markdownFormatted')}
            </button>
            <button id="preview-markdown-source" type="button" class="ghost-button preview-mode-button">
              ${t('preview.markdownSource')}
            </button>
          </div>
        </div>
        <iframe id="preview-frame" class="preview-frame" title="${escapeAttribute(t('preview.iframeTitle'))}"></iframe>
        <pre id="preview-markdown" class="preview-markdown" hidden></pre>
      </div>
    </section>

    <footer class="app-footer">
      <p class="app-footer-meta">
        ${t('footer.version', { version: APP_VERSION })}
        <a href="https://bilateria.org" target="_blank" rel="noopener noreferrer">Juan José de Haro</a>
        ·
        <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer">${t('footer.license')}</a>
        ·
        <a href="https://github.com/eXeConvert/eXeConvert.github.io" target="_blank" rel="noopener noreferrer">${t('footer.repo')}</a>
        ·
        <a href="https://github.com/eXeConvert/eXeConvert.github.io/issues" target="_blank" rel="noopener noreferrer">${t('footer.issues')}</a>
      </p>
      <p class="app-footer-stats" id="analytics-summary" hidden>
        ${t('footer.analytics.visits')} <strong id="analytics-total">-</strong>
        ·
        ${t('footer.analytics.today')} <strong id="analytics-today">-</strong>
        ·
        <a id="analytics-link" href="https://bilateria.org/app/estadistica/execonvert/admin-stats.php" target="_blank" rel="noopener noreferrer">${t('footer.analytics.details')}</a>
      </p>
      <p class="app-footer-note">
        ${t('footer.note.independent')}
      </p>
      <p class="app-footer-note">
        ${t('footer.note.thirdParty')}
        <a href="./THIRD_PARTY_NOTICES.md" target="_blank" rel="noopener noreferrer">THIRD_PARTY_NOTICES</a>.
      </p>
    </footer>
  </main>
`;

const form = document.querySelector<HTMLFormElement>('#conversion-form')!;
const dropField = document.querySelector<HTMLDivElement>('#drop-field')!;
const pickButton = document.querySelector<HTMLButtonElement>('#pick-button')!;
const languageSelect = document.querySelector<HTMLSelectElement>('#language-select')!;
const fileInput = document.querySelector<HTMLInputElement>('#file-input')!;
const fileNameElement = document.querySelector<HTMLSpanElement>('#file-name')!;
const detectedField = document.querySelector<HTMLDivElement>('#detected-field')!;
const detectedHelp = document.querySelector<HTMLParagraphElement>('#detected-help')!;
const outputField = document.querySelector<HTMLDivElement>('#output-field')!;
const outputOptionElpx = document.querySelector<HTMLLabelElement>('#output-option-elpx')!;
const pageSelectionField = document.querySelector<HTMLDivElement>('#page-selection-field')!;
const pageSelectionList = document.querySelector<HTMLDivElement>('#page-selection-list')!;
const pageSelectionHelp = document.querySelector<HTMLParagraphElement>('#page-selection-help')!;
const pagesAllButton = document.querySelector<HTMLButtonElement>('#pages-all')!;
const pagesNoneButton = document.querySelector<HTMLButtonElement>('#pages-none')!;
const outputRadioElements = document.querySelectorAll<HTMLInputElement>('input[name="output-kind"]');
const structureField = document.querySelector<HTMLDivElement>('#structure-field')!;
const markdownImagesField = document.querySelector<HTMLDivElement>('#markdown-images-field')!;
const markdownImages = document.querySelector<HTMLInputElement>('#markdown-images')!;
const legacySaveField = document.querySelector<HTMLDivElement>('#legacy-save-field')!;
const previewField = document.querySelector<HTMLDivElement>('#preview-field')!;
const previewMarkdownModeField = document.querySelector<HTMLDivElement>('#preview-markdown-mode-field')!;
const previewMarkdownFormattedButton = document.querySelector<HTMLButtonElement>('#preview-markdown-formatted')!;
const previewMarkdownSourceButton = document.querySelector<HTMLButtonElement>('#preview-markdown-source')!;
const previewPopoutButton = document.querySelector<HTMLButtonElement>('#preview-popout-button')!;
const previewFrame = document.querySelector<HTMLIFrameElement>('#preview-frame')!;
const previewMarkdown = document.querySelector<HTMLPreElement>('#preview-markdown')!;
const heading1Mode = document.querySelector<HTMLSelectElement>('#heading1-mode')!;
const heading2Mode = document.querySelector<HTMLSelectElement>('#heading2-mode')!;
const heading3Mode = document.querySelector<HTMLSelectElement>('#heading3-mode')!;
const heading4Mode = document.querySelector<HTMLSelectElement>('#heading4-mode')!;
const previewButton = document.querySelector<HTMLButtonElement>('#preview-button')!;
const saveIntermediateButton = document.querySelector<HTMLButtonElement>('#save-intermediate-button')!;
const submitButton = document.querySelector<HTMLButtonElement>('#submit-button')!;
const actionsHelp = document.querySelector<HTMLParagraphElement>('#actions-help')!;
const progressShell = document.querySelector<HTMLDivElement>('#progress-shell')!;
const progressBar = document.querySelector<HTMLDivElement>('#progress-bar')!;
const statusSpinner = document.querySelector<HTMLSpanElement>('#status-spinner')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;
const analyticsSummary = document.querySelector<HTMLParagraphElement>('#analytics-summary');
const analyticsTotal = document.querySelector<HTMLElement>('#analytics-total');
const analyticsToday = document.querySelector<HTMLElement>('#analytics-today');
const analyticsLink = document.querySelector<HTMLAnchorElement>('#analytics-link');

previewField.dataset.staleMessage = t('preview.stale');
previewField.dataset.busyMessage = t('preview.generating');

if (outputRadioElements.length === 0) {
  throw new Error('No se ha podido inicializar la interfaz.');
}

let selectedFile: File | null = null;
let selectedKind: InputKind | null = null;
let selectedElpxPages = new Set<string>();
let availableElpxPages: ElpxPageInfo[] = [];
let pageInspectionSequence = 0;
let autoPreviewSequence = 0;
let preparedConversion: PreparedConversion | null = null;
let legacyIntermediateElpx: IntermediateElpxSave | null = null;
let previewVirtualPages: Record<string, string> | null = null;
let previewCurrentPath = 'index.html';
let markdownPreviewMode: MarkdownPreviewMode = 'formatted';
const idlePreviewLabel = t('button.preview');
const idleSaveLabel = t('button.save');
const markdownPreview = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: false,
  breaks: false,
});

markdownPreview.use(texmath, {
  engine: {
    renderToString(content: string, options?: { displayMode?: boolean }) {
      return temml.renderToString(content.trim(), {
        displayMode: options?.displayMode,
        throwOnError: false,
      });
    },
  },
  delimiters: ['dollars', 'beg_end'],
});

function fallbackIntermediateElpx(conversion: PreparedConversion): IntermediateElpxSave | null {
  if (!conversion.blob) {
    return null;
  }

  return {
    blob: conversion.blob,
    filename: conversion.filename,
    pageCount: conversion.pageCount,
    blockCount: conversion.blockCount,
    previewHtml: conversion.previewType === 'html' ? conversion.previewContent : undefined,
    previewPages: conversion.previewPages,
    previewStartPath: conversion.previewStartPath,
  };
}

function getMetaContent(name: string): string {
  const node = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  return String(node?.content || '').trim();
}

function getAnalyticsConfig() {
  return {
    endpoint: getMetaContent('analytics-endpoint') || ANALYTICS_FALLBACK_ENDPOINT,
    statsUrl: getMetaContent('analytics-stats-url') || ANALYTICS_FALLBACK_STATS_URL,
    siteId: getMetaContent('analytics-site-id') || 'execonvert',
  };
}

function shouldTrackAnalytics(): boolean {
  const protocol = String(window.location.protocol || '');
  const host = String(window.location.hostname || '').toLowerCase();
  if (protocol !== 'http:' && protocol !== 'https:') return false;
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false;
  return !host.endsWith('.local');
}

function updateAnalyticsSummary(payload: { total?: number; today?: number } | null | undefined): void {
  const total = Number.parseInt(String(payload?.total ?? ''), 10);
  const today = Number.parseInt(String(payload?.today ?? ''), 10);
  const config = getAnalyticsConfig();
  if (!analyticsSummary || !analyticsTotal || !analyticsToday) return;
  if (!Number.isFinite(total) || !Number.isFinite(today)) return;
  analyticsTotal.textContent = String(total);
  analyticsToday.textContent = String(today);
  if (analyticsLink && config.statsUrl) analyticsLink.href = config.statsUrl;
  analyticsSummary.hidden = false;
}

function loadAnalyticsSummary(): void {
  if (!shouldTrackAnalytics()) return;
  const config = getAnalyticsConfig();
  if (!config.endpoint) return;

  const callbackName = `__exeConvertAnalytics_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  const query = new URLSearchParams();
  const urlParams = new URLSearchParams(window.location.search || '');
  const script = document.createElement('script');
  let settled = false;
  let timeoutId = 0;

  const cleanup = () => {
    if (settled) return;
    settled = true;
    if (timeoutId) window.clearTimeout(timeoutId);
    try {
      delete (window as Window & Record<string, unknown>)[callbackName];
    } catch {
      (window as Window & Record<string, unknown>)[callbackName] = undefined;
    }
    script.remove();
  };

  query.set('site', config.siteId);
  query.set('callback', callbackName);
  query.set('page_url', window.location.href);
  query.set('referrer', document.referrer || '');
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
    const value = String(urlParams.get(key) || '').trim();
    if (value) query.set(key, value);
  });

  (window as Window & Record<string, unknown>)[callbackName] = (payload: unknown) => {
    try {
      updateAnalyticsSummary(payload as { total?: number; today?: number });
    } finally {
      cleanup();
    }
  };

  script.async = true;
  script.src = `${config.endpoint}${config.endpoint.includes('?') ? '&' : '?'}${query.toString()}`;
  script.onerror = () => cleanup();
  timeoutId = window.setTimeout(cleanup, 4000);
  document.head.append(script);
}

function scheduleAnalyticsLoad(): void {
  if (!shouldTrackAnalytics()) return;
  const run = () => window.setTimeout(loadAnalyticsSummary, 0);
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: 2500 });
    return;
  }
  if (document.readyState === 'complete') {
    run();
    return;
  }
  window.addEventListener('load', run, { once: true });
}

languageSelect.addEventListener('change', () => {
  const value = languageSelect.value;
  if (value === locale || (value !== 'es' && value !== 'ca' && value !== 'en')) {
    return;
  }
  persistLocale(value as Locale);
  window.location.reload();
});

scheduleAnalyticsLoad();

pickButton.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0] || null;
  handleSelectedFile(file);
});

dropField.addEventListener('click', event => {
  const target = event.target as HTMLElement;
  if (target.closest('button')) {
    return;
  }
  fileInput.click();
});

dropField.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    fileInput.click();
  }
});

dropField.addEventListener('dragover', event => {
  event.preventDefault();
  dropField.classList.add('drop-active');
});

dropField.addEventListener('dragleave', () => {
  dropField.classList.remove('drop-active');
});

dropField.addEventListener('drop', event => {
  event.preventDefault();
  dropField.classList.remove('drop-active');
  const file = event.dataTransfer?.files?.[0] || null;
  handleSelectedFile(file);
});

heading1Mode.addEventListener('change', () => {
  syncStructureControls();
  invalidatePreparedConversion();
});

heading2Mode.addEventListener('change', () => {
  syncStructureControls();
  invalidatePreparedConversion();
});

heading3Mode.addEventListener('change', () => {
  syncStructureControls();
  invalidatePreparedConversion();
});

heading4Mode.addEventListener('change', () => {
  invalidatePreparedConversion();
});

markdownImages.addEventListener('change', () => {
  invalidatePreparedConversion();
});

for (const radio of outputRadioElements) {
  radio.addEventListener('change', () => {
    syncOutputControls();
    syncDetectedMessage();
    invalidatePreparedConversion();
  });
}

pagesAllButton.addEventListener('click', () => {
  selectedElpxPages = new Set(availableElpxPages.map(page => page.id));
  renderPageSelectionList();
});

pagesNoneButton.addEventListener('click', () => {
  selectedElpxPages.clear();
  renderPageSelectionList();
});

pageSelectionList.addEventListener('change', event => {
  const target = event.target as HTMLInputElement;
  if (!target || target.type !== 'checkbox') {
    return;
  }

  const pageId = target.dataset.pageId;
  if (!pageId) {
    return;
  }

  if (target.checked) {
    selectedElpxPages.add(pageId);
  } else {
    selectedElpxPages.delete(pageId);
  }

  invalidatePreparedConversion();
  refreshPageSelectionHelp();
});

previewPopoutButton.addEventListener('click', () => {
  if (!preparedConversion) {
    return;
  }
  openPreviewInWindow(preparedConversion);
});

previewFrame.addEventListener('load', () => {
  bindPreviewFrameNavigation();
});

previewMarkdownFormattedButton.addEventListener('click', () => {
  markdownPreviewMode = 'formatted';
  syncMarkdownPreviewModeButtons();
  if (preparedConversion?.previewType === 'markdown') {
    renderPreview(preparedConversion);
  }
});

previewMarkdownSourceButton.addEventListener('click', () => {
  markdownPreviewMode = 'source';
  syncMarkdownPreviewModeButtons();
  if (preparedConversion?.previewType === 'markdown') {
    renderPreview(preparedConversion);
  }
});

previewButton.addEventListener('click', async () => {
  if (!selectedFile || !selectedKind) {
    setStatus(t('status.selectFileFirst'));
    return;
  }

  setBusyState(true);
  try {
    preparedConversion = await prepareCurrentConversion(selectedFile, selectedKind);
    if (selectedKind === 'elp') {
      legacyIntermediateElpx = preparedConversion.intermediateElpx || fallbackIntermediateElpx(preparedConversion);
    }
    renderPreview(preparedConversion);
    syncDetectedMessage();
    setStatus(t('status.previewReady'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(t('status.errorPrefix', { message }), true);
  } finally {
    setBusyState(false);
    syncActionButtons();
  }
});

saveIntermediateButton.addEventListener('click', async () => {
  if (!selectedFile || !legacyIntermediateElpx) {
    return;
  }

  try {
    const saveTarget = await prepareSaveTargetForKind(selectedFile.name, 'elpx');
    const savedWithDialog = await saveBlobToTarget(
      legacyIntermediateElpx.blob,
      legacyIntermediateElpx.filename,
      saveTarget,
    );
    setStatus(savedWithDialog ? t('done.savedIntermediateElpxDialog') : t('done.savedIntermediateElpxDownload'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(t('status.errorPrefix', { message }), true);
  }
});

form.addEventListener('submit', async event => {
  event.preventDefault();

  if (!selectedFile || !selectedKind) {
    setStatus(t('status.selectFileFirst'));
    return;
  }

  const currentSignature = computeConversionSignature();
  if (!preparedConversion || preparedConversion.signature !== currentSignature) {
    setStatus(t('status.previewFirst'), true);
    syncActionButtons();
    return;
  }

  try {
    if (preparedConversion.kind === 'pdf') {
      const opened = openPdfPrintWindow(preparedConversion);
      if (!opened) {
        setStatus(t('status.popupBlocked'), true);
        return;
      }

      setStatus(t('done.export.pdfDialog', { pages: preparedConversion.pageCount }));
      return;
    }

    const saveTarget = await prepareSaveTargetForKind(selectedFile.name, preparedConversion.kind);
    const savedWithDialog = await saveBlobToTarget(preparedConversion.blob!, preparedConversion.filename, saveTarget);

    if (preparedConversion.kind === 'elpx') {
      const sourceName =
        selectedKind === 'docx'
          ? t('source.docxImport')
          : selectedKind === 'markdown'
            ? t('source.mdImport')
            : t('source.elpImport');
      setStatus(
        savedWithDialog
          ? t('done.import.withDialog', {
              source: sourceName,
              pages: preparedConversion.pageCount,
              blocks: preparedConversion.blockCount || 0,
            })
          : t('done.import.download', {
              source: sourceName,
              pages: preparedConversion.pageCount,
              blocks: preparedConversion.blockCount || 0,
            }),
      );
      return;
    }

    const formatLabel = preparedConversion.kind === 'markdown' ? t('format.markdown') : t('format.docx');
    setStatus(
      savedWithDialog
        ? t('done.export.withDialog', {
            format: formatLabel,
            pages: preparedConversion.pageCount,
          })
        : t('done.export.download', {
            format: formatLabel,
            pages: preparedConversion.pageCount,
          }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(t('status.errorPrefix', { message }), true);
  }
});

function handleSelectedFile(file: File | null): void {
  autoPreviewSequence += 1;
  selectedFile = file;
  legacyIntermediateElpx = null;

  if (!file) {
    selectedKind = null;
    fileInput.value = '';
    fileNameElement.textContent = t('file.none');
    resetDetectedOptions();
    clearPageSelectionState();
    clearPreview();
    setStatus(t('status.idle'));
    return;
  }

  const kind = detectInputKind(file.name);
  fileNameElement.textContent = file.name;

  if (!kind) {
    selectedKind = null;
    resetDetectedOptions();
    clearPageSelectionState();
    clearPreview();
    setStatus(t('status.unsupported'), true);
    return;
  }

  selectedKind = kind;
  applyDetectedOptions(kind);
  syncActionButtons();

  if (kind === 'elp') {
    const sequence = autoPreviewSequence;
    void autoPreviewLegacyElp(file, sequence);
  }
}

function detectInputKind(filename: string): InputKind | null {
  const lowerName = filename.toLowerCase();

  if (lowerName.endsWith('.elp')) {
    return 'elp';
  }

  if (lowerName.endsWith('.docx')) {
    return 'docx';
  }

  if (lowerName.endsWith('.md') || lowerName.endsWith('.markdown') || lowerName.endsWith('.mdown') || lowerName.endsWith('.txt')) {
    return 'markdown';
  }

  if (lowerName.endsWith('.elpx') || lowerName.endsWith('.zip')) {
    return 'elpx';
  }

  return null;
}

function applyDetectedOptions(kind: InputKind): void {
  detectedField.hidden = false;
  outputField.hidden = kind !== 'elpx' && kind !== 'elp';
  pageSelectionField.hidden = kind !== 'elpx';
  structureField.hidden = kind === 'elpx' || kind === 'elp';
  legacySaveField.hidden = true;

  if (kind === 'elp') {
    const elpxRadio = Array.from(outputRadioElements).find(radio => radio.value === 'elpx');
    if (elpxRadio) {
      elpxRadio.checked = true;
    }
  }

  if (kind !== 'elpx') {
    clearPageSelectionState();
    syncStructureControls();
  } else if (selectedFile) {
    void inspectSelectedElpxPages(selectedFile);
  }

  syncOutputControls();
  syncDetectedMessage();
  syncActionButtons();
}

function resetDetectedOptions(): void {
  detectedField.hidden = true;
  outputField.hidden = true;
  pageSelectionField.hidden = true;
  structureField.hidden = true;
  legacySaveField.hidden = true;
  markdownImagesField.hidden = true;
  previewButton.disabled = true;
  saveIntermediateButton.hidden = true;
  saveIntermediateButton.disabled = true;
  submitButton.disabled = true;
}

function syncDetectedMessage(): void {
  if (!selectedKind) {
    detectedField.hidden = true;
    return;
  }

  detectedField.hidden = false;
  const hasPreparedCurrentConversion = hasCurrentPreparedConversion();

  if (selectedKind === 'docx') {
    detectedHelp.innerHTML = t(hasPreparedCurrentConversion ? 'detected.docxToElpxDone' : 'detected.docxToElpx');
    setStatus(t('status.docxDetected'));
    return;
  }

  if (selectedKind === 'markdown') {
    detectedHelp.innerHTML = t(hasPreparedCurrentConversion ? 'detected.mdToElpxDone' : 'detected.mdToElpx');
    setStatus(t('status.mdDetected'));
    return;
  }

  if (selectedKind === 'elp') {
    const outputKind = getSelectedOutputKind();
    detectedHelp.innerHTML =
      outputKind === 'elpx'
        ? t(hasPreparedCurrentConversion ? 'detected.elpToElpxDone' : 'detected.elpToElpx')
        : outputKind === 'markdown'
          ? t(hasPreparedCurrentConversion ? 'detected.elpToMdDone' : 'detected.elpToMd')
          : outputKind === 'pdf'
            ? t(hasPreparedCurrentConversion ? 'detected.elpToPdfDone' : 'detected.elpToPdf')
            : t(hasPreparedCurrentConversion ? 'detected.elpToDocxDone' : 'detected.elpToDocx');
    setStatus(t('status.elpDetected'));
    return;
  }

  const outputKind = getSelectedElpxOutputKind();
  detectedHelp.innerHTML =
    outputKind === 'markdown'
      ? t(hasPreparedCurrentConversion ? 'detected.elpxToMdDone' : 'detected.elpxToMd')
      : outputKind === 'pdf'
        ? t(hasPreparedCurrentConversion ? 'detected.elpxToPdfDone' : 'detected.elpxToPdf')
        : t(hasPreparedCurrentConversion ? 'detected.elpxToDocxDone' : 'detected.elpxToDocx');
  setStatus(t('status.elpxDetected'));
}

function hasCurrentPreparedConversion(): boolean {
  return Boolean(
    selectedFile &&
      selectedKind &&
      preparedConversion &&
      preparedConversion.signature === computeConversionSignature(),
  );
}

function syncStructureControls(): void {
  if (selectedKind !== 'docx' && selectedKind !== 'markdown') {
    structureField.hidden = true;
    return;
  }

  const heading1UsesResourceTitle = heading1Mode.value === 'resource';
  if (heading1UsesResourceTitle) {
    setForcedPageSelectState(heading2Mode, t('structure.h1.forcedPage'));
  } else {
    setDependentSelectState(heading2Mode, true, t('structure.block'));
  }

  const heading2UsesPages = heading1UsesResourceTitle || heading2Mode.value === 'page';
  setDependentSelectState(heading3Mode, heading2UsesPages, t('structure.disabledNested'));

  const heading3UsesPages = heading2UsesPages && heading3Mode.value === 'page';
  setDependentSelectState(heading4Mode, heading3UsesPages, t('structure.disabledNested'));
}

function syncOutputControls(): void {
  outputOptionElpx.hidden = true;
  if (selectedKind !== 'elp' && getSelectedOutputKind() === 'elpx') {
    const docxRadio = Array.from(outputRadioElements).find(radio => radio.value === 'docx');
    if (docxRadio) {
      docxRadio.checked = true;
    }
  }

  const outputKind = getSelectedOutputKind();
  legacySaveField.hidden = true;
  pageSelectionField.hidden = !(
    selectedKind === 'elpx' ||
    (selectedKind === 'elp' && outputKind !== 'elpx')
  );

  const showMarkdownOptions =
    (selectedKind === 'elpx' || selectedKind === 'elp') && outputKind === 'markdown';
  markdownImagesField.hidden = !showMarkdownOptions;
}

function getSelectedElpxOutputKind(): 'docx' | 'markdown' | 'pdf' {
  const checked = Array.from(outputRadioElements).find(radio => radio.checked);
  if (checked?.value === 'markdown') {
    return 'markdown';
  }
  if (checked?.value === 'pdf') {
    return 'pdf';
  }
  return 'docx';
}

function getSelectedOutputKind(): OutputKind {
  const checked = Array.from(outputRadioElements).find(radio => radio.checked);
  if (checked?.value === 'markdown') {
    return 'markdown';
  }
  if (checked?.value === 'pdf') {
    return 'pdf';
  }
  if (checked?.value === 'elpx') {
    return 'elpx';
  }
  return 'docx';
}

function getHeadingOptions(): {
  heading1Mode: Heading1Mode;
  heading2Mode: HeadingMode;
  heading3Mode: HeadingMode;
  heading4Mode: HeadingMode;
} {
  return {
    heading1Mode: heading1Mode.value as Heading1Mode,
    heading2Mode: heading2Mode.value as HeadingMode,
    heading3Mode: heading3Mode.value as HeadingMode,
    heading4Mode: heading4Mode.value as HeadingMode,
  };
}

function setDependentSelectState(
  selectElement: HTMLSelectElement,
  enabled: boolean,
  disabledLabel: string,
): void {
  if (!enabled) {
    selectElement.innerHTML = `<option value="block">${disabledLabel}</option>`;
    selectElement.value = 'block';
    selectElement.disabled = true;
    return;
  }

  const currentValue = selectElement.value === 'page' ? 'page' : 'block';
  selectElement.innerHTML = `
    <option value="block">${t('structure.block')}</option>
    <option value="page">${t('structure.subpage')}</option>
  `;
  selectElement.value = currentValue;
  selectElement.disabled = false;
}

function setForcedPageSelectState(selectElement: HTMLSelectElement, label: string): void {
  selectElement.innerHTML = `<option value="page">${label}</option>`;
  selectElement.value = 'page';
  selectElement.disabled = true;
}

function setStatus(message: string, isError = false): void {
  status.textContent = message;
  status.dataset.state = isError ? 'error' : 'idle';
}

function setBusyState(isBusy: boolean): void {
  previewButton.classList.toggle('is-loading', isBusy);
  submitButton.classList.toggle('is-loading', isBusy);
  setButtonLabel(previewButton, isBusy ? t('button.working') : idlePreviewLabel);
  setButtonLabel(submitButton, isBusy ? t('button.working') : getSaveButtonLabel());
  previewButton.disabled = isBusy;
  submitButton.disabled = isBusy;
  statusSpinner.hidden = !isBusy;
  progressShell.hidden = !isBusy;
  previewField.classList.toggle('preview-busy', isBusy && !previewField.hidden);

  if (isBusy) {
    setProgress(8);
  } else {
    setProgress(0);
  }
}

function setButtonLabel(button: HTMLButtonElement, label: string): void {
  const labelNode = button.querySelector<HTMLElement>('.btn-label');
  if (labelNode) {
    labelNode.textContent = label;
    return;
  }
  button.textContent = label;
}

function updateProgress(progress: ConvertProgress | DocxImportProgress): void {
  const phasePercent: Record<ConvertProgress['phase'] | DocxImportProgress['phase'], number> = {
    read: 14,
    parse: 32,
    filter: 48,
    template: 58,
    render: 72,
    docx: 88,
    pack: 94,
  };

  setProgress(phasePercent[progress.phase] || 10);
}

function toLocalizedProgressMessage(progress: ConvertProgress | DocxImportProgress): string {
  if (progress.messageKey) {
    return t(progress.messageKey);
  }
  return progress.message;
}

function setProgress(percent: number): void {
  progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
}

async function prepareSaveTarget(options: {
  inputFilename: string;
  description: string;
  mime: string;
  extension: '.docx' | '.elpx' | '.md' | '.pdf';
}): Promise<PendingSaveTarget | null> {
  const filePickerWindow = window as FilePickerWindow;

  if (!filePickerWindow.showSaveFilePicker) {
    return null;
  }

  const suggestedName = toOutputFilename(options.inputFilename, options.extension);

  try {
    const handle = await filePickerWindow.showSaveFilePicker({
      suggestedName,
      types: [
        {
          description: options.description,
          accept: {
            [options.mime]: [options.extension],
          },
        },
      ],
    });

    return { handle, filename: suggestedName };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(t('error.saveCancelled'));
    }
  }

  return null;
}

async function saveBlobToTarget(blob: Blob, filename: string, saveTarget: PendingSaveTarget | null): Promise<boolean> {
  if (saveTarget) {
    const writable = await saveTarget.handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return true;
  }

  downloadBlob(blob, filename);
  return false;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function toOutputFilename(inputFilename: string, extension: '.docx' | '.elpx' | '.md' | '.pdf'): string {
  const stem = inputFilename.replace(/\.[^.]+$/, '') || 'document';
  return `${stem}${extension}`;
}

function syncActionButtons(): void {
  const hasFile = selectedFile !== null && selectedKind !== null;
  const currentSignature = computeConversionSignature();
  const hasCurrentPreparedConversion = Boolean(hasFile && preparedConversion && preparedConversion.signature === currentSignature);
  const hidePreviewForAutoLegacyElp =
    selectedKind === 'elp' && getSelectedOutputKind() === 'elpx' && hasCurrentPreparedConversion;
  const showIntermediateSave =
    selectedKind === 'elp' &&
    legacyIntermediateElpx !== null &&
    (!hasCurrentPreparedConversion || preparedConversion?.kind !== 'elpx');
  const outputKind = getSelectedOutputKind();
  const requiresPreviewBeforeSave = Boolean(
    hasFile &&
      ((selectedKind === 'elpx' && outputKind !== 'elpx') ||
        (selectedKind === 'elp' && outputKind !== 'elpx') ||
        selectedKind === 'docx' ||
        selectedKind === 'markdown'),
  );
  const shouldShowFinalSaveButton = Boolean(hasFile && (hasCurrentPreparedConversion || requiresPreviewBeforeSave));

  previewButton.hidden = !hasFile || hidePreviewForAutoLegacyElp;
  previewButton.disabled = !hasFile;
  const canSave = Boolean(hasFile && preparedConversion && preparedConversion.signature === currentSignature);
  saveIntermediateButton.hidden = !showIntermediateSave;
  saveIntermediateButton.disabled = !legacyIntermediateElpx;
  submitButton.hidden = !shouldShowFinalSaveButton;
  submitButton.disabled = !canSave;
  setButtonLabel(saveIntermediateButton, t('button.saveElpx'));
  setButtonLabel(submitButton, getSaveButtonLabel());
  previewPopoutButton.hidden = !canSave;
  const shouldExplainPreviewFirst = Boolean(shouldShowFinalSaveButton && !canSave && requiresPreviewBeforeSave);
  actionsHelp.hidden = !shouldExplainPreviewFirst;
  if (shouldExplainPreviewFirst) {
    actionsHelp.textContent = t('actions.previewRequired');
  }
}

function getSaveButtonLabel(): string {
  if (preparedConversion) {
    if (preparedConversion.kind === 'elpx') {
      return t('button.saveElpx');
    }
    if (preparedConversion.kind === 'markdown') {
      return t('button.saveMd');
    }
    if (preparedConversion.kind === 'pdf') {
      return t('button.savePdf');
    }
    return t('button.saveDocx');
  }

  const outputKind = getSelectedOutputKind();
  if (selectedKind === 'elp' && outputKind === 'elpx') {
    return t('button.saveElpx');
  }
  if (outputKind === 'markdown') {
    return t('button.saveMd');
  }
  if (outputKind === 'pdf') {
    return t('button.savePdf');
  }
  if (outputKind === 'docx') {
    return t('button.saveDocx');
  }
  return idleSaveLabel;
}

function invalidatePreparedConversion(): void {
  preparedConversion = null;
  markPreviewAsStale();
  syncActionButtons();
  syncDetectedMessage();
}

function clearPreview(): void {
  previewField.hidden = true;
  previewMarkdownModeField.hidden = true;
  previewPopoutButton.hidden = true;
  previewVirtualPages = null;
  previewCurrentPath = 'index.html';
  previewFrame.removeAttribute('srcdoc');
  previewFrame.removeAttribute('src');
  previewMarkdown.hidden = true;
  previewMarkdown.textContent = '';
  previewField.classList.remove('preview-stale');
  previewField.classList.remove('preview-busy');
  invalidatePreparedConversion();
}

async function autoPreviewLegacyElp(file: File, sequence: number): Promise<void> {
  setBusyState(true);
  try {
    preparedConversion = await prepareCurrentConversion(file, 'elp');
    if (sequence !== autoPreviewSequence || selectedFile !== file || selectedKind !== 'elp') {
      return;
    }
    legacyIntermediateElpx = preparedConversion.intermediateElpx || fallbackIntermediateElpx(preparedConversion);
    if (!legacyIntermediateElpx) {
      throw new Error('No se ha podido preparar el archivo .elpx intermedio.');
    }
    const intermediateFile = new File([legacyIntermediateElpx.blob], legacyIntermediateElpx.filename, {
      type: 'application/zip',
    });
    await inspectSelectedElpxPages(intermediateFile, true);
    renderPreview(preparedConversion);
    syncDetectedMessage();
    setStatus(t('status.previewReady'));
  } catch (error) {
    if (sequence !== autoPreviewSequence || selectedFile !== file || selectedKind !== 'elp') {
      return;
    }
    const message = error instanceof Error ? error.message : String(error);
    setStatus(t('status.errorPrefix', { message }), true);
  } finally {
    if (sequence === autoPreviewSequence && selectedFile === file && selectedKind === 'elp') {
      setBusyState(false);
      syncActionButtons();
    }
  }
}

async function inspectSelectedElpxPages(file: File, preservePreparedConversion = false): Promise<void> {
  const inspectionId = ++pageInspectionSequence;
  setStatus(t('status.readingPages'));
  pageSelectionList.innerHTML = '';
  pageSelectionHelp.textContent = t('pages.help.loading');

  try {
    const pages = await inspectElpxPages(file);
    if (inspectionId !== pageInspectionSequence) {
      return;
    }

    availableElpxPages = pages;
    selectedElpxPages = new Set(pages.map(page => page.id));
    renderPageSelectionList();
    if (!preservePreparedConversion) {
      invalidatePreparedConversion();
    } else {
      syncOutputControls();
      syncActionButtons();
    }
  } catch {
    if (inspectionId !== pageInspectionSequence) {
      return;
    }

    availableElpxPages = [];
    selectedElpxPages.clear();
    pageSelectionList.innerHTML = '';
    pageSelectionHelp.textContent = t('pages.help.readError');
  } finally {
    if (inspectionId === pageInspectionSequence) {
      syncOutputControls();
      syncDetectedMessage();
    }
  }
}

function renderPageSelectionList(): void {
  if (availableElpxPages.length === 0) {
    pageSelectionList.innerHTML = '';
    pageSelectionHelp.textContent = t('pages.help.noneDetected');
    return;
  }

  pageSelectionList.innerHTML = availableElpxPages
    .map(page => {
      const checked = selectedElpxPages.has(page.id) ? 'checked' : '';
      const indent = Math.max(0, page.depth - 1) * 18;
      return `<label class="page-selection-row" style="--depth-indent: ${indent}px;">
  <input type="checkbox" data-page-id="${escapeAttribute(page.id)}" ${checked} />
  <span>${escapeHtml(page.title)}</span>
</label>`;
    })
    .join('');

  refreshPageSelectionHelp();
}

function refreshPageSelectionHelp(): void {
  if (availableElpxPages.length === 0) {
    return;
  }

  const selectedCount = selectedElpxPages.size;
  pageSelectionHelp.innerHTML = t('pages.help.summary', { selected: selectedCount, total: availableElpxPages.length });
}

function getSelectedElpxPageIds(): string[] | undefined {
  if (availableElpxPages.length === 0) {
    return undefined;
  }

  return availableElpxPages.map(page => page.id).filter(id => selectedElpxPages.has(id));
}

function clearPageSelectionState(): void {
  availableElpxPages = [];
  selectedElpxPages.clear();
  pageSelectionList.innerHTML = '';
  pageSelectionHelp.textContent = t('pages.help');
  invalidatePreparedConversion();
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

function computeConversionSignature(): string {
  const filePart = selectedFile ? `${selectedFile.name}:${selectedFile.size}:${selectedFile.lastModified}` : 'none';
  const kindPart = selectedKind || 'none';
  const outputPart = getSelectedOutputKind();
  const headingsPart = `${heading1Mode.value}|${heading2Mode.value}|${heading3Mode.value}|${heading4Mode.value}`;
  const markdownPart = markdownImages.checked ? 'img:1' : 'img:0';
  const selectedPages = getSelectedElpxPageIds();
  const pagesPart =
    !selectedPages || selectedPages.length === availableElpxPages.length
      ? 'all'
      : selectedPages.slice().sort().join(',');
  return [filePart, kindPart, outputPart, headingsPart, markdownPart, pagesPart].join('::');
}

async function prepareCurrentConversion(file: File, kind: InputKind): Promise<PreparedConversion> {
  const signature = computeConversionSignature();
  const selectedPageIds = getSelectedElpxPageIds();
  const selectedPageCount = selectedPageIds?.length ?? availableElpxPages.length;
  const requiresPageSelection =
    availableElpxPages.length > 0 &&
    ((kind === 'elpx') || (kind === 'elp' && getSelectedOutputKind() !== 'elpx'));
  if (requiresPageSelection && selectedPageCount === 0) {
    throw new Error(t('error.selectAtLeastOnePage'));
  }

  if (kind === 'docx' || kind === 'markdown') {
    const importResult =
      kind === 'docx'
        ? await convertDocxToElpx(file, getHeadingOptions(), progress => {
            updateProgress(progress);
            setStatus(toLocalizedProgressMessage(progress));
          })
        : await convertMarkdownToElpx(file, getHeadingOptions(), progress => {
            updateProgress(progress);
            setStatus(toLocalizedProgressMessage(progress));
          });

    setStatus(t('status.generatingElpxPreview'));
    const previewHtml = importResult.previewHtml;

    return {
      signature,
      kind: 'elpx',
      blob: importResult.blob,
      filename: importResult.filename,
      pageCount: importResult.pageCount,
      blockCount: importResult.blockCount,
      previewType: 'html',
      previewContent: previewHtml,
      previewPages: importResult.previewPages,
      previewStartPath: 'index.html',
    };
  }

  if (kind === 'elp') {
    const cachedIntermediate = legacyIntermediateElpx;
    const elpxResult =
      cachedIntermediate ||
      (await convertElpToElpx(file, progress => {
        updateProgress(progress);
        setStatus(toLocalizedProgressMessage(progress));
      }));

    const intermediateElpx: IntermediateElpxSave =
      'previewHtml' in elpxResult
        ? {
            blob: elpxResult.blob,
            filename: elpxResult.filename,
            pageCount: elpxResult.pageCount,
            blockCount: elpxResult.blockCount,
            previewHtml: elpxResult.previewHtml,
            previewPages: elpxResult.previewPages,
            previewStartPath: 'index.html',
          }
        : {
            blob: elpxResult.blob,
            filename: elpxResult.filename,
            pageCount: elpxResult.pageCount,
            blockCount: elpxResult.blockCount,
            previewHtml: elpxResult.previewHtml,
            previewPages: elpxResult.previewPages,
            previewStartPath: elpxResult.previewStartPath,
          };

    const outputKind = getSelectedOutputKind();
    if (outputKind === 'elpx') {
      setStatus(t('status.generatingElpxPreview'));
      return {
        signature,
        kind: 'elpx',
        blob: intermediateElpx.blob,
        filename: intermediateElpx.filename,
        pageCount: intermediateElpx.pageCount,
        blockCount: intermediateElpx.blockCount,
        previewType: 'html',
        previewContent: intermediateElpx.previewHtml || '',
        previewPages: intermediateElpx.previewPages,
        previewStartPath: intermediateElpx.previewStartPath || 'index.html',
        intermediateElpx,
      };
    }

    const elpxFile = new File([intermediateElpx.blob], intermediateElpx.filename, { type: 'application/zip' });
    if (outputKind === 'markdown') {
      const result = await convertElpxToMarkdown(
        elpxFile,
        { includeImages: markdownImages.checked, selectedPageIds },
        progress => {
          updateProgress(progress);
          setStatus(toLocalizedProgressMessage(progress));
        },
      );

      return {
        signature,
        kind: 'markdown',
        blob: result.blob,
        filename: result.filename,
        pageCount: result.pageCount,
        previewType: 'markdown',
        previewContent: await result.blob.text(),
        intermediateElpx,
      };
    }

    if (outputKind === 'pdf') {
      const result = await convertElpxToHtml(
        elpxFile,
        { selectedPageIds },
        progress => {
          updateProgress(progress);
          setStatus(toLocalizedProgressMessage(progress));
        },
      );

      return {
        signature,
        kind: 'pdf',
        blob: null,
        filename: toOutputFilename(file.name, '.pdf'),
        pageCount: result.pageCount,
        previewType: 'html',
        previewContent: buildPrintableHtmlDocument(result.html, {
          title: toOutputFilename(file.name, '.pdf'),
        }),
        intermediateElpx,
      };
    }

    const result = await convertElpxToDocx(elpxFile, { selectedPageIds }, progress => {
      updateProgress(progress);
      setStatus(toLocalizedProgressMessage(progress));
    });

    return {
      signature,
      kind: 'docx',
      blob: result.blob,
      filename: result.filename,
      pageCount: result.pageCount,
      previewType: 'html',
      previewContent: result.previewHtml,
      intermediateElpx,
    };
  }

  const outputKind = getSelectedElpxOutputKind();
  if (outputKind === 'markdown') {
    const result = await convertElpxToMarkdown(
      file,
      { includeImages: markdownImages.checked, selectedPageIds },
      progress => {
        updateProgress(progress);
        setStatus(toLocalizedProgressMessage(progress));
      },
    );

    return {
      signature,
      kind: 'markdown',
      blob: result.blob,
      filename: result.filename,
      pageCount: result.pageCount,
      previewType: 'markdown',
      previewContent: await result.blob.text(),
    };
  }

  if (outputKind === 'pdf') {
    const result = await convertElpxToHtml(
      file,
      { selectedPageIds },
      progress => {
        updateProgress(progress);
        setStatus(toLocalizedProgressMessage(progress));
      },
    );

    return {
      signature,
      kind: 'pdf',
      blob: null,
      filename: toOutputFilename(file.name, '.pdf'),
      pageCount: result.pageCount,
      previewType: 'html',
      previewContent: buildPrintableHtmlDocument(result.html, {
        title: toOutputFilename(file.name, '.pdf'),
      }),
    };
  }

  const result = await convertElpxToDocx(
    file,
    { selectedPageIds },
    progress => {
      updateProgress(progress);
      setStatus(toLocalizedProgressMessage(progress));
    },
  );

  return {
    signature,
    kind: 'docx',
    blob: result.blob,
    filename: result.filename,
    pageCount: result.pageCount,
    previewType: 'html',
    previewContent: result.previewHtml,
  };
}

function renderPreview(conversion: PreparedConversion): void {
  previewField.hidden = false;
  previewField.classList.remove('preview-stale');
  previewField.classList.remove('preview-busy');
  previewPopoutButton.hidden = false;
  if (conversion.previewType === 'markdown') {
    previewMarkdownModeField.hidden = false;
    syncMarkdownPreviewModeButtons();
    previewVirtualPages = null;
    previewCurrentPath = 'index.html';
    if (markdownPreviewMode === 'source') {
      previewFrame.removeAttribute('srcdoc');
      previewFrame.removeAttribute('src');
      previewFrame.hidden = true;
      previewMarkdown.hidden = false;
      previewMarkdown.textContent = conversion.previewContent;
    } else {
      previewMarkdown.hidden = true;
      previewMarkdown.textContent = '';
      previewFrame.hidden = false;
      previewFrame.srcdoc = buildMarkdownPreviewDocument(conversion.previewContent, conversion.filename, 'formatted');
      previewFrame.removeAttribute('src');
    }
    return;
  }

  previewMarkdownModeField.hidden = true;
  previewMarkdown.hidden = true;
  previewMarkdown.textContent = '';
  previewFrame.hidden = false;
  previewVirtualPages = conversion.previewPages ?? null;
  previewCurrentPath = conversion.previewStartPath || 'index.html';

  if (previewVirtualPages && previewVirtualPages[previewCurrentPath]) {
    previewFrame.srcdoc = previewVirtualPages[previewCurrentPath];
    previewFrame.removeAttribute('src');
    return;
  }

  previewFrame.srcdoc = conversion.previewContent;
  previewFrame.removeAttribute('src');
}

function markPreviewAsStale(): void {
  if (previewField.hidden) {
    return;
  }
  previewField.classList.remove('preview-busy');
  previewField.classList.add('preview-stale');
}

function openPreviewInWindow(conversion: PreparedConversion): void {
  const previewWindow = window.open('', '_blank', 'popup=yes,width=1100,height=760,resizable=yes,scrollbars=yes');
  if (!previewWindow) {
    setStatus(t('status.popupBlocked'), true);
    return;
  }

  const htmlContent = (() => {
    if (conversion.previewType === 'markdown') {
      return buildMarkdownPreviewDocument(conversion.previewContent, conversion.filename, markdownPreviewMode);
    }

    if (conversion.previewPages) {
      return buildPagedPreviewDocument(
        conversion.previewPages,
        conversion.previewStartPath || 'index.html',
        conversion.filename,
      );
    }

    return conversion.previewContent;
  })();

  previewWindow.document.open();
  previewWindow.document.write(htmlContent);
  previewWindow.document.close();
}

function openPdfPrintWindow(conversion: PreparedConversion): boolean {
  const previewWindow = window.open('', '_blank', 'popup=yes,width=1100,height=760,resizable=yes,scrollbars=yes');
  if (!previewWindow) {
    return false;
  }

  const htmlContent = conversion.previewContent.replace(
    '</body>',
    `<script>
      window.addEventListener('load', () => {
        window.setTimeout(() => {
          try { window.print(); } catch {}
        }, 180);
      }, { once: true });
    </script>
  </body>`,
  );

  previewWindow.document.open();
  previewWindow.document.write(htmlContent);
  previewWindow.document.close();
  return true;
}

function bindPreviewFrameNavigation(): void {
  if (!previewVirtualPages) {
    return;
  }

  const frameDocument = previewFrame.contentDocument;
  if (!frameDocument) {
    return;
  }

  frameDocument.addEventListener('click', event => {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
    if (!anchor) {
      return;
    }

    const href = (anchor.getAttribute('href') || '').trim();
    const resolved = resolveVirtualPreviewPath(previewCurrentPath, href);
    if (!resolved || !previewVirtualPages?.[resolved]) {
      return;
    }

    event.preventDefault();
    previewCurrentPath = resolved;
    previewFrame.srcdoc = previewVirtualPages[resolved];
    previewFrame.removeAttribute('src');
  });
}

function buildPagedPreviewDocument(pages: Record<string, string>, startPath: string, title: string): string {
  const safeStartPath = pages[startPath] ? startPath : Object.keys(pages)[0] || 'index.html';
  const serializedPages = JSON.stringify(pages)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  return `<!doctype html>
<html lang="${escapeAttribute(locale)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; }
    iframe { display: block; width: 100%; height: 100%; border: 0; }
  </style>
</head>
<body>
  <iframe id="preview-frame" title="${escapeAttribute(t('preview.pagedFrameTitle'))}"></iframe>
  <script>
    const pages = ${serializedPages};
    let currentPath = ${JSON.stringify(safeStartPath)};
    const frame = document.getElementById('preview-frame');

    const normalizePath = value => {
      const parts = value.replaceAll('\\\\', '/').split('/');
      const normalized = [];
      for (const part of parts) {
        if (!part || part === '.') continue;
        if (part === '..') {
          normalized.pop();
          continue;
        }
        normalized.push(part);
      }
      return normalized.join('/');
    };

    const resolvePath = (basePath, href) => {
      const isExternalHref = value => /^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('//');
      if (!href || href.startsWith('#') || isExternalHref(href)) return null;
      const plainHref = href.split('#')[0].split('?')[0];
      if (!plainHref) return null;
      const baseDir = basePath.includes('/') ? basePath.slice(0, basePath.lastIndexOf('/') + 1) : '';
      const combined = plainHref.startsWith('/') ? plainHref.slice(1) : baseDir + plainHref;
      return normalizePath(combined);
    };

    const render = path => {
      if (!pages[path]) return;
      currentPath = path;
      frame.srcdoc = pages[path];
    };

    frame.addEventListener('load', () => {
      const doc = frame.contentDocument;
      if (!doc) return;
      doc.addEventListener('click', event => {
        const anchor = event.target && event.target.closest ? event.target.closest('a[href]') : null;
        if (!anchor) return;
        const href = (anchor.getAttribute('href') || '').trim();
        const resolved = resolvePath(currentPath, href);
        if (!resolved || !pages[resolved]) return;
        event.preventDefault();
        render(resolved);
      });
    });

    render(currentPath);
  </script>
</body>
</html>`;
}

function resolveVirtualPreviewPath(basePath: string, href: string): string | null {
  if (!href || href.startsWith('#') || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) {
    return null;
  }

  const plainHref = href.split('#')[0].split('?')[0];
  if (!plainHref) {
    return null;
  }

  const baseDir = basePath.includes('/') ? basePath.slice(0, basePath.lastIndexOf('/') + 1) : '';
  const combined = plainHref.startsWith('/') ? plainHref.slice(1) : `${baseDir}${plainHref}`;
  return normalizeVirtualPreviewPath(combined);
}

function normalizeVirtualPreviewPath(path: string): string {
  const parts = path.replaceAll('\\', '/').split('/');
  const normalized: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') {
      continue;
    }
    if (part === '..') {
      normalized.pop();
      continue;
    }
    normalized.push(part);
  }
  return normalized.join('/');
}

function syncMarkdownPreviewModeButtons(): void {
  previewMarkdownFormattedButton.dataset.state = markdownPreviewMode === 'formatted' ? 'active' : 'idle';
  previewMarkdownSourceButton.dataset.state = markdownPreviewMode === 'source' ? 'active' : 'idle';
}

function buildMarkdownPreviewDocument(markdown: string, title: string, mode: MarkdownPreviewMode): string {
  if (mode === 'source') {
  return `<!doctype html>
<html lang="${escapeAttribute(locale)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 16px; font-family: Consolas, "Liberation Mono", monospace; line-height: 1.45; color: #1f2a1f; background: #fff; }
    pre { white-space: pre-wrap; word-break: break-word; margin: 0; }
  </style>
</head>
<body>
  <pre>${escapeHtml(markdown)}</pre>
</body>
</html>`;
  }

  const contentHtml = sanitizeMarkdownPreviewHtml(renderMarkdownPreviewMath(markdownPreview.render(markdown)));
  return `<!doctype html>
<html lang="${escapeAttribute(locale)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    html, body { margin: 0; padding: 0; background: #f5f7f4; }
    body { color: #263126; font-family: Candara, "Trebuchet MS", "Lucida Sans Unicode", sans-serif; line-height: 1.6; }
    main { box-sizing: border-box; width: min(900px, 100%); margin: 0 auto; padding: 24px; background: #fff; }
    h1, h2, h3, h4, h5, h6 { color: #2f5d2f; line-height: 1.2; margin: 1.4em 0 0.6em; }
    h1 { font-size: 2rem; }
    h2 { font-size: 1.5rem; }
    p, li { font-size: 1rem; }
    pre, code { font-family: "IBM Plex Mono", Consolas, monospace; }
    pre { background: #f3f7f1; border: 1px solid #cfd8cb; border-radius: 10px; padding: 12px; overflow: auto; }
    code { background: #e9f3e3; padding: 0.1em 0.3em; border-radius: 0.25em; }
    img { max-width: 100%; height: auto; }
    table { width: 100%; border-collapse: collapse; }
    td, th { border: 1px solid #cfd8cb; padding: 6px 8px; vertical-align: top; }
    blockquote { margin: 1em 0; padding: 0.1em 1em; border-left: 4px solid #b8c5b3; background: #f7faf6; }
    .katex-error { color: #8d2626; }
  </style>
</head>
<body>
  <main>${contentHtml}</main>
</body>
</html>`;
}

function renderMarkdownPreviewMath(html: string): string {
  const document = new DOMParser().parseFromString(`<!doctype html><html><body>${html}</body></html>`, 'text/html');
  const protectedFragments = new Map<string, string>();

  for (const element of Array.from(document.body.querySelectorAll('pre, code, kbd, samp'))) {
    const token = `EXE_MD_PROTECTED_${Math.random().toString(36).slice(2, 10)}_TOKEN`;
    protectedFragments.set(token, element.outerHTML);
    element.replaceWith(document.createTextNode(token));
  }

  let renderedHtml = document.body.innerHTML
    .replace(/\\\[([\s\S]*?)\\\]/g, (_match, expression: string) => renderMarkdownLatexFragment(expression, true))
    .replace(/\\\(([\s\S]*?)\\\)/g, (_match, expression: string) => renderMarkdownLatexFragment(expression, false));

  for (const [token, fragment] of protectedFragments) {
    renderedHtml = renderedHtml.replaceAll(token, fragment);
  }

  return renderedHtml;
}

function renderMarkdownLatexFragment(expression: string, displayMode: boolean): string {
  const normalized = normalizeMarkdownPreviewLatex(expression);
  if (!normalized) {
    return displayMode ? '\\[\\]' : '\\(\\)';
  }

  try {
    return temml.renderToString(normalized, {
      displayMode,
      throwOnError: false,
      annotate: false,
    });
  } catch {
    return displayMode ? `\\[${normalized}\\]` : `\\(${normalized}\\)`;
  }
}

function normalizeMarkdownPreviewLatex(expression: string): string {
  let output = expression
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

  const parsed = new DOMParser().parseFromString(`<!doctype html><html><body>${output}</body></html>`, 'text/html');
  output = parsed.body.textContent || output;

  output = output.normalize('NFC').replace(/\u00a0/g, ' ').replace(/\r/g, '');
  output = output.replace(/[\uFFFD\uFEFF\u00AD\u2066-\u2069\u200B-\u200F\u202A-\u202E\uFFF9-\uFFFB]/g, '');
  output = output.replace(/[\uD800-\uDFFF]/g, '');
  output = output.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  output = output.replace(/[ \t]*\n[ \t]*/g, '\n');
  output = output.replace(/\\\s+([A-Za-z])/g, '\\$1');
  output = output.replace(/\\ext\{/g, '\\text{');
  output = output.replace(/\bL\s+A\s+T\s+E\s+X\b\\?/g, '\\LaTeX');
  output = output.replace(/(^|[^\\])\.{2}\s+\\\\/g, '$1\\ldots ');
  output = output.replace(/\\\\backslash\b/g, '\\\\');
  output = output.replace(/\\backslash\b/g, '\\\\');
  output = output.replace(/[ \t]+/g, ' ');
  output = output.replace(/ ?\n ?/g, '\n');
  output = output.trim();

  while (output.endsWith('\\')) {
    output = output.slice(0, -1).trimEnd();
  }

  return output;
}

function sanitizeMarkdownPreviewHtml(html: string): string {
  const document = new DOMParser().parseFromString(`<!doctype html><html><body>${html}</body></html>`, 'text/html');

  for (const element of Array.from(document.body.querySelectorAll<HTMLElement>('*'))) {
    element.removeAttribute('style');
    element.removeAttribute('class');
    element.removeAttribute('width');
    element.removeAttribute('height');
    element.removeAttribute('border');
    element.removeAttribute('cellpadding');
    element.removeAttribute('cellspacing');
    element.removeAttribute('align');
    element.removeAttribute('valign');
    if (element.tagName === 'FONT') {
      const span = document.createElement('span');
      span.innerHTML = element.innerHTML;
      element.replaceWith(span);
    }
  }

  for (const table of Array.from(document.body.querySelectorAll('table'))) {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    table.parentNode?.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  }

  return document.body.innerHTML;
}

async function prepareSaveTargetForKind(inputFilename: string, kind: ConversionKind): Promise<PendingSaveTarget | null> {
  if (kind === 'elpx') {
    return prepareSaveTarget({
      inputFilename,
      description: t('save.type.elpx'),
      mime: 'application/zip',
      extension: '.elpx',
    });
  }

  if (kind === 'markdown') {
    return prepareSaveTarget({
      inputFilename,
      description: t('save.type.md'),
      mime: 'text/markdown',
      extension: '.md',
    });
  }

  if (kind === 'pdf') {
    return prepareSaveTarget({
      inputFilename,
      description: t('save.type.pdf'),
      mime: 'application/pdf',
      extension: '.pdf',
    });
  }

  return prepareSaveTarget({
    inputFilename,
    description: t('save.type.docx'),
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: '.docx',
  });
}

syncActionButtons();
