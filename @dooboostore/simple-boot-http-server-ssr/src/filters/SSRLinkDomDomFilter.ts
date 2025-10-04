import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import { HttpHeaders } from '@dooboostore/simple-boot-http-server/codes/HttpHeaders';
import { SimpleBootHttpSSRFactory } from '../SimpleBootHttpSSRFactory';
import { ConstructorType } from '@dooboostore/core/types';
import { JsdomInitializer } from '../initializers/JsdomInitializer';
import { Filter } from '@dooboostore/simple-boot-http-server/filters/Filter';
import { Mimes } from '@dooboostore/simple-boot-http-server/codes/Mimes';
import { HttpStatus } from '@dooboostore/simple-boot-http-server/codes/HttpStatus';
import { SimpleBootHttpServer } from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import { SimFrontOption } from '@dooboostore/simple-boot-front/option/SimFrontOption';
import { SimpleBootFront } from '@dooboostore/simple-boot-front/SimpleBootFront';
import { AsyncBlockingQueue } from '@dooboostore/core/queues/AsyncBlockingQueue';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import * as JSDOM from 'jsdom';
import { NotFoundError } from '@dooboostore/simple-boot-http-server/errors/NotFoundError';
import { DomRenderProxy } from '@dooboostore/dom-render/DomRenderProxy';
import { filter } from '@dooboostore/core/message/operators/filter';
import { first } from '@dooboostore/core/message/operators/first';
import { firstValueFrom } from '@dooboostore/core/message/internal/firstValueFrom';
import { parseHTML } from 'linkedom';
import { LinkedomInitializer } from '../initializers/LinkedomInitializer';

export type FactoryAndParams = {
  frontDistPath: string;
  frontDistIndexFileName?: string;
  factorySimFrontOption: (window: any) => SimFrontOption;
  factory: SimpleBootHttpSSRFactory;
  poolOption: {
    max: number;
    min: number;
    clearIntervalTime?: number;
  };
  using: ConstructorType<any>[];
  domExcludes?: ConstructorType<any>[];
  ssrExcludeFilter?: (rr: RequestResponse) => boolean;
  simpleBootFront?: {
    notFoundError?: boolean;
  };
};

export class SSRLinkDomDomFilter implements Filter {
  private simpleBootFrontPool: SimpleBootFront[] = [];
  private simpleBootFrontQueue = new AsyncBlockingQueue<SimpleBootFront>();
  // private indexHTML: string;
  private welcomUrl = 'http://localhost';
  private poolGeneration = 0;
  private intervalId?: NodeJS.Timeout;

  constructor(
    public config: FactoryAndParams,
    public otherInstanceSim?: Map<ConstructorType<any>, any>
  ) {
    config.frontDistIndexFileName = config.frontDistIndexFileName || 'index.html';
    // this.indexHTML = JsdomInitializer.loadFile(this.config.frontDistPath, config.frontDistIndexFileName);
  }

  async onInit(app: SimpleBootHttpServer) {
    for (let i = 0; i < this.config.poolOption.min; i++) {
      await this.pushQueue();
    }

    if (this.config.poolOption.clearIntervalTime && this.config.poolOption.clearIntervalTime > 0) {
      this.intervalId = setInterval(() => {
        this.poolGeneration++;
      }, this.config.poolOption.clearIntervalTime);
    }
  }

  async onDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    // this.simpleBootFrontQueue.clear();
    this.simpleBootFrontPool.forEach(front => {
      (front as any).jsdom?.window.close();
    });
    this.simpleBootFrontPool = [];
  }

  async makePage() {
    return new LinkedomInitializer(
      this.config.frontDistPath,
      this.config.frontDistIndexFileName || 'index.html',
      { url: this.welcomUrl }
    ).run();
    // const jsdom = await new JsdomInitializer(
    //   this.config.frontDistPath,
    //   this.config.frontDistIndexFileName || 'index.html',
    //   { url: this.welcomUrl }
    // ).run();
    // return jsdom;
  }

  async makeFront(window: Window) {
    const name = RandomUtils.uuid();
    (window as any).ssrUse = false;
    const option = this.config.factorySimFrontOption(DomRenderProxy.final(window));
    const simpleBootFront = await this.config.factory.create(option, this.config.using, this.config.domExcludes);
    simpleBootFront.run(this.otherInstanceSim);
    (simpleBootFront as any).generation = this.poolGeneration;
    return simpleBootFront;
  }

  enqueueFrontApp(simpleBootFront: SimpleBootFront) {
    // this.simpleBootFrontPool.set(simpleBootFront.option.name!, simpleBootFront);
    this.simpleBootFrontPool.push(simpleBootFront);
    this.simpleBootFrontQueue.enqueue(simpleBootFront);
  }
  async pushQueue() {
    if (this.simpleBootFrontPool.length < this.config.poolOption.max) {
      this.enqueueFrontApp(await this.makeFront(await this.makePage()));
    }
  }

  async proceedBefore({ rr, app }: { rr: RequestResponse; app: SimpleBootHttpServer; carrier: Map<string, any> }) {
    if (this.config.ssrExcludeFilter?.(rr)) {
      return false;
    }
    if (rr.reqHasAcceptHeader(Mimes.TextHtml) || rr.reqHasAcceptHeader(Mimes.All)) {
      if (this.simpleBootFrontQueue.isEmpty()) {
        await this.pushQueue();
      }
      const simpleBootFront = await this.simpleBootFrontQueue.dequeue();
      try {
        (simpleBootFront.option.window as any).ssrUse = true;
        delete (simpleBootFront.option.window as any).server_side_data;
        const url = rr.reqUrlObj({ host: 'localhost' });
        if (this.config.simpleBootFront?.notFoundError) {
          // intent router check first
          const intent = await simpleBootFront.getIntent(url.pathname);
          // route를 못찾은상태에서 router path까지 안맞으면 404 처리한다.  route랑 router랑 다르니깐 헛갈리지말도록
          if (intent.module === undefined && !intent.getRouterPathData(rr.reqUrlPathName)) {
            throw new NotFoundError({ message: `Not Found: ${rr.reqUrlPathName}` });
          }
        }

        // runRouting!!
        const targetUrl = url.toString();
        await simpleBootFront.goRouting(targetUrl);
        await new Promise(r => setTimeout(r, 0)); // <--중요: 이거 넣어야지 두번불러지는게 없어지는듯? 뭐지 event loop 변경된건가?


        // simpleBootFront.routingSubjectObservable.subscribe(it=>{
        //   console.log('zzzzzzzzzzzzzzzzzzz', it);
        //   if (it.triggerPoint==='end') {
        //     console.log('zzz@@', it.routerModule.intent);
        //   }
        // })

        const data = await firstValueFrom(
          // @ts-ignore
          simpleBootFront.routingSubjectObservable.pipe(
          // @ts-ignore
            filter(
              (it) =>
                it.triggerPoint === 'end' &&
                typeof it.routerModule.intent.uri === 'string' &&
                targetUrl.endsWith(it.routerModule.intent.uri)
            ),
            // delay(1000),
            first()
          )
        );
        // console.log('???????done');
        const html = this.makeHTML(simpleBootFront);
        await this.writeOkHtmlAndEnd({ rr }, html);
      } finally {
        (simpleBootFront.option.window as any).ssrUse = false;
        delete (simpleBootFront.option.window as any).server_side_data;
        if ((simpleBootFront as any).generation < this.poolGeneration) {
          // Stale instance, destroy it
          const jsdom = (simpleBootFront as any).jsdom as JSDOM.JSDOM | undefined;
          jsdom?.window.close();
          const index = this.simpleBootFrontPool.indexOf(simpleBootFront);
          if (index > -1) {
            this.simpleBootFrontPool.splice(index, 1);
          }
          this.pushQueue();
        } else {
          // Current instance, return to queue
          this.simpleBootFrontQueue.enqueue(simpleBootFront);
        }
      }
      return false;
    } else {
      return true;
    }
  }

  makeHTML(simpleBootFront: SimpleBootFront) {
    (simpleBootFront.option.window as any).document.querySelectorAll('*').forEach((el:HTMLElement )=> {
      Array.from(el.attributes).forEach(attr => {
        if (/^dr-/.test(attr.name) || /^domstyle/.test(attr.name) || /this-path/.test(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });
    });
    let html = simpleBootFront.option.window.document.documentElement.outerHTML;
    html = '<!DOCTYPE html>' + html;
    html = html.replace(/\$\{[\s\S]*?\}\$/g, '');
    const serverSideData = (simpleBootFront.option.window as any).server_side_data;
    if (serverSideData) {
      const data = Object.entries(serverSideData)
        .map(([k, v]) => {
          if (typeof v === 'string') {
            return `window.server_side_data.${k} = ${v}`;
          } else {
            return `window.server_side_data.${k} = ${JSON.stringify(v)}`;
          }
        })
        .join(';');
      if (data) {
        html = html.replace('</head>', `<script> window.server_side_data={}; ${data}; </script></head>`);
      }
    }
    return html;
  }
  async writeOkHtmlAndEnd({ rr, status = HttpStatus.Ok }: { rr: RequestResponse; status?: HttpStatus }, html: string) {
    rr.resStatusCode(status);
    rr.resSetHeader(HttpHeaders.ContentType, Mimes.TextHtml);
    await rr.resEnd(html);
  }

  async proceedAfter({ rr, app }: { rr: RequestResponse; app: SimpleBootHttpServer; carrier: Map<string, any> }) {
    return true;
  }
}
