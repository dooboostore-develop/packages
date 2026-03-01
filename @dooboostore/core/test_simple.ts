import { ObjectPathParser } from './src/parser/path/ObjectPathParser';

const input = 'this.availableImages.length - 1';
console.log('Input:', input);

const parser = new ObjectPathParser(input);
console.log('Output:', parser.toOptionalChainPath());
console.log('Expected:', 'this?.availableImages?.length - 1');

console.log('\nTokens:');
parser.getRoot().walk((token, depth) => {
  console.log('  '.repeat(depth) + `${token.type}: "${token.value}"`);
});
