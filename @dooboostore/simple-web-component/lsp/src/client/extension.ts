import * as path from 'node:path';
import { existsSync } from 'node:fs';
import { ExtensionContext, window, workspace } from 'vscode';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node';

// 서버는 확장에 넣지 않는다 — 프로젝트에 설치된 @dooboostore/simple-web-component 안의 것을 쓴다.
// 그래야 라이브러리와 LSP 버전이 같고, 서버가 쓰는 typescript 도 프로젝트 것이 된다.
const SERVER_IN_PROJECT = path.join('node_modules', '@dooboostore', 'simple-web-component', 'lsp', 'out', 'server', 'server.js');

let client: LanguageClient | undefined;

/** 설정 swc.serverPath → 워크스페이스(와 상위 폴더)의 node_modules → 하위 패키지의 node_modules → 저장소에서 개발 실행할 때의 out/server */
async function findServer(context: ExtensionContext): Promise<string | undefined> {
  const folders = workspace.workspaceFolders ?? [];
  const configured = workspace.getConfiguration('swc').get<string>('serverPath');
  if (configured) return path.isAbsolute(configured) || !folders[0] ? configured : path.join(folders[0].uri.fsPath, configured);

  for (const f of folders) {
    for (let dir = f.uri.fsPath; ; dir = path.dirname(dir)) {
      const candidate = path.join(dir, SERVER_IN_PROJECT);
      if (existsSync(candidate)) return candidate;
      if (path.dirname(dir) === dir) break;
    }
  }
  const [nested] = await workspace.findFiles('**/' + SERVER_IN_PROJECT.split(path.sep).join('/'), undefined, 1);
  if (nested) return nested.fsPath;

  const fromSource = context.asAbsolutePath(path.join('out', 'server', 'server.js'));
  return existsSync(fromSource) ? fromSource : undefined;
}

export async function activate(context: ExtensionContext) {
  const module = await findServer(context);
  if (!module) {
    window.showWarningMessage('Simple Web Component: language server not found. Install @dooboostore/simple-web-component 1.0.56 or later in this project (it ships `swc-lsp`), or set "swc.serverPath".');
    return;
  }
  client = new LanguageClient(
    'swc',
    'Simple Web Component',
    {
      run: { module, transport: TransportKind.ipc },
      debug: { module, transport: TransportKind.ipc, options: { execArgv: ['--nolazy', '--inspect=6009'] } },
    },
    {
      documentSelector: ['typescript', 'typescriptreact', 'javascript', 'html'].map(language => ({ scheme: 'file', language })),
      // 닫힌 파일이 바뀌어도 태그 인덱스가 따라가게
      synchronize: { fileEvents: workspace.createFileSystemWatcher('**/*.{ts,tsx,js,mjs}') },
    }
  );
  client.outputChannel.appendLine(`server: ${module}`);
  await client.start();
}

export function deactivate() {
  return client?.stop();
}
