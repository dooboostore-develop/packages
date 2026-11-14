// out/server/server.js 경로는 IntelliJ 플러그인(plugins/intellij)이 그대로 실행한다 — 바꾸지 말 것.
import { build, context } from 'esbuild';

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
  sourcemap: true,
  external: ['vscode', 'typescript'],
  logLevel: 'info',
};

if (process.argv.includes('--watch')) await (await context(options)).watch();
else await build(options);
