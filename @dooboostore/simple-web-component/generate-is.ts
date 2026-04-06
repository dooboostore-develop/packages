import * as fs from 'fs';
import * as path from 'path';
import { HTML_TAG_ENTRIES } from './src/config/config';

const elements: [string, string][] = HTML_TAG_ENTRIES;
const targetFile = './src/elements/register.ts';

// Helper to load and transform core element source - returns class with decorator
const getCoreSource = (fileName: string, tagName: string, baseClassName: string, extendsTag?: string) => {
  const content = fs.readFileSync(`./src/elements/${fileName}.ts`, 'utf-8');

  // Find the exact start of the class body after 'class ... extends ... ['implements' ... ] '{'
  const match = content.match(/class\s+\w+\s+extends\s+\w+(\s+(implements|&)\s+[^{]+)?\s+\{/);
  if (!match) throw new Error(`Could not find class definition in ${fileName}.ts`);

  const startIdx = match.index! + match[0].length;
  const endIdx = content.lastIndexOf('}');

  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
    throw new Error(`Could not find valid class body in ${fileName}.ts`);
  }

  const body = content.substring(startIdx, endIdx);

  const decorator = extendsTag ? `@elementDefine(tagName, { extends: '${extendsTag}', window: w })` : `@elementDefine(tagName, { window: w })`;

  return `  ${decorator}\n  class ${fileName} extends ${baseClassName} {${body}  }\n  return await w.customElements.whenDefined(tagName);`;
};

let registerContent = `import { getElementConfig, elementDefine, attributeThis, changedAttributeThis, getAttributeValue } from '../decorators';
import { SwcAppMixin } from './SwcAppMixin';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils,ActionExpression } from '@dooboostore/core';
import { ConvertUtils } from '@dooboostore/core-web';

type Constructor<T> = new (...args: any[]) => T;

const getBaseClass = (w: Window, name: string) => {
  const _cls = (w as any)[name];
  return _cls as typeof globalThis[keyof typeof globalThis];
}

const extractBaseClasses = (w: Window) => {
  return {
    HTMLElement: getBaseClass(w, 'HTMLElement') as typeof globalThis.HTMLElement,
    HTMLTemplateElement: getBaseClass(w, 'HTMLTemplateElement') as typeof globalThis.HTMLTemplateElement,
    Node: getBaseClass(w, 'Node') as typeof globalThis.Node,
    Element: getBaseClass(w, 'Element') as typeof globalThis.Element,
    DocumentFragment: getBaseClass(w, 'DocumentFragment') as typeof globalThis.DocumentFragment,
  };
}



// --- "is" Elements ---
`;

const appElements: string[] = [];
const registerCalls: string[] = [
  '    SwcApp: await registerSwcApp(w),',
  '    SwcIf: await registerSwcIf(w),',
  '    SwcLoop: await registerSwcLoop(w),',
  '    SwcChoose: await registerSwcChoose(w),',
  '    SwcAsync: await registerSwcAsync(w),'
];

elements.forEach(([className, tagName]) => {
  const shortName = className.replace('HTML', '').replace('Element', '');
  const funcName = `registerSwcApp${shortName}`;
  const customTagName = `swc-app-${tagName}`;
  registerContent += `export const ${funcName} = async (w: Window): Promise<CustomElementConstructor> => {\n`;
  registerContent += `  const tagName = '${customTagName}';\n`;
  registerContent += `  const existing = w.customElements.get(tagName);\n`;
  registerContent += `  if (existing) return existing;\n`;
  registerContent += `  const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };\n`; // Prevent scope issues if needed, but SwcAppMixin is imported
  registerContent += `  const ${className} = getBaseClass(w, '${className}') as typeof globalThis.${className};\n`;
  registerContent += `  @elementDefine(tagName, { extends: '${tagName}', window: w })\n`;
  registerContent += `  class SwcApp${shortName} extends SwcAppMixin(${className}) {}\n`;
  registerContent += `  return await w.customElements.whenDefined(tagName);\n};\n\n`;
  
  appElements.push(`    SwcApp${shortName}`);
  registerCalls.push(`    SwcApp${shortName}: await ${funcName}(w),`);
});

registerContent += `
export const registerAllElements = async (w: Window): Promise<Record<string, CustomElementConstructor>> => {
  return {
${registerCalls.join('\n')}
  };
};
`;

fs.writeFileSync(targetFile, registerContent);
console.log('Engine-based SWC: Unified registration helper regenerated with stable body extraction!');
