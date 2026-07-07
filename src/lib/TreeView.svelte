<script>
  /**
   * TreeView — visualizzazione ad albero interattiva dell'XML.
   *
   * Props:
   *   root: object | null — nodo radice
   *   onToggle: (id: number) => void
   *   onRename: (id: number, newKey: string) => void
   *   onSelectAll: () => void
   *   onDeselectAll: () => void
   *   customKeyMap: Record<number, string>
   *   fileName: string
   */

  import TreeNode from './TreeNode.svelte';

  let { root, onToggle, onRename, onSelectAll, onDeselectAll, customKeyMap, fileName } = $props();

  let collapseAll = $state(false);

  function handleCollapseAll() {
    collapseAll = !collapseAll;
  }
</script>

<div class="tree-view">
  <div class="tree-header">
    <div class="tree-title-group">
      <h2 class="tree-title">Struttura XML</h2>
      {#if fileName}
        <span class="file-badge">{fileName}</span>
      {/if}
    </div>
    <div class="tree-actions">
      <button type="button" class="action-btn" onclick={onSelectAll} title="Seleziona tutti i nodi">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        <span>Seleziona tutti</span>
      </button>
      <button type="button" class="action-btn" onclick={onDeselectAll} title="Deseleziona tutti i nodi">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        </svg>
        <span>Deseleziona tutti</span>
      </button>
      <button type="button" class="action-btn" onclick={handleCollapseAll} title="Comprimi/Espandi tutti i nodi">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span>{collapseAll ? 'Espandi' : 'Comprimi'}</span>
      </button>
    </div>
  </div>

  <div class="tree-body" role="tree" aria-label="Struttura ad albero del documento XML">
    {#if root}
      <TreeNode
        node={root}
        {onToggle}
        {onRename}
        {customKeyMap}
      />
    {:else}
      <p class="tree-placeholder">
        Carica un file XML per visualizzarne la struttura.
      </p>
    {/if}
  </div>
</div>

<style>
  .tree-view {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .tree-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    background: var(--surface-alt);
  }

  .tree-title-group {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .tree-title {
    font-family: var(--font-display);
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text);
    margin: 0;
    white-space: nowrap;
  }

  .file-badge {
    font-size: 0.6875rem;
    font-family: var(--font-mono);
    padding: 2px 8px;
    background: var(--primary-alpha);
    color: var(--primary);
    border-radius: 10px;
    font-weight: 600;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tree-actions {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border: 1px solid var(--border);
    border-radius: 5px;
    background: var(--surface);
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-secondary);
    transition: all 150ms ease;
    min-height: 32px;
    white-space: nowrap;
  }

  .action-btn:hover {
    border-color: var(--border-dark);
    color: var(--text);
    background: var(--surface-alt);
  }

  .action-btn:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 1px;
  }

  .tree-body {
    padding: 4px;
    max-height: 50vh;
    overflow-y: auto;
    overflow-x: auto;
  }

  .tree-placeholder {
    padding: 32px 16px;
    text-align: center;
    color: var(--text-tertiary);
    font-size: 0.875rem;
    margin: 0;
  }

  @media (max-width: 600px) {
    .tree-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .action-btn span {
      display: none;
    }

    .action-btn {
      padding: 6px;
    }
  }
</style>
