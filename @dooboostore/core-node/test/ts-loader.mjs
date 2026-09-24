// node의 순정 --experimental-transform-types는 파일 단위 타입 정보가 없어서
// `import type` 없이 쓴 타입 전용 import(이 레포 전체 컨벤션)를 못 지운다 -
// (공식 문서에 명시된 한계). esbuild.transformSync는 파일 안 사용처를 보고
// 알아서 지워주므로, 이미 devDependency로 있는 esbuild를 "번들러"가 아니라
// 딱 이 한 가지(파일 하나 읽어서 TS -> JS 변환) 용도로만 쓴다.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

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
  // sourcemap 없으면 V8/디버거가 실행 중인 JS를 원본 .ts 줄번호로 못 되짚어서
  // breakpoint가 안 걸린다 - inline sourcemap을 붙여서 원본 파일 위치를 그대로 알려준다.
  const { code } = esbuild.transformSync(source, {
    loader: 'ts',
    format: 'esm',
    target: 'node22',
    sourcefile: path,
    sourcemap: 'inline',
  });
  return { format: 'module', source: code, shortCircuit: true };
}
