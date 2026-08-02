import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ExtensionContext, window } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node.js';

let client: LanguageClient | undefined;

export function activate(context: ExtensionContext) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const serverModule = path.join(__dirname, '../server/server.js');

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.stdio },
    debug: { module: serverModule, transport: TransportKind.stdio, options: { execArgv: ['--inspect=6009'] } }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'typescript' },
      { scheme: 'file', language: 'javascript' }
    ],
    synchronize: {
      configurationSection: 'simpleWebComponentLsp'
    },
    traceOutputChannel: window.createOutputChannel('SWC LSP Trace')
  };

  client = new LanguageClient(
    'simple-web-component-lsp',
    'Simple Web Component LSP',
    serverOptions,
    clientOptions
  );

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) return undefined;
  return client.stop();
}
