// esbuild.transformSync는 (1) emitDecoratorMetadata를 아예 지원 안 해서
// Reflect.getMetadata('design:paramtypes', ...)에 의존하는 DI 배열 주입(@Inject({type})가
// WW[] 파라미터에 [Array]를 못 찍어줌) 같은 기능이 통째로 깨진다. 진짜 TypeScript 컴파일러의
// ts.transpileModule은 (2) 타입 전용 import도 파일 안 사용처 기준으로 알아서 지워주고
// (import type 안 붙여도 됨) (3) design:paramtypes 메타데이터도 정확히 찍어준다 -
// typescript는 이미 모든 패키지에 devDependency로 있어서 새 의존성도 필요 없다.
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
