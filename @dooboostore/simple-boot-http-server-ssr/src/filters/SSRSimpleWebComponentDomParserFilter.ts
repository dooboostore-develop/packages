import {RequestResponse} from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import {HttpHeaders} from '@dooboostore/simple-boot-http-server/codes/HttpHeaders';
import {Filter} from '@dooboostore/simple-boot-http-server/filters/Filter';
import {Mimes} from '@dooboostore/simple-boot-http-server/codes/Mimes';
import {HttpStatus} from '@dooboostore/simple-boot-http-server/codes/HttpStatus';
import {SimpleBootHttpServer} from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import {injectRequestResponse} from '@dooboostore/simple-boot-http-server/proxy/RequestResponseInjectProxy';
import {SimConfig} from '@dooboostore/simple-boot';
import {DomParserInitializer} from '../initializers/DomParserInitializer';
import type { SwcAppInterface } from '@dooboostore/simple-web-component';
import { findAllPropertyMetadata } from '@dooboostore/simple-web-component';

export type SWCSSRDomParserConfig = {
  frontDistPath: string;
  frontDistIndexFileName?: string;
  welcomUrl?: string;
  ssrExcludeFilter?: (rr: RequestResponse) => boolean;
  /**
   * SSR 에 노출할 백엔드 서비스 목록(각 항목은 symbol 을 가진다, 예: pairServices).
   * 프레임워크가 요청마다 각 서비스를 꺼내 이 요청의 rr 을 주입한 뒤 Map 으로 묶어
   * registerComponents 의 3번째 인자(sim)로 넘긴다. → 앱은 그 Map 을 bootfactory 에 그대로 전달만 하면 되고
   *   직접 Proxy 로 감싸거나 rr 을 넣을 필요가 없다(쿠키 등 요청 컨텍스트 자동 전달).
   */
  intentServices?: SimConfig[];
  /**
   * 요청마다 컴포넌트를 등록한다. 앱 bootfactory를 그대로 넘기면 된다.
   * @param sim intentServices 를 rr 주입해 묶은 Map<symbol, service>. bootfactory 에 그대로 넘기면 된다.
   * @returns 초기화된 SwcApp (하이드레이션 데이터 박제 등에 사용)
   */
  registerComponents?: (window: any, rr: RequestResponse, sim: Map<symbol, any>) => Promise<SwcAppInterface | void> | SwcAppInterface | void;
};

/**
 * SSR Filter specifically for Simple Web Component (SWC).
 * It utilizes @dooboostore/dom-parser for rendering and DSD support.
 */
export class SSRSimpleWebComponentDomParserFilter implements Filter {
  private welcomUrl = 'http://localhost';
  private app?: SimpleBootHttpServer;

  constructor(public config: SWCSSRDomParserConfig) {
    this.welcomUrl = config.welcomUrl || this.welcomUrl;
  }

  async onInit(app: SimpleBootHttpServer) {
    this.app = app;
  }

  async onDestroy() {}

  async proceedBefore({ rr }: { rr: RequestResponse; app: SimpleBootHttpServer; carrier: Map<string, any> }) {
    if (this.config.ssrExcludeFilter?.(rr)) {
      return false;
    }

    if (rr.reqHasAcceptHeader(Mimes.TextHtml) || rr.reqHasAcceptHeader(Mimes.All)) {
      const url = rr.reqUrlObj({ host: 'localhost' });
      const targetUrl = url.toString() ?? this.welcomUrl;
      console.log('SSRSimpleWebComponentDomParserFilter start');

      // 1. Initialize Virtual DOM Environment
      const domParserInitializer = new DomParserInitializer(this.config.frontDistPath, this.config.frontDistIndexFileName || 'index.html', { url: targetUrl });
      const window = await domParserInitializer.run();

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
        let app: SwcAppInterface | void;
        if (this.config.registerComponents) {
          // intentServices 를 rr 주입해 Map 으로 묶어 넘긴다 (앱은 bootfactory 에 그대로 전달만).
          const sim = new Map<symbol, any>();
          for (const service of (this.config.intentServices ?? []).filter(Boolean)) {
            if (!service.symbol) continue;
            for (const sym of (Array.isArray(service.symbol) ? service.symbol : [service.symbol])) {
              const raw = this.app?.sim<any>(sym as any);
              if (raw) sim.set(sym, injectRequestResponse(raw, rr));
            }
          }
          app = await this.config.registerComponents(window, rr, sim);
        }

        // [하이드레이션] swcApp 본체 + 연결 엘리먼트의 @property 값을 script로 박제.
        // 클라에서 번들보다 먼저 실행 → querySelector로 찾아 .prop = 값 세팅 (네이티브
        // 업그레이드는 own property 유지라 upgrade 후에도 값 살아있음).
        if (app) {
          const items: Array<{ sel: string; prop: string; value: unknown }> = [];
          const targets: any[] = [app, ...(app.connectedElements?.() ?? []).filter((el: any) => el !== app)];
          for (const el of targets) {
            const swcId = (el as any)._swcId;
            if (!swcId) continue;
            const sel = `[swc-use-ssr="${swcId}"]`;
            for (const m of findAllPropertyMetadata(el)) {
              let value: unknown;
              try {
                value = el[m.propertyKey];
              } catch {
                continue;
              }
              if (value === undefined || typeof value === 'function') continue;
              try {
                JSON.stringify(value);
              } catch {
                continue;
              }
              items.push({ sel, prop: String(m.propertyKey), value });
            }
          }
          if (items.length > 0) {
            // 업그레이드 때 노드가 갈아엎어지면 JS 프로퍼티는 날아감. attribute는 복사되니
            // data-hyd-* 로 박고, 같은 노드면 프로퍼티도 바로 세팅.
            const script = window.document.createElement('script');
            // <script> 내용은 이스케이프 없이 직렬화된다 → 값에 '</script>'가 있으면 HTML 파서가 거기서 태그를 닫아 XSS.
            // JSON.stringify는 '<'를 이스케이프하지 않으므로 '\u003c'로 바꾼다 (JS에선 같은 문자열).
            // U+2028/2029는 구형 JS 엔진에서 문자열 리터럴 안의 줄바꿈으로 해석돼 문법 오류가 나므로 함께 이스케이프.
            const hydrationJson = JSON.stringify(items)
              .replace(/</g, '\\u003c')
              .replace(/\u2028/g, '\\u2028')
              .replace(/\u2029/g, '\\u2029');
            script.textContent =
              ` window.__swc_hydration=${hydrationJson};` +
              `for(const h of window.__swc_hydration){
                const el=document.querySelector(h.sel);
                  if(el){
                    el[h.prop]=h.value;
                  }
              }`;
            window.document.body.appendChild(script);
            console.log(`[ssr-hydration] ${items.length} props embedded`);
          }
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
