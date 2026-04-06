import {RequestResponse} from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import {HttpHeaders} from '@dooboostore/simple-boot-http-server/codes/HttpHeaders';
import {Filter} from '@dooboostore/simple-boot-http-server/filters/Filter';
import {Mimes} from '@dooboostore/simple-boot-http-server/codes/Mimes';
import {HttpStatus} from '@dooboostore/simple-boot-http-server/codes/HttpStatus';
import {SimpleBootHttpServer} from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import {DomParserInitializer} from '../initializers/DomParserInitializer';

export type SWCSSRDomParserConfig = {
  frontDistPath: string;
  frontDistIndexFileName?: string;
  welcomUrl?: string;
  ssrExcludeFilter?: (rr: RequestResponse) => boolean;
  /**
   * Function to register components for each request.
   */
  registerComponents?: (window: any) => Promise<void> | void;
};

/**
 * SSR Filter specifically for Simple Web Component (SWC).
 * It utilizes @dooboostore/dom-parser for rendering and DSD support.
 */
export class SSRSimpleWebComponentDomParserFilter implements Filter {
  private welcomUrl = 'http://localhost';

  constructor(public config: SWCSSRDomParserConfig) {
    this.welcomUrl = config.welcomUrl || this.welcomUrl;
  }

  async onInit(app: SimpleBootHttpServer) {}

  async onDestroy() {}

  async proceedBefore({ rr }: { rr: RequestResponse; app: SimpleBootHttpServer; carrier: Map<string, any> }) {
    if (this.config.ssrExcludeFilter?.(rr)) {
      return false;
    }

    if (rr.reqHasAcceptHeader(Mimes.TextHtml) || rr.reqHasAcceptHeader(Mimes.All)) {
      const url = rr.reqUrlObj({ host: 'localhost' });
      const targetUrl = url.toString() ?? this.welcomUrl;

      // 1. Initialize Virtual DOM Environment
      const domParserInitializer = new DomParserInitializer(this.config.frontDistPath, this.config.frontDistIndexFileName || 'index.html', { url: targetUrl });
      const window = await domParserInitializer.run();

      console.log('vvvv22aa');
      // web component 경우 자기 tagName을 생성자 에게 HTMLElementBase에넘겨줘야되기떄문에
      // const getTagName = (type: ConstructorType<any>) => {
      //   const zz = getElementConfig(type);
      //   return zz.name;
      // };
      // (window as any).HTMLElement = class extends HTMLElementBase {
      //   constructor(...args: any[]) {
      //     const ctor = new.target as any; // 이런 슈가 기능이...
      //     const resolvedTagName = getTagName(ctor);
      //     super(resolvedTagName, args[0]);
      //   }
      // }


      try {
        // 2. Register Components if provided
        // We use SwcApplication inside the callback or directly here.
        if (this.config.registerComponents) {
          await this.config.registerComponents(window);
        }

        // window.document.querySelector('.sidebar-space').innerHTML = '씨발놈아.';
        // await new Promise<void>((resolve, reject) => setTimeout(resolve, 100));
        // await new Promise<void>((resolve, reject) => setTimeout(resolve, 5000));
        // window.document.body.innerHTML = '';
        // window.document.body.setAttribute('ssr-use', 'true');
        // 3. Generate Final HTML
        const html = this.makeHTML(window);
        // console.log('html: 💈', html);
        await this.writeOkHtmlAndEnd({ rr }, html);
      } finally {
        // 4. Cleanup
        window.close();
        domParserInitializer.destroy();
      }
      return false;
    }
    return true;
  }

  makeHTML(window: any) {
    let html = window.document.documentElement.outerHTML;
    if (!/^<!DOCTYPE html>/i.test(html)) {
      html = '<!DOCTYPE html>\n' + html;
    }
    return html;
  }

  async writeOkHtmlAndEnd({ rr, status = HttpStatus.Ok }: { rr: RequestResponse; status?: HttpStatus }, html: string) {
    rr.resStatusCode(status);
    rr.resSetHeader(HttpHeaders.ContentType, Mimes.TextHtml);
    await rr.resEnd(html);
  }

  async proceedAfter() {
    return true;
  }
}
