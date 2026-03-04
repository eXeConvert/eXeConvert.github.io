import './style.css';
import { convertElpxToDocx, type ConvertProgress } from './converter';
import { convertDocxToElpx, type DocxImportProgress, type HeadingMode } from './docx-import';
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

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('No se ha encontrado el contenedor principal.');
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
            <button id="pick-button" type="button">Abrir archivo</button>
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
                <td>Página</td>
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
          <button id="submit-button" type="submit" disabled>Convertir y guardar</button>
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
    </section>

    <footer class="app-footer">
      <p class="app-footer-meta">
        Versión beta · v0.1.0-beta.1 · ©
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
const outputRadioElements = document.querySelectorAll<HTMLInputElement>('input[name="elpx-output"]');
const structureField = document.querySelector<HTMLDivElement>('#structure-field')!;
const markdownImagesField = document.querySelector<HTMLDivElement>('#markdown-images-field')!;
const markdownImages = document.querySelector<HTMLInputElement>('#markdown-images')!;
const heading2Mode = document.querySelector<HTMLSelectElement>('#heading2-mode')!;
const heading3Mode = document.querySelector<HTMLSelectElement>('#heading3-mode')!;
const heading4Mode = document.querySelector<HTMLSelectElement>('#heading4-mode')!;
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
const idleButtonLabel = 'Convertir y guardar';

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

heading2Mode.addEventListener('change', () => {
  syncStructureControls();
});

heading3Mode.addEventListener('change', () => {
  syncStructureControls();
});

for (const radio of outputRadioElements) {
  radio.addEventListener('change', () => {
    syncOutputControls();
    syncDetectedMessage();
  });
}

form.addEventListener('submit', async event => {
  event.preventDefault();

  if (!selectedFile || !selectedKind) {
    setStatus('Selecciona antes un archivo compatible.');
    return;
  }

  setBusyState(true);
  submitButton.disabled = true;

  try {
    if (selectedKind === 'docx' || selectedKind === 'markdown') {
      const saveTarget = await prepareSaveTarget({
        inputFilename: selectedFile.name,
        description: 'Proyecto de eXeLearning',
        mime: 'application/zip',
        extension: '.elpx',
      });

      const result =
        selectedKind === 'docx'
          ? await convertDocxToElpx(selectedFile, getHeadingOptions(), progress => {
              updateProgress(progress);
              setStatus(progress.message);
            })
          : await convertMarkdownToElpx(selectedFile, getHeadingOptions(), progress => {
              updateProgress(progress);
              setStatus(progress.message);
            });

      const savedWithDialog = await saveBlobToTarget(result.blob, result.filename, saveTarget);
      const sourceName = selectedKind === 'docx' ? 'Importación DOCX' : 'Importación Markdown';
      setStatus(
        savedWithDialog
          ? `${sourceName} completada. Se han creado ${result.pageCount} páginas y ${result.blockCount} iDevices.`
          : `${sourceName} completada. Se han creado ${result.pageCount} páginas y ${result.blockCount} iDevices con descarga estándar.`,
      );
      return;
    }

    const outputKind = getSelectedElpxOutputKind();

    if (outputKind === 'markdown') {
      const saveTarget = await prepareSaveTarget({
        inputFilename: selectedFile.name,
        description: 'Documento Markdown',
        mime: 'text/markdown',
        extension: '.md',
      });

      const result = await convertElpxToMarkdown(
        selectedFile,
        { includeImages: markdownImages.checked },
        progress => {
          updateProgress(progress);
          setStatus(progress.message);
        },
      );

      const savedWithDialog = await saveBlobToTarget(result.blob, result.filename, saveTarget);
      setStatus(
        savedWithDialog
          ? `Conversión completada. Se han procesado ${result.pageCount} páginas.`
          : `Conversión completada. Se han procesado ${result.pageCount} páginas y se ha usado la descarga estándar.`,
      );
      return;
    }

    const saveTarget = await prepareSaveTarget({
      inputFilename: selectedFile.name,
      description: 'Documento de Word',
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: '.docx',
    });

    const result = await convertElpxToDocx(selectedFile, progress => {
      updateProgress(progress);
      setStatus(progress.message);
    });

    const savedWithDialog = await saveBlobToTarget(result.blob, result.filename, saveTarget);
    setStatus(
      savedWithDialog
        ? `Conversión completada. Se han procesado ${result.pageCount} páginas.`
        : `Conversión completada. Se han procesado ${result.pageCount} páginas y se ha usado la descarga estándar.`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Error: ${message}`, true);
  } finally {
    setBusyState(false);
    submitButton.disabled = selectedFile === null;
  }
});

function handleSelectedFile(file: File | null): void {
  selectedFile = file;

  if (!file) {
    selectedKind = null;
    fileInput.value = '';
    fileNameElement.textContent = 'Ningún archivo seleccionado.';
    resetDetectedOptions();
    setStatus('Carga un archivo para que la aplicación detecte automáticamente la conversión disponible.');
    return;
  }

  const kind = detectInputKind(file.name);
  fileNameElement.textContent = file.name;

  if (!kind) {
    selectedKind = null;
    resetDetectedOptions();
    setStatus('Formato no compatible. Usa un archivo .elpx, .docx o .md.', true);
    return;
  }

  selectedKind = kind;
  submitButton.disabled = false;
  applyDetectedOptions(kind);
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
  structureField.hidden = kind === 'elpx';

  if (kind !== 'elpx') {
    syncStructureControls();
  }

  syncOutputControls();
  syncDetectedMessage();
}

function resetDetectedOptions(): void {
  detectedField.hidden = true;
  outputField.hidden = true;
  structureField.hidden = true;
  markdownImagesField.hidden = true;
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
  setStatus('Archivo ELPX detectado. Elige el formato de salida y pulsa convertir.');
}

function syncStructureControls(): void {
  if (selectedKind !== 'docx' && selectedKind !== 'markdown') {
    structureField.hidden = true;
    return;
  }

  const heading2UsesPages = heading2Mode.value === 'page';
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
  heading2Mode: HeadingMode;
  heading3Mode: HeadingMode;
  heading4Mode: HeadingMode;
} {
  return {
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

function setStatus(message: string, isError = false): void {
  status.textContent = message;
  status.dataset.state = isError ? 'error' : 'idle';
}

function setBusyState(isBusy: boolean): void {
  submitButton.classList.toggle('is-loading', isBusy);
  submitButton.textContent = isBusy ? 'Trabajando...' : idleButtonLabel;
  statusSpinner.hidden = !isBusy;
  progressShell.hidden = !isBusy;

  if (isBusy) {
    setProgress(8);
  } else {
    setProgress(0);
  }
}

function updateProgress(progress: ConvertProgress | DocxImportProgress): void {
  const phasePercent: Record<ConvertProgress['phase'] | DocxImportProgress['phase'], number> = {
    read: 14,
    parse: 32,
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
