/**
 * Test script per verificare il parser XML e il generatore JSON.
 * Usa jsdom per simulare DOMParser in Node.js.
 */

import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Setup DOMParser globale usando jsdom
const dom = new JSDOM('<!DOCTYPE html>');
global.DOMParser = dom.window.DOMParser;
global.Node = dom.window.Node;

// Ora importa i moduli dell'app
import { parseXml, findNode, flattenTree } from '../src/lib/xmlParser.js';
import { generateJsonString } from '../src/lib/jsonGenerator.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

// Carica il file XML di test
const xmlString = readFileSync(join(__dirname, 'sample.xml'), 'utf-8');

console.log('Test 1: Parsing XML con 3 livelli di annidamento');
const { root, error } = parseXml(xmlString);
assert(!error, 'Parsing senza errori');
assert(root !== null, 'Root non è null');
assert(root.name === 'libreria', 'Root è "libreria"');
assert(root.children.length > 0, 'Root ha figli');

const allNodes = flattenTree(root);
console.log(`  (${allNodes.length} nodi totali nell'albero)`);
assert(allNodes.length >= 10, 'Almeno 10 nodi totali (3+ livelli)');

// Verifica che ci siano almeno 3 livelli
const maxDepth = Math.max(...allNodes.map(n => n.depth));
assert(maxDepth >= 3, `Profondità massima >= 3 (attuale: ${maxDepth})`);

console.log('\nTest 2: Selezione/deselezione nodi (logica)');
const primoLibro = root.children.find(c => c.name === 'libro');
assert(primoLibro !== undefined, 'Trovato nodo "libro"');

// Tutti i nodi partono selezionati
assert(primoLibro.selected === true, 'Nodo libro inizialmente selezionato');
const primoLibroChildren = primoLibro.children;
const allSelected = primoLibroChildren.every(c => c.selected);
assert(allSelected, 'Tutti i figli di libro inizialmente selezionati');

console.log('\nTest 3: Generazione JSON');
const jsonStr = generateJsonString(root);
assert(jsonStr.length > 100, 'JSON generato ha contenuto (> 100 caratteri)');

// Verifica che il JSON sia valido
try {
  const parsed = JSON.parse(jsonStr);
  assert(typeof parsed === 'object' && parsed !== null, 'JSON è un oggetto valido');
  assert(parsed.libreria !== undefined, 'JSON contiene chiave "libreria"');
  assert(Array.isArray(parsed.libreria.libro), 'I libri sono in un array (nome duplicato)');
  assert(parsed.libreria.libro.length === 2, '2 libri nell\'array');
} catch (e) {
  assert(false, `JSON parsing fallito: ${e.message}`);
}

console.log('\nTest 4: Attributi XML convertiti in JSON');
const parsed = JSON.parse(jsonStr);
const primo = parsed.libreria.libro[0];
assert(primo._attributes !== undefined, 'Attributi del libro presenti come _attributes');
if (primo._attributes) {
  assert(primo._attributes.id === '1', 'Attributo "id" = "1"');
  assert(primo._attributes.genere === 'fantasy', 'Attributo "genere" = "fantasy"');
}

console.log('\nTest 5: Rinomina chiavi (customKey)');
// Simula rinomina: cambia customKey di un nodo
const titoloNode = findNode(root, allNodes.find(n => n.name === 'titolo' && n.depth === 2)?.id);
if (titoloNode) {
  titoloNode.customKey = 'book_title';
  const renamedJson = generateJsonString(root);
  assert(renamedJson.includes('"book_title"'), 'La chiave rinominata "book_title" appare nel JSON');
} else {
  assert(false, 'Nodo "titolo" non trovato per il test di rinomina');
}

console.log(`\n═══════════════════════════════════`);
console.log(`Risultati: ${passed} passati, ${failed} falliti`);
console.log(`═══════════════════════════════════`);

process.exit(failed > 0 ? 1 : 0);
