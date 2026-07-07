<script>
  /**
   * FileUpload — area drag & drop per caricare un file XML.
   *
   * Props:
   *   onLoad: (xmlString: string, fileName: string) => void
   *   error: string | null
   *   hasFile: boolean
   */

  let { onLoad, error, hasFile } = $props();

  let isDragging = $state(false);
  let fileInput = $state(null);

  function handleDragOver(e) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(e) {
    e.preventDefault();
    isDragging = false;
  }

  function handleDrop(e) {
    e.preventDefault();
    isDragging = false;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }

  function handleFileSelect(e) {
    const files = e.target?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }

  function processFile(file) {
    if (!file.name.toLowerCase().endsWith('.xml')) {
      onLoad?.(null, file.name, 'Il file deve avere estensione .xml');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        onLoad?.(content, file.name, null);
      }
    };
    reader.onerror = () => {
      onLoad?.(null, file.name, 'Errore durante la lettura del file');
    };
    reader.readAsText(file);
  }

  function triggerFileInput() {
    fileInput?.click();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerFileInput();
    }
  }
</script>

<div
  class="dropzone"
  class:active={isDragging}
  class:has-file={hasFile}
  class:has-error={!!error}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  role="button"
  tabindex="0"
  aria-label="Carica un file XML tramite drag and drop o clicca per selezionarlo"
  onkeydown={handleKeyDown}
>
  <input
    type="file"
    accept=".xml,text/xml,application/xml"
    bind:this={fileInput}
    onchange={handleFileSelect}
    class="sr-only"
    id="file-input"
    aria-hidden="true"
  />

  <div class="dropzone-content">
    <svg class="upload-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
    <div class="dropzone-text">
      {#if hasFile}
        <span class="dropzone-label">File caricato</span>
        <span class="dropzone-hint">Trascina un altro file XML qui per sostituirlo</span>
      {:else}
        <span class="dropzone-label">Trascina qui il tuo file XML</span>
        <span class="dropzone-hint">oppure <button type="button" class="link-btn" onclick={triggerFileInput}>sfoglia i file</button></span>
      {/if}
    </div>
  </div>
</div>

{#if error}
  <div class="error-message" role="alert">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    <span>{error}</span>
  </div>
{/if}

<style>
  .dropzone {
    border: 2px dashed var(--border);
    border-radius: 8px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: border-color 200ms ease, background-color 200ms ease;
    background: var(--surface);
    outline: none;
  }

  .dropzone:focus-visible {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-alpha);
  }

  .dropzone.active {
    border-color: var(--primary);
    background: var(--primary-alpha);
  }

  .dropzone.has-file {
    border-style: solid;
    border-color: var(--success);
    background: var(--success-alpha);
  }

  .dropzone.has-error {
    border-color: var(--accent);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .dropzone-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .upload-icon {
    color: var(--primary);
    opacity: 0.7;
  }

  .dropzone-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .dropzone-label {
    font-weight: 600;
    color: var(--text);
    font-size: 0.9375rem;
  }

  .dropzone-hint {
    font-size: 0.8125rem;
    color: var(--text-secondary);
  }

  .link-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--primary);
    font: inherit;
    font-size: 0.8125rem;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .link-btn:hover {
    color: var(--primary-dark);
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    padding: 10px 14px;
    background: var(--error-bg);
    border: 1px solid var(--accent);
    border-radius: 6px;
    color: var(--accent-dark);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .error-message svg {
    flex-shrink: 0;
  }
</style>
