import * as fs from 'fs';
import * as path from 'path';
import { HTML_TAG_ENTRIES } from './src/config/config';

const elements: [string, string][] = HTML_TAG_ENTRIES;
const targetFile = './src/elements/register.ts';

// Helper to load and transform core element source - returns class with decorator
const getCoreSource = (fileName: string, tagName: string, baseClassName: string, extendsTag?: string) => {
  const content = fs.readFileSync(`./src/elements/${fileName}.ts`, 'utf-8');

  // Find the exact start of the class body after 'export class ... { 
  // 이제 implements를 지원함
  const match = content.match(/class\s+\w+\s+extends\s+\w+(?:\s+implements\s+[\w\s,]+)?\s+\{/);
  if (!match) throw new Error(`Could not find class definition in ${fileName}.ts`);

  const startIdx = match.index! + match[0].length;
  const endIdx = content.lastIndexOf('}');

  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
    throw new Error(`Could not find valid class body in ${fileName}.ts`);
  }

  const body = content.substring(startIdx, endIdx);

  const decorator = extendsTag ? `@elementDefine('${tagName}', { extends: '${extendsTag}', window: w })` : `@elementDefine('${tagName}', { window: w })`;

  return `  ${decorator}\n  class ${fileName} extends ${baseClassName} {${body}  }`;
};

// 1. Collect all unique base classes needed
const baseClasses = new Set<string>(['HTMLElement', 'HTMLTemplateElement', 'DocumentFragment', 'Node', 'Element']);
elements.forEach(([className]) => baseClasses.add(className));

// 2. Build the extraction block
let extractionBlock = '  const {\n';
baseClasses.forEach(cls => {
  extractionBlock += `    ${cls}: _${cls},\n`;
});
extractionBlock += '  } = w as any;\n\n';

baseClasses.forEach(cls => {
  extractionBlock += `  const ${cls} = _${cls} as typeof globalThis.${cls};\n`;
});

let registerContent = `import { elementDefine } from '../decorators/elementDefine';
import { SwcAppMixin } from './SwcAppMixin';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils } from '@dooboostore/core';
import { changedAttributeHost } from '../decorators/changedAttributeHost';

type Constructor<T> = new (...args: any[]) => T;

export const registerAllElements = (w: any): Record<string, Constructor<HTMLElement>> => {
${extractionBlock}

  // --- Sub Templates ---
  @elementDefine('swc-loading', { extends: 'template', window: w }) class SwcLoading extends HTMLTemplateElement {}
  @elementDefine('swc-error', { extends: 'template', window: w }) class SwcError extends HTMLTemplateElement {}
  @elementDefine('swc-success', { extends: 'template', window: w }) class SwcSuccess extends HTMLTemplateElement {}
  @elementDefine('swc-when', { extends: 'template', window: w }) class SwcWhen extends HTMLTemplateElement {}
  @elementDefine('swc-otherwise', { extends: 'template', window: w }) class SwcOtherwise extends HTMLTemplateElement {}
  @elementDefine('swc-default', { extends: 'template', window: w }) class SwcDefault extends HTMLTemplateElement {}

  // --- Core Elements ---
  @elementDefine('swc-app', { window: w })
  class SwcApp extends SwcAppMixin(HTMLElement) {}

  ${getCoreSource('SwcIf', 'swc-if', 'HTMLTemplateElement', 'template')}

  ${getCoreSource('SwcLoop', 'swc-loop', 'HTMLTemplateElement', 'template')}

  ${getCoreSource('SwcChoose', 'swc-choose', 'HTMLTemplateElement', 'template')}

  ${getCoreSource('SwcAsync', 'swc-async', 'HTMLTemplateElement', 'template')}

  // --- "is" Elements ---
`;

const appElements: string[] = [];
elements.forEach(([className, tagName]) => {
  const shortName = className.replace('HTML', '').replace('Element', '');
  registerContent += `  @elementDefine('swc-app-${tagName}', { extends: '${tagName}', window: w })\n`;
  registerContent += `  class SwcApp${shortName} extends SwcAppMixin(${className}) {}\n\n`;
  appElements.push(`    SwcApp${shortName}`);
});

registerContent += `
  return {
    // Sub Templates
    SwcLoading,
    SwcError,
    SwcSuccess,
    SwcWhen,
    SwcOtherwise,
    SwcDefault,
    // Core Elements
    SwcApp,
    SwcIf,
    SwcLoop,
    SwcChoose,
    SwcAsync,
    // App Elements
${appElements.join(',\n')},
  };
};
`;

fs.writeFileSync(targetFile, registerContent);
console.log('Engine-based SWC: Unified registration helper regenerated with stable body extraction!');
