import * as fs from 'fs';
import * as path from 'path';
import { HTML_TAG_ENTRIES } from './src/config/config';

const elements: [string, string][] = HTML_TAG_ENTRIES;

const isTargetDir = './src/elements/is';

// Clean is/
if (fs.existsSync(isTargetDir)) {
  fs.readdirSync(isTargetDir).forEach(file => {
    if (file === 'index.ts') return;
    fs.unlinkSync(path.join(isTargetDir, file));
  });
} else {
  fs.mkdirSync(isTargetDir, { recursive: true });
}

// Master Template Load
const appTemplate = fs.readFileSync('./src/elements/SwcApp.ts', 'utf-8');

let isIndexContent = '';

elements.forEach(([className, tagName]) => {
  let shortName = className.replace('HTML', '').replace('Element', '');
  if (shortName === 'UList') shortName = 'Ul';
  if (shortName === 'OList') shortName = 'Ol';
  if (shortName === 'DList') shortName = 'Dl';
  if (shortName === 'LI') shortName = 'Li';
  if (shortName === 'HR') shortName = 'Hr';

  const targetClassName = 'SwcApp' + shortName;
  const genIsFile = (name: string, content: string) => fs.writeFileSync(path.join(isTargetDir, name + '.ts'), content);

  // Simple Transformation
  let elContent = appTemplate
    .replace(/from\s*['"]\.\.\/decorators\/elementDefine['"]/g, `from '../../decorators/elementDefine'`)
    .replace(/from\s*['"]\.\/SwcAppEngine['"]/g, `from '../SwcAppEngine'`)
    .replace(/@elementDefine\s*\(\s*{\s*name:\s*['"]swc-app['"]\s*,\s*extends:\s*undefined\s*}\s*\)/, `@elementDefine({ name: 'swc-app-${tagName}', extends: '${tagName}' })`)
    .replace(/export\s+class\s+SwcApp\s+extends\s+HTMLElement/, `export class ${targetClassName} extends ${className}`);

  genIsFile(targetClassName, elContent);
  isIndexContent += `export * from './${targetClassName}';\n`;
});

// Write is/index.ts
fs.writeFileSync(path.join(isTargetDir, 'index.ts'), isIndexContent);

console.log('Engine-based SWC: Generated apps are now minimal shells delegating to SwcAppEngine!');
