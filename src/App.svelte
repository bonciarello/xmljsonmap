<script>
  /**
   * App — Convertitore XML → JSON con mappatura personalizzata dei nodi.
   */

  import FileUpload from './lib/FileUpload.svelte';
  import TreeView from './lib/TreeView.svelte';
  import JsonPreview from './lib/JsonPreview.svelte';
  import { createTreeStore } from './lib/treeStore.svelte.js';
  import { generateJsonString } from './lib/jsonGenerator.js';

  const store = createTreeStore();

  let jsonOutput = $derived(
    store.xmlLoaded ? generateJsonString(store.root) : ''
  );

  let hasData = $derived(!!jsonOutput && jsonOutput !== '{}');

  function handleFileLoad(xmlString, fileName, fileError) {
    if (fileError) {
      store.reset();
      store.error = fileError;
      store.fileName = fileName;
      return;
    }
    store.loadXml(xmlString, fileName);
  }

  function downloadJson() {
    if (!jsonOutput) return;
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = store.fileName.replace(/\.xml$/i, '') || 'output';
    a.download = `${baseName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<div class="app">
  <header class="app-header">
    <div class="brand">
      <div class="brand-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div>
      <div class="brand-text">
        <h1 class="brand-title">Trasmuta<span class="brand-accent">XML</span></h1>
        <p class="brand-subtitle">Converti XML in JSON con mappatura personalizzata</p>
      </div>
    </div>
  </header>

  <main class="app-main">
    <!-- Step 1: Upload -->
    <section class="section upload-section" aria-label="Carica file XML">
      <div class="section-eyebrow">Passo 1</div>
      <FileUpload
        onLoad={handleFileLoad}
        error={store.error}
        hasFile={store.xmlLoaded}
      />
    </section>

    {#if store.xmlLoaded}
      <!-- Step 2: Mappa i nodi -->
      <section class="section tree-section" aria-label="Mappa la struttura">
        <div class="section-eyebrow">Passo 2 — Seleziona i nodi e personalizza le chiavi</div>
        <TreeView
          root={store.root}
          onToggle={(id) => store.toggleNode(id)}
          onRename={(id, key) => store.renameKey(id, key)}
          onSelectAll={() => store.selectAll()}
          onDeselectAll={() => store.deselectAll()}
          customKeyMap={store.customKeyMap}
          fileName={store.fileName}
        />
      </section>

      <!-- Step 3: Preview e download -->
      <section class="section json-section" aria-label="Anteprima e download JSON">
        <div class="section-eyebrow">Passo 3 — Anteprima e scarica</div>
        <JsonPreview
          jsonString={jsonOutput}
          onDownload={downloadJson}
          hasData={hasData}
        />
      </section>
    {/if}
  </main>

  <footer class="app-footer">
    <p>TrasmutaXML — Convertitore XML → JSON. Carica, seleziona, rinomina, scarica.</p>
  </footer>
</div>

<style>
  .app {
    max-width: 960px;
    margin: 0 auto;
    padding: 16px 20px 32px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .app-header {
    padding: 8px 0 16px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 16px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brand-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: var(--primary);
    color: #fff;
    flex-shrink: 0;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
  }

  .brand-title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
    margin: 0;
    line-height: 1.2;
    letter-spacing: -0.01em;
  }

  .brand-accent {
    color: var(--primary);
  }

  .brand-subtitle {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--text-secondary);
    font-weight: 400;
  }

  .app-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-eyebrow {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-tertiary);
  }

  .upload-section .section-eyebrow {
    margin-bottom: 4px;
  }

  .app-footer {
    margin-top: auto;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    text-align: center;
  }

  .app-footer p {
    margin: 0;
    font-size: 0.75rem;
    color: var(--text-tertiary);
  }

  @media (max-width: 600px) {
    .app {
      padding: 12px 12px 24px;
    }

    .brand-title {
      font-size: 1.25rem;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
    }
  }
</style>
