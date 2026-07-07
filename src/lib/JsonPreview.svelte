<script>
  /**
   * JsonPreview — anteprima live del JSON generato con syntax highlighting.
   *
   * Props:
   *   jsonString: string
   *   onDownload: () => void
   *   hasData: boolean
   */

  let { jsonString, onDownload, hasData } = $props();

  let highlightedHtml = $derived(highlightJson(jsonString));

  /**
   * Syntax highlighting manuale per JSON.
   * Restituisce HTML con span colorati.
   */
  function highlightJson(str) {
    if (!str) return '';

    // Escape HTML entities
    const escaped = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Tokenizer: riconosce stringhe, numeri, booleani, null, chiavi, punteggiatura
    let result = '';
    let i = 0;
    const len = escaped.length;

    while (i < len) {
      // Stringhe (tra virgolette doppie)
      if (escaped[i] === '"') {
        let j = i + 1;
        while (j < len) {
          if (escaped[j] === '\\') {
            j += 2; // salta carattere escaped
            continue;
          }
          if (escaped[j] === '"') {
            j++;
            break;
          }
          j++;
        }
        const token = escaped.substring(i, j);

        // Determinare se è una chiave (seguita da ":") o un valore stringa
        // Guarda avanti per ":"
        let after = '';
        let k = j;
        while (k < len && (escaped[k] === ' ' || escaped[k] === '\n' || escaped[k] === '\t' || escaped[k] === '\r')) {
          after += escaped[k];
          k++;
        }
        if (escaped[k] === ':') {
          result += `<span class="json-key">${token}</span>`;
        } else {
          result += `<span class="json-string">${token}</span>`;
        }

        i = j;
        continue;
      }

      // Numeri
      if (/[-0-9]/.test(escaped[i]) && (i === 0 || /[\s,\[\{:]/.test(escaped[i - 1]))) {
        let j = i;
        while (j < len && /[0-9.eE+\-]/.test(escaped[j])) {
          j++;
        }
        const token = escaped.substring(i, j);
        if (/^-?\d+(\.\d+)?([eE][+\-]?\d+)?$/.test(token)) {
          result += `<span class="json-number">${token}</span>`;
          i = j;
          continue;
        }
      }

      // Booleani e null
      if (escaped.substring(i, i + 4) === 'true') {
        result += `<span class="json-boolean">true</span>`;
        i += 4;
        continue;
      }
      if (escaped.substring(i, i + 5) === 'false') {
        result += `<span class="json-boolean">false</span>`;
        i += 5;
        continue;
      }
      if (escaped.substring(i, i + 4) === 'null') {
        result += `<span class="json-null">null</span>`;
        i += 4;
        continue;
      }

      // Carattere normale (punteggiatura, whitespace)
      result += escaped[i];
      i++;
    }

    return result;
  }
</script>

<div class="json-preview">
  <div class="json-header">
    <div class="json-title-group">
      <h2 class="json-title">Anteprima JSON</h2>
      <span class="json-badge">live</span>
    </div>
    <button
      type="button"
      class="download-btn"
      onclick={onDownload}
      disabled={!hasData}
      aria-label="Scarica il file JSON generato"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      <span>Scarica JSON</span>
    </button>
  </div>

  <div class="json-body">
    {#if hasData && jsonString}
      <pre class="json-code" aria-label="Anteprima del JSON generato"><code>{@html highlightedHtml}</code></pre>
    {:else}
      <p class="json-placeholder">
        Carica un file XML e seleziona i nodi per vedere l'anteprima del JSON.
      </p>
    {/if}
  </div>
</div>

<style>
  .json-preview {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .json-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    background: var(--surface-alt);
  }

  .json-title-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .json-title {
    font-family: var(--font-display);
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }

  .json-badge {
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 2px 8px;
    border-radius: 10px;
    background: var(--success-alpha);
    color: var(--success);
  }

  .download-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 16px;
    border: none;
    border-radius: 6px;
    background: var(--primary);
    color: #fff;
    cursor: pointer;
    font-size: 0.8125rem;
    font-weight: 600;
    transition: all 150ms ease;
    min-height: 36px;
    white-space: nowrap;
  }

  .download-btn:hover {
    background: var(--primary-dark);
  }

  .download-btn:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .download-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .json-body {
    padding: 12px;
    max-height: 55vh;
    overflow: auto;
  }

  .json-code {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    line-height: 1.7;
    color: var(--text);
    white-space: pre;
    tab-size: 2;
  }

  .json-placeholder {
    padding: 32px 16px;
    text-align: center;
    color: var(--text-tertiary);
    font-size: 0.875rem;
    margin: 0;
  }

  /* Syntax highlighting colors */
  :global(.json-key) {
    color: var(--primary);
    font-weight: 500;
  }

  :global(.json-string) {
    color: var(--success);
  }

  :global(.json-number) {
    color: var(--tertiary);
  }

  :global(.json-boolean) {
    color: var(--accent);
    font-weight: 600;
  }

  :global(.json-null) {
    color: var(--text-tertiary);
    font-style: italic;
  }
</style>
