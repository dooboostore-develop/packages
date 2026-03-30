import { DomParser } from '../../dom-parser/src/index';
import path from 'path';
import { fileURLToPath } from 'url';
import HelloComponentFactory from './src/component/hello.component';
import { SSRSimpleWebComponentFilter } from '@dooboostore/simple-boot-http-server-ssr';
import swcRegister from '@dooboostore/simple-web-component';
import bootfactory from './src/bootfactory';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runTest() {
  console.log('🧪 Starting SWC SSR Verification Test...');

  // 1. Setup Virtual DOM Environment for Globals
  const parser = new DomParser('<html><body id="app"></body></html>');
  const serverWin = parser.window as any;
  swcRegister(serverWin);

  // 2. Import BROWSER_GLOBALS to inject everything needed BEFORE importing SWC
  const { BROWSER_GLOBALS } = await import('../../simple-web-component/src/config/config');
  BROWSER_GLOBALS.forEach(key => {
    if (serverWin[key]) {
      (global as any)[key] = serverWin[key];
    }
  });

  // 3. Register components for the test (Global window)

  // 4. Mock Request/Response
  const mockRR = {
    reqHasAcceptHeader: (mime: string) => true,
    reqUrlObj: () => new URL('http://localhost:8080/'),
    resStatusCode: (code: number) => console.log(`   [Response Status] ${code}`),
    resSetHeader: (name: string, value: string) => console.log(`   [Response Header] ${name}: ${value}`),
    resEnd: async (html: string) => {
      console.log('   [Response Body] (Generated HTML):');
      console.log('--------------------------------------------------');
      console.log(html);
      console.log('--------------------------------------------------');

      // if (html.includes('shadowrootmode="open"')) {
      //   console.log('✅ Found Declarative Shadow DOM!');
      // } else {
      //   console.log('❌ Declarative Shadow DOM NOT found!');
      // }
      //
      // if (html.includes('Hello from Simple Web Component SSR!')) {
      //   console.log('✅ Found Component Content!');
      // } else {
      //   console.log('❌ Component Content NOT found!');
      // }
    }
  };

  // 5. Configure Filter
  const swcFilter = new SSRSimpleWebComponentFilter({
    frontDistPath: path.resolve(__dirname, './dist-front-end'),
    frontDistIndexFileName: 'index.html',
    registerComponents: async (window: any) => {
      // Register SWC components for this request's window
      bootfactory(window);
      // HelloComponentFactory(window);
      console.log('   [Info] Components registered for request');
    }
  });

  // 6. Execute Filter logic manually
  // @ts-ignore
  await swcFilter.proceedBefore({ rr: mockRR });
}

runTest().catch(console.error);
