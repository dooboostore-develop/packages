const { ObjectPathParser } = require('../../src/parser/path/ObjectPathParser');

const path = 'this.previewImageIndex < this.availableImages.length - 1';
const parser = new ObjectPathParser(path);
const result = parser.toOptionalChainPath();

console.log('Input:', path);
console.log('Output:', result);
console.log('Expected:', 'this?.previewImageIndex < this?.availableImages?.length - 1');

// Debug: print token tree
console.log('\nToken tree:');
parser.getRoot().walk((token, depth) => {
  const indent = '  '.repeat(depth);
  console.log(`${indent}${token.type}: "${token.value}" [${token.start}-${token.end}]`);
}, 0);
