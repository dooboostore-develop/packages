// out/extension.js — VS Code 클라이언트. 서버는 넣지 않는다 (프로젝트의 node_modules/@dooboostore/simple-web-component/lsp 를 쓴다)
import { build } from 'esbuild';

await build({
  entryPoints: ['src/extension.ts'],
  outfile: 'out/extension.js',
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  sourcemap: true,
  external: ['vscode'],
  logLevel: 'info',
});
