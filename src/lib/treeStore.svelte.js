/**
 * TreeStore — gestisce lo stato dell'albero XML usando le runes di Svelte 5.
 * Questo file deve essere importato con estensione .svelte.js per abilitare le runes.
 */

import { parseXml, findNode } from './xmlParser.js';

/**
 * Crea un nuovo tree store.
 * @returns {object} store con stato reattivo e metodi
 */
export function createTreeStore() {
  /** @type {object|null} */
  let root = $state(null);
  /** @type {string|null} */
  let error = $state(null);
  /** @type {string} */
  let fileName = $state('');
  /** @type {boolean} */
  let xmlLoaded = $state(false);

  // Mappa id -> customKey per accesso veloce
  let customKeyMap = $state({});

  function loadXml(xmlString, name) {
    const result = parseXml(xmlString);
    if (result.error) {
      error = result.error;
      root = null;
      xmlLoaded = false;
      fileName = '';
      customKeyMap = {};
    } else {
      error = null;
      root = result.root;
      xmlLoaded = true;
      fileName = name || 'documento.xml';
      // Inizializza la mappa customKey
      buildCustomKeyMap(result.root);
    }
  }

  function buildCustomKeyMap(node) {
    if (!node) return;
    customKeyMap = { ...customKeyMap, [node.id]: node.customKey };
    for (const child of node.children) {
      buildCustomKeyMap(child);
    }
  }

  function toggleNode(id) {
    if (!root) return;
    const node = findNode(root, id);
    if (!node) return;
    const newState = !node.selected;
    setNodeSelected(node, newState);
  }

  function setNodeSelected(node, selected) {
    node.selected = selected;
    customKeyMap = { ...customKeyMap }; // trigger reactivity
    for (const child of node.children) {
      setNodeSelected(child, selected);
    }
    // Se si deseleziona, controlla se il genitore deve essere deselezionato
    if (!selected && node.parentId !== null && root) {
      const parent = findNode(root, node.parentId);
      if (parent && parent.selected) {
        // Un genitore è selezionato solo se almeno un figlio diretto è selezionato
        updateParentSelection(parent);
      }
    }
  }

  function updateParentSelection(node) {
    if (!root) return;
    const hasSelectedChild = node.children.some(c => c.selected);
    if (node.selected !== hasSelectedChild) {
      node.selected = hasSelectedChild;
      customKeyMap = { ...customKeyMap };
      if (node.parentId !== null) {
        const parent = findNode(root, node.parentId);
        if (parent) updateParentSelection(parent);
      }
    }
  }

  function renameKey(id, newKey) {
    if (!root) return;
    const node = findNode(root, id);
    if (!node) return;
    const trimmed = newKey.trim();
    node.customKey = trimmed || node.name;
    customKeyMap = { ...customKeyMap, [id]: node.customKey };
  }

  function selectAll() {
    if (!root) return;
    setAllSelected(root, true);
    customKeyMap = { ...customKeyMap };
  }

  function deselectAll() {
    if (!root) return;
    setAllSelected(root, false);
    customKeyMap = { ...customKeyMap };
  }

  function setAllSelected(node, selected) {
    node.selected = selected;
    for (const child of node.children) {
      setAllSelected(child, selected);
    }
  }

  function reset() {
    root = null;
    error = null;
    fileName = '';
    xmlLoaded = false;
    customKeyMap = {};
  }

  return {
    get root() { return root; },
    get error() { return error; },
    get fileName() { return fileName; },
    get xmlLoaded() { return xmlLoaded; },
    get customKeyMap() { return customKeyMap; },
    loadXml,
    toggleNode,
    renameKey,
    selectAll,
    deselectAll,
    reset,
  };
}
