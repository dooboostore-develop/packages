// out/server/server.js 경로는 IntelliJ 플러그인(plugins/intellij)이 그대로 실행한다 — 바꾸지 말 것.
import { build, context } from 'esbuild';
import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const options = {
  entryPoints: {
    'server/server': 'src/server/server.ts',
    'server/analyzer': 'src/server/analyzer.ts', // 테스트(test/)가 직접 불러 쓴다
    'server/typeService': 'src/server/typeService.ts',
    'client/extension': 'src/client/extension.ts',
  },
  outdir: 'out',
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  minify: true,
  keepNames: true,
  sourcemap: true,
  // typescript 는 묶는다 — 프로젝트가 TypeScript 7(Go) 이면 JS API 가 없어서 그걸 쓸 수 없다
  external: ['vscode'],
  logLevel: 'info',
};

// 묶인 typescript 는 lib.*.d.ts 를 자기 실행 파일(server.js) 옆에서 찾는다
const tsLib = path.dirname(createRequire(import.meta.url).resolve('typescript'));
mkdirSync('out/server', { recursive: true });
for (const f of readdirSync(tsLib)) if (/^lib(\..*)?\.d\.ts$/.test(f)) cpSync(path.join(tsLib, f), path.join('out/server', f));

if (process.argv.includes('--watch')) await (await context(options)).watch();
else await build(options);
