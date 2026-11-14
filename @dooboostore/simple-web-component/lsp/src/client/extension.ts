import * as path from 'node:path';
import { ExtensionContext, workspace } from 'vscode';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

export function activate(context: ExtensionContext) {
  const module = context.asAbsolutePath(path.join('out', 'server', 'server.js'));
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
  return client.start();
}

export function deactivate() {
  return client?.stop();
}
