// esbuild.transformSync는 emitDecoratorMetadata를 아예 지원 안 해서
// Reflect.getMetadata('design:paramtypes', ...)에 의존하는 DI가 깨진다. 진짜 TypeScript
// 컴파일러의 ts.transpileModule은 design:paramtypes 메타데이터도 정확히 찍어주고
// 타입 전용 import도 알아서 지워준다 - typescript는 이미 devDependency로 있다.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const tsconfigPath = fileURLToPath(new URL('./tsconfig.json', import.meta.url));
const { config } = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
const { options: compilerOptions } = ts.convertCompilerOptionsFromJson(config.compilerOptions, '.');

export async function resolve(specifier, context, nextResolve) {
  const isRelative = specifier.startsWith('.') || specifier.startsWith('/');
  if (!isRelative || specifier.endsWith('.ts')) {
    return nextResolve(specifier, context);
  }
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND') {
      return await nextResolve(`${specifier}.ts`, context);
    }
    if (err.code === 'ERR_UNSUPPORTED_DIR_IMPORT') {
      return await nextResolve(`${specifier}/index.ts`, context);
    }
    throw err;
  }
}

export async function load(url, context, nextLoad) {
  if (!url.endsWith('.ts')) {
    return nextLoad(url, context);
  }
  const path = fileURLToPath(url);
  const source = readFileSync(path, 'utf-8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      ...compilerOptions,
      module: ts.ModuleKind.ESNext,
      // sourcemap 없으면 V8/디버거가 실행 중인 JS를 원본 .ts 줄번호로 못 되짚어서 breakpoint가 안 걸린다.
      inlineSourceMap: true,
      inlineSources: true,
    },
    fileName: path,
  });
  return { format: 'module', source: outputText, shortCircuit: true };
}
