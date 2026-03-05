import './style.css';
import { convertElpxToDocx, inspectElpxPages, type ConvertProgress, type ElpxPageInfo } from './converter';
import { convertDocxToElpx, type DocxImportProgress, type Heading1Mode, type HeadingMode } from './docx-import';
import { convertElpxToMarkdown } from './elpx-markdown';
import { convertMarkdownToElpx } from './markdown-import';

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

type InputKind = 'docx' | 'markdown' | 'elpx';
type ElpxOutputKind = 'docx' | 'markdown';
type ConversionKind = 'docx' | 'markdown' | 'elpx';

interface PreparedConversion {
  signature: string;
  kind: ConversionKind;
  blob: Blob;
  filename: string;
  pageCount: number;
  blockCount?: number;
  previewType: 'html' | 'markdown';
  previewContent: string;
  previewPages?: Record<string, string>;
  previewStartPath?: string;
}

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('No se ha encontrado el contenedor principal.');
}

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
    <section class="hero" aria-label="Cabecera de la aplicación">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true">eXe</span>
        <div class="brand-copy">
          <h1>eXeConvert</h1>
          <p class="subtitle">Conversor para eXeLearning</p>
        </div>
      </div>
      <p class="lede">
        Convierte <code>.elpx</code> a <code>.docx</code> o <code>.md</code> y viceversa, directamente en el navegador y
        sin subir archivos a ningún servidor.
      </p>
    </section>

    <section class="panel">
      <h2>Conversión</h2>
      <form id="conversion-form" class="form">
        <div id="drop-field" class="dropzone" tabindex="0" role="button" aria-describedby="drop-help">
          <input id="file-input" type="file" accept=".elpx,.zip,.docx,.md,.markdown,.mdown,.txt" hidden />
          <p class="dropzone-title">Suelta aquí un archivo o selecciónalo</p>
          <p id="drop-help" class="drop-help">
            Archivos compatibles: <code>.elpx</code>, <code>.docx</code> y <code>.md</code>.
          </p>
          <div class="dropzone-actions">
            <button id="pick-button" type="button">
              <span class="material-symbols-rounded" aria-hidden="true">upload_file</span>
              <span class="btn-label">Abrir archivo</span>
            </button>
            <span id="file-name" class="picked-file">Ningún archivo seleccionado.</span>
          </div>
        </div>

        <div id="detected-field" class="field" hidden>
          <span>Conversión detectada</span>
          <p id="detected-help" class="field-help"></p>
        </div>

        <div id="output-field" class="field" hidden>
          <span>Salida desde ELPX</span>
          <div class="radio-group" role="radiogroup" aria-label="Formato de salida">
            <label class="radio-row">
              <input type="radio" name="elpx-output" value="docx" checked />
              <span>Documento Word (.docx)</span>
            </label>
            <label class="radio-row">
              <input type="radio" name="elpx-output" value="markdown" />
              <span>Markdown (.md)</span>
            </label>
          </div>
        </div>

        <div id="page-selection-field" class="field" hidden>
          <span>Páginas a exportar</span>
          <div class="page-selection-actions">
            <button id="pages-all" type="button" class="ghost-button">
              <span class="material-symbols-rounded" aria-hidden="true">done_all</span>
              <span class="btn-label">Todas</span>
            </button>
            <button id="pages-none" type="button" class="ghost-button">
              <span class="material-symbols-rounded" aria-hidden="true">remove_done</span>
              <span class="btn-label">Ninguna</span>
            </button>
          </div>
          <div id="page-selection-list" class="page-selection-list"></div>
          <p id="page-selection-help" class="field-help">
            Modo jerárquico normalizado: si falta una página padre seleccionada, sus hijas pasan a raíz.
          </p>
        </div>

        <div id="structure-field" class="field" hidden>
          <span>Estructura de páginas</span>
          <table class="mapping-table">
            <thead>
              <tr>
                <th>Nivel</th>
                <th>Destino</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row"><code>Título 1</code></th>
                <td>
                  <select id="heading1-mode">
                    <option value="page" selected>Página</option>
                    <option value="resource">Título del recurso</option>
                  </select>
                </td>
              </tr>
              <tr>
                <th scope="row"><code>Título 2</code></th>
                <td>
                  <select id="heading2-mode">
                    <option value="block" selected>iDevice de texto</option>
                    <option value="page">Subpágina</option>
                  </select>
                </td>
              </tr>
              <tr>
                <th scope="row"><code>Título 3</code></th>
                <td>
                  <select id="heading3-mode">
                    <option value="block" selected>iDevice de texto</option>
                    <option value="page">Subpágina</option>
                  </select>
                </td>
              </tr>
              <tr>
                <th scope="row"><code>Título 4</code></th>
                <td>
                  <select id="heading4-mode">
                    <option value="block" selected>iDevice de texto</option>
                    <option value="page">Subpágina</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="field-help">
            Cada nivel solo puede crear subpáginas cuando el nivel inmediatamente anterior también se usa como subpágina.
          </p>
          <p class="field-help">
            Si <code>Título 1</code> se usa como <em>Título del recurso</em>, el resto de encabezados se interpreta subiendo un nivel.
          </p>
        </div>

        <div id="markdown-images-field" class="field" hidden>
          <span>Imágenes al exportar Markdown</span>
          <label class="checkbox-row">
            <input id="markdown-images" type="checkbox" />
            <span>Incluir imágenes embebidas en el archivo Markdown</span>
          </label>
          <p class="field-help">Por defecto se omiten para generar un <code>.md</code> más limpio.</p>
        </div>

        <div class="actions">
          <button id="preview-button" type="button" disabled hidden>
            <span class="material-symbols-rounded" aria-hidden="true">preview</span>
            <span class="btn-label">Previsualizar</span>
          </button>
          <button id="submit-button" type="submit" disabled hidden>
            <span class="material-symbols-rounded" aria-hidden="true">save</span>
            <span class="btn-label">Guardar archivo</span>
          </button>
        </div>
      </form>

      <div id="progress-shell" class="progress-shell" hidden aria-hidden="true">
        <div class="progress-track">
          <div id="progress-bar" class="progress-bar"></div>
        </div>
      </div>
      <div class="status-shell">
        <span id="status-spinner" class="status-spinner" hidden aria-hidden="true"></span>
        <p id="status" class="status" aria-live="polite">
          Carga un archivo para que la aplicación detecte automáticamente la conversión disponible.
        </p>
      </div>

      <div id="preview-field" class="field preview-field" hidden>
        <div class="preview-heading">
          <span>Vista previa</span>
          <button id="preview-popout-button" type="button" class="ghost-button" hidden>
            <span class="material-symbols-rounded" aria-hidden="true">open_in_new</span>
            <span class="btn-label">Abrir en ventana</span>
          </button>
        </div>
        <p class="field-help">Revisa el resultado antes de guardar. Si cambias opciones o páginas, vuelve a previsualizar.</p>
        <iframe id="preview-frame" class="preview-frame" title="Vista previa del resultado"></iframe>
        <pre id="preview-markdown" class="preview-markdown" hidden></pre>
      </div>
    </section>

    <footer class="app-footer">
      <p class="app-footer-meta">
        Versión beta · v0.1.0-beta.3 · ©
        <a href="https://bilateria.org" target="_blank" rel="noopener noreferrer">Juan José de Haro</a>
        ·
        <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer">Licencia AGPLv3</a>
        ·
        <a href="https://github.com/jjdeharo/eXeConvert" target="_blank" rel="noopener noreferrer">Repositorio GitHub</a>
        ·
        <a href="https://github.com/jjdeharo/eXeConvert/issues" target="_blank" rel="noopener noreferrer">Problemas y sugerencias</a>
      </p>
      <p class="app-footer-note">
        Proyecto independiente. No está afiliado ni avalado oficialmente por eXeLearning o INTEF.
      </p>
      <p class="app-footer-note">
        Este proyecto reutiliza recursos de eXeLearning para compatibilidad con <code>.elpx</code>.
        Consulta las atribuciones en
        <a href="./THIRD_PARTY_NOTICES.md" target="_blank" rel="noopener noreferrer">THIRD_PARTY_NOTICES</a>.
      </p>
    </footer>
  </main>
`;

const form = document.querySelector<HTMLFormElement>('#conversion-form')!;
const dropField = document.querySelector<HTMLDivElement>('#drop-field')!;
const pickButton = document.querySelector<HTMLButtonElement>('#pick-button')!;
const fileInput = document.querySelector<HTMLInputElement>('#file-input')!;
const fileNameElement = document.querySelector<HTMLSpanElement>('#file-name')!;
const detectedField = document.querySelector<HTMLDivElement>('#detected-field')!;
const detectedHelp = document.querySelector<HTMLParagraphElement>('#detected-help')!;
const outputField = document.querySelector<HTMLDivElement>('#output-field')!;
const pageSelectionField = document.querySelector<HTMLDivElement>('#page-selection-field')!;
const pageSelectionList = document.querySelector<HTMLDivElement>('#page-selection-list')!;
const pageSelectionHelp = document.querySelector<HTMLParagraphElement>('#page-selection-help')!;
const pagesAllButton = document.querySelector<HTMLButtonElement>('#pages-all')!;
const pagesNoneButton = document.querySelector<HTMLButtonElement>('#pages-none')!;
const outputRadioElements = document.querySelectorAll<HTMLInputElement>('input[name="elpx-output"]');
const structureField = document.querySelector<HTMLDivElement>('#structure-field')!;
const markdownImagesField = document.querySelector<HTMLDivElement>('#markdown-images-field')!;
const markdownImages = document.querySelector<HTMLInputElement>('#markdown-images')!;
const previewField = document.querySelector<HTMLDivElement>('#preview-field')!;
const previewPopoutButton = document.querySelector<HTMLButtonElement>('#preview-popout-button')!;
const previewFrame = document.querySelector<HTMLIFrameElement>('#preview-frame')!;
const previewMarkdown = document.querySelector<HTMLPreElement>('#preview-markdown')!;
const heading1Mode = document.querySelector<HTMLSelectElement>('#heading1-mode')!;
const heading2Mode = document.querySelector<HTMLSelectElement>('#heading2-mode')!;
const heading3Mode = document.querySelector<HTMLSelectElement>('#heading3-mode')!;
const heading4Mode = document.querySelector<HTMLSelectElement>('#heading4-mode')!;
const previewButton = document.querySelector<HTMLButtonElement>('#preview-button')!;
const submitButton = document.querySelector<HTMLButtonElement>('#submit-button')!;
const progressShell = document.querySelector<HTMLDivElement>('#progress-shell')!;
const progressBar = document.querySelector<HTMLDivElement>('#progress-bar')!;
const statusSpinner = document.querySelector<HTMLSpanElement>('#status-spinner')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;

if (outputRadioElements.length === 0) {
  throw new Error('No se ha podido inicializar la interfaz.');
}

let selectedFile: File | null = null;
let selectedKind: InputKind | null = null;
let selectedElpxPages = new Set<string>();
let availableElpxPages: ElpxPageInfo[] = [];
let pageInspectionSequence = 0;
let preparedConversion: PreparedConversion | null = null;
let previewVirtualPages: Record<string, string> | null = null;
let previewCurrentPath = 'index.html';
const idlePreviewLabel = 'Previsualizar';
const idleSaveLabel = 'Guardar archivo';

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

previewButton.addEventListener('click', async () => {
  if (!selectedFile || !selectedKind) {
    setStatus('Selecciona antes un archivo compatible.');
    return;
  }

  setBusyState(true);
  try {
    preparedConversion = await prepareCurrentConversion(selectedFile, selectedKind);
    renderPreview(preparedConversion);
    setStatus('Vista previa generada. Si te convence, pulsa Guardar archivo.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Error: ${message}`, true);
  } finally {
    setBusyState(false);
    syncActionButtons();
  }
});

form.addEventListener('submit', async event => {
  event.preventDefault();

  if (!selectedFile || !selectedKind) {
    setStatus('Selecciona antes un archivo compatible.');
    return;
  }

  const currentSignature = computeConversionSignature();
  if (!preparedConversion || preparedConversion.signature !== currentSignature) {
    setStatus('Primero genera la vista previa con la configuración actual.', true);
    syncActionButtons();
    return;
  }

  try {
    const saveTarget = await prepareSaveTargetForKind(selectedFile.name, preparedConversion.kind);
    const savedWithDialog = await saveBlobToTarget(preparedConversion.blob, preparedConversion.filename, saveTarget);

    if (preparedConversion.kind === 'elpx') {
      const sourceName = selectedKind === 'docx' ? 'Importación DOCX' : 'Importación Markdown';
      setStatus(
        savedWithDialog
          ? `${sourceName} completada. Se han creado ${preparedConversion.pageCount} páginas y ${preparedConversion.blockCount || 0} iDevices.`
          : `${sourceName} completada. Se han creado ${preparedConversion.pageCount} páginas y ${preparedConversion.blockCount || 0} iDevices con descarga estándar.`,
      );
      return;
    }

    const formatLabel = preparedConversion.kind === 'markdown' ? 'Markdown' : 'DOCX';
    setStatus(
      savedWithDialog
        ? `Conversión a ${formatLabel} completada. Se han procesado ${preparedConversion.pageCount} páginas.`
        : `Conversión a ${formatLabel} completada. Se han procesado ${preparedConversion.pageCount} páginas y se ha usado la descarga estándar.`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Error: ${message}`, true);
  }
});

function handleSelectedFile(file: File | null): void {
  selectedFile = file;

  if (!file) {
    selectedKind = null;
    fileInput.value = '';
    fileNameElement.textContent = 'Ningún archivo seleccionado.';
    resetDetectedOptions();
    clearPageSelectionState();
    clearPreview();
    setStatus('Carga un archivo para que la aplicación detecte automáticamente la conversión disponible.');
    return;
  }

  const kind = detectInputKind(file.name);
  fileNameElement.textContent = file.name;

  if (!kind) {
    selectedKind = null;
    resetDetectedOptions();
    clearPageSelectionState();
    clearPreview();
    setStatus('Formato no compatible. Usa un archivo .elpx, .docx o .md.', true);
    return;
  }

  selectedKind = kind;
  applyDetectedOptions(kind);
  syncActionButtons();
}

function detectInputKind(filename: string): InputKind | null {
  const lowerName = filename.toLowerCase();

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
  outputField.hidden = kind !== 'elpx';
  pageSelectionField.hidden = kind !== 'elpx';
  structureField.hidden = kind === 'elpx';

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
  markdownImagesField.hidden = true;
  previewButton.disabled = true;
  submitButton.disabled = true;
}

function syncDetectedMessage(): void {
  if (!selectedKind) {
    detectedField.hidden = true;
    return;
  }

  detectedField.hidden = false;

  if (selectedKind === 'docx') {
    detectedHelp.innerHTML = 'Se importará el archivo <code>.docx</code> para generar un proyecto <code>.elpx</code>.';
    setStatus('Archivo DOCX detectado. Revisa la estructura de páginas y pulsa convertir.');
    return;
  }

  if (selectedKind === 'markdown') {
    detectedHelp.innerHTML = 'Se importará el archivo <code>.md</code> para generar un proyecto <code>.elpx</code>.';
    setStatus('Archivo Markdown detectado. Revisa la estructura de páginas y pulsa convertir.');
    return;
  }

  const outputKind = getSelectedElpxOutputKind();
  detectedHelp.innerHTML =
    outputKind === 'markdown'
      ? 'Se exportará el archivo <code>.elpx</code> a <code>.md</code>.'
      : 'Se exportará el archivo <code>.elpx</code> a <code>.docx</code>.';
  setStatus('Archivo ELPX detectado. Elige formato y páginas, y pulsa convertir.');
}

function syncStructureControls(): void {
  if (selectedKind !== 'docx' && selectedKind !== 'markdown') {
    structureField.hidden = true;
    return;
  }

  const heading1UsesResourceTitle = heading1Mode.value === 'resource';
  if (heading1UsesResourceTitle) {
    setForcedPageSelectState(heading2Mode, 'Página (obligatorio)');
  } else {
    setDependentSelectState(heading2Mode, true, 'iDevice de texto');
  }

  const heading2UsesPages = heading1UsesResourceTitle || heading2Mode.value === 'page';
  setDependentSelectState(heading3Mode, heading2UsesPages, 'Subtítulo dentro del iDevice actual');

  const heading3UsesPages = heading2UsesPages && heading3Mode.value === 'page';
  setDependentSelectState(heading4Mode, heading3UsesPages, 'Subtítulo dentro del iDevice actual');
}

function syncOutputControls(): void {
  const showMarkdownOptions = selectedKind === 'elpx' && getSelectedElpxOutputKind() === 'markdown';
  markdownImagesField.hidden = !showMarkdownOptions;
}

function getSelectedElpxOutputKind(): ElpxOutputKind {
  const checked = Array.from(outputRadioElements).find(radio => radio.checked);
  return checked?.value === 'markdown' ? 'markdown' : 'docx';
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
    <option value="block">iDevice de texto</option>
    <option value="page">Subpágina</option>
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
  setButtonLabel(previewButton, isBusy ? 'Trabajando...' : idlePreviewLabel);
  setButtonLabel(submitButton, isBusy ? 'Trabajando...' : idleSaveLabel);
  previewButton.disabled = isBusy;
  submitButton.disabled = isBusy;
  statusSpinner.hidden = !isBusy;
  progressShell.hidden = !isBusy;

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

function setProgress(percent: number): void {
  progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
}

async function prepareSaveTarget(options: {
  inputFilename: string;
  description: string;
  mime: string;
  extension: '.docx' | '.elpx' | '.md';
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
      throw new Error('Guardado cancelado por el usuario.');
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

function toOutputFilename(inputFilename: string, extension: '.docx' | '.elpx' | '.md'): string {
  const stem = inputFilename.replace(/\.[^.]+$/, '') || 'documento';
  return `${stem}${extension}`;
}

function syncActionButtons(): void {
  const hasFile = selectedFile !== null && selectedKind !== null;
  previewButton.hidden = !hasFile;
  previewButton.disabled = !hasFile;
  const currentSignature = computeConversionSignature();
  const canSave = Boolean(hasFile && preparedConversion && preparedConversion.signature === currentSignature);
  submitButton.hidden = !canSave;
  submitButton.disabled = !canSave;
  previewPopoutButton.hidden = !canSave;
}

function invalidatePreparedConversion(): void {
  preparedConversion = null;
  syncActionButtons();
}

function clearPreview(): void {
  previewField.hidden = true;
  previewPopoutButton.hidden = true;
  previewVirtualPages = null;
  previewCurrentPath = 'index.html';
  previewFrame.removeAttribute('srcdoc');
  previewFrame.removeAttribute('src');
  previewMarkdown.hidden = true;
  previewMarkdown.textContent = '';
  invalidatePreparedConversion();
}

async function inspectSelectedElpxPages(file: File): Promise<void> {
  const inspectionId = ++pageInspectionSequence;
  setStatus('Leyendo estructura de páginas del ELPX...');
  pageSelectionList.innerHTML = '';
  pageSelectionHelp.textContent = 'Cargando páginas...';

  try {
    const pages = await inspectElpxPages(file);
    if (inspectionId !== pageInspectionSequence) {
      return;
    }

    availableElpxPages = pages;
    selectedElpxPages = new Set(pages.map(page => page.id));
    renderPageSelectionList();
    invalidatePreparedConversion();
  } catch {
    if (inspectionId !== pageInspectionSequence) {
      return;
    }

    availableElpxPages = [];
    selectedElpxPages.clear();
    pageSelectionList.innerHTML = '';
    pageSelectionHelp.textContent = 'No se ha podido leer la estructura de páginas. Se exportará todo el contenido.';
  } finally {
    if (inspectionId === pageInspectionSequence) {
      syncDetectedMessage();
    }
  }
}

function renderPageSelectionList(): void {
  if (availableElpxPages.length === 0) {
    pageSelectionList.innerHTML = '';
    pageSelectionHelp.textContent = 'No se han detectado páginas seleccionables. Se exportará todo el contenido.';
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
  pageSelectionHelp.innerHTML = `${selectedCount} de ${availableElpxPages.length} páginas seleccionadas. Modo jerárquico normalizado: si falta una página padre seleccionada, sus hijas pasan a raíz.`;
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
  pageSelectionHelp.textContent = 'Modo jerárquico normalizado: si falta una página padre seleccionada, sus hijas pasan a raíz.';
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
  const outputPart = getSelectedElpxOutputKind();
  const headingsPart = `${heading1Mode.value}|${heading2Mode.value}|${heading3Mode.value}|${heading4Mode.value}`;
  const markdownPart = markdownImages.checked ? 'img:1' : 'img:0';
  const selectedPages = getSelectedElpxPageIds();
  const pagesPart = selectedPages ? selectedPages.slice().sort().join(',') : 'all';
  return [filePart, kindPart, outputPart, headingsPart, markdownPart, pagesPart].join('::');
}

async function prepareCurrentConversion(file: File, kind: InputKind): Promise<PreparedConversion> {
  const signature = computeConversionSignature();
  const selectedPageIds = getSelectedElpxPageIds();
  const selectedPageCount = selectedPageIds?.length ?? availableElpxPages.length;
  if (kind === 'elpx' && availableElpxPages.length > 0 && selectedPageCount === 0) {
    throw new Error('Selecciona al menos una página para exportar.');
  }

  if (kind === 'docx' || kind === 'markdown') {
    const importResult =
      kind === 'docx'
        ? await convertDocxToElpx(file, getHeadingOptions(), progress => {
            updateProgress(progress);
            setStatus(progress.message);
          })
        : await convertMarkdownToElpx(file, getHeadingOptions(), progress => {
            updateProgress(progress);
            setStatus(progress.message);
          });

    setStatus('Generando vista previa del ELPX...');
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

  const outputKind = getSelectedElpxOutputKind();
  if (outputKind === 'markdown') {
    const result = await convertElpxToMarkdown(
      file,
      { includeImages: markdownImages.checked, selectedPageIds },
      progress => {
        updateProgress(progress);
        setStatus(progress.message);
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

  const result = await convertElpxToDocx(
    file,
    { selectedPageIds },
    progress => {
      updateProgress(progress);
      setStatus(progress.message);
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
  previewPopoutButton.hidden = false;
  if (conversion.previewType === 'markdown') {
    previewVirtualPages = null;
    previewCurrentPath = 'index.html';
    previewFrame.removeAttribute('srcdoc');
    previewFrame.removeAttribute('src');
    previewFrame.hidden = true;
    previewMarkdown.hidden = false;
    previewMarkdown.textContent = conversion.previewContent;
    return;
  }

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

function openPreviewInWindow(conversion: PreparedConversion): void {
  const previewWindow = window.open('', '_blank', 'popup=yes,width=1100,height=760,resizable=yes,scrollbars=yes');
  if (!previewWindow) {
    setStatus('No se pudo abrir la ventana de vista previa (bloqueador de ventanas emergentes).', true);
    return;
  }

  const htmlContent = (() => {
    if (conversion.previewType === 'markdown') {
      return buildMarkdownPreviewDocument(conversion.previewContent, conversion.filename);
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
<html lang="es">
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
  <iframe id="preview-frame" title="Vista previa del ELPX"></iframe>
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

function buildMarkdownPreviewDocument(markdown: string, title: string): string {
  return `<!doctype html>
<html lang="es">
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

async function prepareSaveTargetForKind(inputFilename: string, kind: ConversionKind): Promise<PendingSaveTarget | null> {
  if (kind === 'elpx') {
    return prepareSaveTarget({
      inputFilename,
      description: 'Proyecto de eXeLearning',
      mime: 'application/zip',
      extension: '.elpx',
    });
  }

  if (kind === 'markdown') {
    return prepareSaveTarget({
      inputFilename,
      description: 'Documento Markdown',
      mime: 'text/markdown',
      extension: '.md',
    });
  }

  return prepareSaveTarget({
    inputFilename,
    description: 'Documento de Word',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: '.docx',
  });
}

syncActionButtons();
