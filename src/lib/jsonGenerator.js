/**
 * JSON Generator — converte l'albero XML selezionato in un oggetto JSON,
 * applicando le chiavi personalizzate definite dall'utente.
 */

/**
 * Genera JSON a partire dal nodo radice.
 * @param {object} root - nodo radice dell'albero
 * @returns {object} json generato
 */
export function generateJson(root) {
  if (!root) return null;
  return nodeToJson(root);
}

/**
 * Converte un nodo e i suoi figli selezionati in JSON.
 */
function nodeToJson(node) {
  if (!node.selected) return null;

  // Nodo testo: restituisci il valore
  if (node.type === 'text') {
    return node.value || '';
  }

  // Nodo attributo: restituisci il valore
  if (node.isAttribute) {
    return node.value || '';
  }

  // Nodo elemento
  const key = node.customKey || node.name;
  const selectedChildren = node.children.filter(c => c.selected);

  // Caso 1: elemento foglia con solo valore testo
  if (node.value !== null && selectedChildren.length === 0) {
    return { [key]: node.value };
  }

  // Caso 2: elemento con attributi e/o figli
  const result = {};

  // Raccogli attributi (non come oggetti annidati ma come proprietà)
  const attrs = selectedChildren.filter(c => c.isAttribute);
  const elements = selectedChildren.filter(c => !c.isAttribute);

  if (attrs.length > 0) {
    const attrObj = {};
    for (const attr of attrs) {
      const attrKey = attr.customKey || attr.name.replace('@', '');
      attrObj[attrKey] = attr.value || '';
    }
    // Se ci sono sia attributi che figli elemento, metti gli attributi sotto _attributes
    if (elements.length > 0 || node.value) {
      result['_attributes'] = attrObj;
    } else {
      // Solo attributi: restituisci direttamente
      Object.assign(result, attrObj);
      if (node.value) {
        result['_value'] = node.value;
      }
      return { [key]: result };
    }
  }

  // Se c'è un valore testo e figli elemento (mixed content)
  if (node.value) {
    result['_value'] = node.value;
  }

  // Raccogli elementi figli, gestendo array per nomi duplicati
  const childGroups = {};
  for (const child of elements) {
    const childJson = nodeToJson(child);
    if (childJson === null) continue;

    // nodeToJson per un elemento restituisce { key: value }
    const entries = Object.entries(childJson);
    if (entries.length === 0) continue;

    const [childKey, childValue] = entries[0];

    if (childGroups[childKey] === undefined) {
      childGroups[childKey] = childValue;
    } else if (Array.isArray(childGroups[childKey])) {
      childGroups[childKey].push(childValue);
    } else {
      childGroups[childKey] = [childGroups[childKey], childValue];
    }
  }

  Object.assign(result, childGroups);

  return { [key]: result };
}

/**
 * Genera una stringa JSON formattata con indentazione.
 * @param {object} root
 * @returns {string}
 */
export function generateJsonString(root) {
  const json = generateJson(root);
  if (!json) return '{}';
  return JSON.stringify(json, null, 2);
}
