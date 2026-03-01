import { ObjectPathParser } from '../../src/parser/path/ObjectPathParser';

const testCases = [
  'this.availableImages.length - 1',
  'this.previewImageIndex < this.availableImages.length - 1',
];

for (const path of testCases) {
  console.log('\n='.repeat(60));
  console.log('Input:', path);
  const parser = new ObjectPathParser(path);
  const result = parser.toOptionalChainPath();
  console.log('Output:', result);
  
  console.log('\nToken tree:');
  parser.getRoot().walk((token, depth) => {
    const indent = '  '.repeat(depth);
    const childInfo = token.children.length > 0 ? ` (${token.children.length} children)` : '';
    console.log(`${indent}${token.type}: "${token.value}"${childInfo}`);
  }, 0);
}
