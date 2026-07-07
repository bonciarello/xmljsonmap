/**
 * XML Parser — converte una stringa XML in una struttura ad albero navigabile.
 * Usa DOMParser nativo del browser.
 */

let _nextId = 0;
function uid() {
  return ++_nextId;
}

/**
 * @param {string} xmlString
 * @returns {{ root: object, error: string|null }}
 */
export function parseXml(xmlString) {
  _nextId = 0;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');

    // Controlla errori di parsing
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return { root: null, error: parseError.textContent || 'XML non valido' };
    }

    const rootElement = doc.documentElement;
    if (!rootElement) {
      return { root: null, error: 'Nessun elemento radice trovato' };
    }

    const root = elementToNode(rootElement, null, 0);
    return { root, error: null };
  } catch (e) {
    return { root: null, error: e.message || 'Errore durante il parsing' };
  }
}

/**
 * Converte un elemento DOM in un nodo del nostro albero.
 */
function elementToNode(el, parentId, depth) {
  const id = uid();
  const node = {
    id,
    name: el.nodeName,
    type: 'element',
    selected: true,
    customKey: el.nodeName,
    children: [],
    depth,
    parentId,
    isAttribute: false,
    value: null,
    hasMixedContent: false,
  };

  // Raccogli attributi come figli speciali
  if (el.attributes && el.attributes.length > 0) {
    for (const attr of el.attributes) {
      const attrId = uid();
      node.children.push({
        id: attrId,
        name: `@${attr.name}`,
        type: 'attribute',
        selected: true,
        customKey: attr.name,
        children: [],
        depth: depth + 1,
        parentId: id,
        isAttribute: true,
        value: attr.value,
        hasMixedContent: false,
      });
    }
  }

  // Raccogli nodi figli (elementi e testo)
  let hasElements = false;
  let hasText = false;
  const textParts = [];

  for (const child of el.childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      hasElements = true;
      node.children.push(elementToNode(child, id, depth + 1));
    } else if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent.trim();
      if (text) {
        hasText = true;
        textParts.push(text);
      }
    } else if (child.nodeType === Node.CDATA_SECTION_NODE) {
      hasText = true;
      textParts.push(child.textContent);
    }
  }

  // Se ci sono sia elementi che testo, è contenuto misto
  if (hasElements && hasText) {
    node.hasMixedContent = true;
    // Aggiungi il testo come nodo speciale #text
    const textId = uid();
    node.children.push({
      id: textId,
      name: '#text',
      type: 'text',
      selected: true,
      customKey: '#text',
      children: [],
      depth: depth + 1,
      parentId: id,
      isAttribute: false,
      value: textParts.join(' '),
      hasMixedContent: false,
    });
  } else if (hasText && !hasElements) {
    // Solo testo: mettilo come value dell'elemento
    node.value = textParts.join(' ');
  }

  return node;
}

/**
 * Trova un nodo per id nell'albero (ricerca ricorsiva).
 */
export function findNode(root, id) {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

/**
 * Raccoglie tutti i nodi in un array piatto (per debug).
 */
export function flattenTree(root) {
  const result = [root];
  for (const child of root.children) {
    result.push(...flattenTree(child));
  }
  return result;
}
