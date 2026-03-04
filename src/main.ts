import './style.css';
import { convertElpxToDocx } from './converter';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('No se ha encontrado el contenedor principal.');
}

app.innerHTML = `
  <main class="shell">
    <section class="hero">
      <p class="eyebrow">eXeLearning 4 · prototipo</p>
      <h1>ELPX a DOCX en el navegador</h1>
      <p class="lede">
        Esta versión trabaja completamente en cliente: abre un <code>.elpx</code>, reconstruye una versión de página única
        y descarga un <code>.docx</code> sin backend.
      </p>
    </section>

    <section class="panel">
      <form id="convert-form" class="form">
        <label class="field">
          <span>Archivo <code>.elpx</code></span>
          <input id="file-input" type="file" accept=".elpx,.zip" required />
        </label>

        <div class="actions">
          <button id="submit-button" type="submit">Convertir y descargar</button>
        </div>
      </form>

      <p id="status" class="status" aria-live="polite">Listo para convertir.</p>

      <details class="notes">
        <summary>Limitaciones actuales</summary>
        <ul>
          <li>Esta primera versión se centra en ELPX modernos con <code>content.xml</code>.</li>
          <li>El resultado prioriza texto, listas, tablas e imágenes incrustadas.</li>
          <li>Los elementos interactivos se simplifican para que el DOCX sea estable.</li>
        </ul>
      </details>
    </section>
  </main>
`;

const formElement = document.querySelector<HTMLFormElement>('#convert-form');
const fileInputElement = document.querySelector<HTMLInputElement>('#file-input');
const submitButtonElement = document.querySelector<HTMLButtonElement>('#submit-button');
const statusElement = document.querySelector<HTMLParagraphElement>('#status');

if (!formElement || !fileInputElement || !submitButtonElement || !statusElement) {
  throw new Error('No se ha podido inicializar la interfaz.');
}

const form = formElement;
const fileInput = fileInputElement;
const submitButton = submitButtonElement;
const status = statusElement;

form.addEventListener('submit', async event => {
  event.preventDefault();

  const file = fileInput.files?.[0];
  if (!file) {
    setStatus('Selecciona antes un archivo .elpx.');
    return;
  }

  submitButton.disabled = true;

  try {
    const result = await convertElpxToDocx(file, progress => {
      setStatus(progress.message);
    });

    downloadBlob(result.blob, result.filename);
    setStatus(`Conversión completada. Se han procesado ${result.pageCount} páginas.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Error: ${message}`, true);
  } finally {
    submitButton.disabled = false;
  }
});

function setStatus(message: string, isError = false): void {
  status.textContent = message;
  status.dataset.state = isError ? 'error' : 'idle';
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
