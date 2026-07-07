<script>
  /**
   * TreeNode — singolo nodo nell'albero interattivo.
   * Ricorsivo: ogni TreeNode può contenere altri TreeNode figli.
   *
   * Props:
   *   node: object — il nodo da renderizzare
   *   onToggle: (id: number) => void
   *   onRename: (id: number, newKey: string) => void
   *   customKeyMap: Record<number, string>
   */

  import TreeNode from './TreeNode.svelte';

  let { node, onToggle, onRename, customKeyMap } = $props();

  let isExpanded = $state(true);
  let isEditing = $state(false);
  let editValue = $state('');
  let editInput = $state(null);

  function handleToggle() {
    onToggle?.(node.id);
  }

  function handleExpandToggle() {
    isExpanded = !isExpanded;
  }

  // Per i nodi attributo, non mostrare il toggle di espansione
  let hasChildren = $derived(node.children && node.children.length > 0);
  // Nodo selezionabile solo se non è un attributo o testo (quelli seguono il genitore)
  let isSelectable = $derived(!node.isAttribute && node.type !== 'text');

  let displayName = $derived(
    node.isAttribute ? node.name.replace('@', '') : node.name
  );

  let nodeLabel = $derived(
    node.type === 'text'
      ? `"${node.value?.substring(0, 40) || ''}${(node.value?.length || 0) > 40 ? '…' : ''}"`
      : node.type === 'attribute'
        ? `${displayName}="${node.value || ''}"`
        : node.value
          ? `${displayName}: "${node.value?.substring(0, 30) || ''}${(node.value?.length || 0) > 30 ? '…' : ''}"`
          : displayName
  );

  function startEditing() {
    if (node.isAttribute) return;
    editValue = customKeyMap?.[node.id] ?? node.customKey ?? node.name;
    isEditing = true;
    // Focus after render
    queueMicrotask(() => {
      editInput?.focus();
      editInput?.select();
    });
  }

  function commitEdit() {
    isEditing = false;
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== node.customKey) {
      onRename?.(node.id, trimmed);
    }
  }

  function handleEditKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      isEditing = false;
      editValue = customKeyMap?.[node.id] ?? node.customKey ?? node.name;
    }
  }

  function handleEditBlur() {
    commitEdit();
  }

  let currentCustomKey = $derived(customKeyMap?.[node.id] ?? node.customKey ?? node.name);
  let isRenamed = $derived(currentCustomKey !== node.name);
</script>

<div
  class="tree-node"
  style="padding-left: {node.depth * 20}px"
  role="treeitem"
  aria-expanded={hasChildren ? isExpanded : undefined}
  aria-selected={node.selected}
>
  <div class="node-row">
    <!-- Toggle espansione -->
    {#if hasChildren}
      <button
        type="button"
        class="expand-btn"
        onclick={handleExpandToggle}
        aria-label={isExpanded ? 'Comprimi' : 'Espandi'}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class:rotated={isExpanded}
        >
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>
    {:else}
      <span class="expand-spacer"></span>
    {/if}

    <!-- Checkbox -->
    <label class="checkbox-wrapper" class:disabled={!isSelectable}>
      <input
        type="checkbox"
        checked={node.selected}
        disabled={!isSelectable}
        onchange={handleToggle}
      />
      <span class="checkmark"></span>
    </label>

    <!-- Tipo badge -->
    <span class="type-badge" class:attr={node.isAttribute} class:text={node.type === 'text'}>
      {node.isAttribute ? 'attr' : node.type === 'text' ? 'txt' : 'elem'}
    </span>

    <!-- Nome nodo / etichetta -->
    <span class="node-name" class:is-attribute={node.isAttribute} class:is-text={node.type === 'text'}>
      {nodeLabel}
    </span>

    <!-- Campo rinomina chiave JSON -->
    {#if !node.isAttribute && node.type !== 'text'}
      <div class="rename-group">
        <span class="rename-arrow" aria-hidden="true">→</span>
        {#if isEditing}
          <input
            type="text"
            class="rename-input editing"
            bind:value={editValue}
            bind:this={editInput}
            onkeydown={handleEditKeydown}
            onblur={handleEditBlur}
            aria-label="Rinomina chiave JSON per {node.name}"
            maxlength="60"
          />
        {:else}
          <button
            type="button"
            class="rename-key"
            class:renamed={isRenamed}
            onclick={startEditing}
            title="Clicca per rinominare la chiave JSON"
            aria-label="Chiave JSON: {currentCustomKey}. Clicca per rinominare."
          >
            <span class="key-text">{currentCustomKey}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Figli -->
  {#if hasChildren && isExpanded}
    <div class="node-children" role="group">
      {#each node.children as child (child.id)}
        <TreeNode
          node={child}
          {onToggle}
          {onRename}
          {customKeyMap}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .tree-node {
    user-select: none;
  }

  .node-row {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 3px 8px;
    border-radius: 4px;
    min-height: 34px;
    transition: background-color 120ms ease;
  }

  .node-row:hover {
    background: var(--surface-alt);
  }

  .expand-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--text-secondary);
    flex-shrink: 0;
    border-radius: 3px;
    transition: color 150ms ease;
  }

  .expand-btn:hover {
    color: var(--text);
  }

  .expand-btn:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 1px;
  }

  .expand-btn svg {
    transition: transform 200ms ease;
  }

  .expand-btn svg.rotated {
    transform: rotate(90deg);
  }

  .expand-spacer {
    width: 20px;
    flex-shrink: 0;
  }

  .checkbox-wrapper {
    display: flex;
    align-items: center;
    position: relative;
    width: 20px;
    height: 20px;
    margin-right: 6px;
    flex-shrink: 0;
    cursor: pointer;
  }

  .checkbox-wrapper.disabled {
    opacity: 0.4;
    cursor: default;
  }

  .checkbox-wrapper input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: inherit;
  }

  .checkmark {
    width: 16px;
    height: 16px;
    border: 2px solid var(--border-dark);
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 150ms ease;
    flex-shrink: 0;
  }

  .checkbox-wrapper input:checked + .checkmark {
    background: var(--primary);
    border-color: var(--primary);
  }

  .checkbox-wrapper input:checked + .checkmark::after {
    content: '';
    width: 5px;
    height: 8px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    margin-top: -2px;
  }

  .checkbox-wrapper input:focus-visible + .checkmark {
    box-shadow: 0 0 0 3px var(--primary-alpha);
  }

  .checkbox-wrapper:not(.disabled) input:hover + .checkmark {
    border-color: var(--primary);
  }

  .type-badge {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 1px 5px;
    border-radius: 3px;
    background: var(--secondary-alpha);
    color: var(--secondary);
    margin-right: 6px;
    flex-shrink: 0;
    line-height: 1.4;
  }

  .type-badge.attr {
    background: var(--accent-alpha);
    color: var(--accent-dark);
  }

  .type-badge.text {
    background: var(--success-alpha);
    color: var(--success);
  }

  .node-name {
    font-size: 0.8125rem;
    font-family: var(--font-mono);
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
    min-width: 0;
    margin-right: 4px;
  }

  .node-name.is-attribute {
    color: var(--accent-dark);
  }

  .node-name.is-text {
    color: var(--success);
    font-style: italic;
  }

  .rename-group {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    flex-shrink: 0;
  }

  .rename-arrow {
    color: var(--text-tertiary);
    font-size: 0.75rem;
    font-family: var(--font-mono);
  }

  .rename-key {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border: 1px solid transparent;
    border-radius: 4px;
    background: none;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-secondary);
    transition: all 150ms ease;
    min-height: 28px;
  }

  .rename-key:hover {
    border-color: var(--border-dark);
    background: var(--surface);
    color: var(--text);
  }

  .rename-key:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 1px;
  }

  .rename-key.renamed {
    color: var(--primary);
    font-weight: 600;
    border-color: var(--primary-alpha);
    background: var(--primary-alpha);
  }

  .rename-key.renamed:hover {
    border-color: var(--primary);
  }

  .rename-key svg {
    opacity: 0;
    transition: opacity 150ms ease;
    flex-shrink: 0;
    color: var(--text-tertiary);
  }

  .rename-key:hover svg {
    opacity: 1;
  }

  .rename-input.editing {
    width: 120px;
    padding: 2px 6px;
    border: 2px solid var(--primary);
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    background: var(--surface);
    color: var(--text);
    outline: none;
    min-height: 28px;
  }

  .key-text {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .node-children {
    /* contenitore figli */
  }
</style>
