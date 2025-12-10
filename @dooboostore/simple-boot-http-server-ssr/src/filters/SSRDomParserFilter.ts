import {RequestResponse} from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import {HttpHeaders} from '@dooboostore/simple-boot-http-server/codes/HttpHeaders';
import {SimpleBootHttpSSRFactory} from '../SimpleBootHttpSSRFactory';
import {ConstructorType} from '@dooboostore/core/types';
import {Filter} from '@dooboostore/simple-boot-http-server/filters/Filter';
import {Mimes} from '@dooboostore/simple-boot-http-server/codes/Mimes';
import {HttpStatus} from '@dooboostore/simple-boot-http-server/codes/HttpStatus';
import {SimpleBootHttpServer} from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import {SimFrontOption} from '@dooboostore/simple-boot-front/option/SimFrontOption';
import {SimpleBootFront} from '@dooboostore/simple-boot-front/SimpleBootFront';
import {AsyncBlockingQueue} from '@dooboostore/core/queues/AsyncBlockingQueue';
import {RandomUtils} from '@dooboostore/core/random/RandomUtils';
import * as JSDOM from 'jsdom';
import {NotFoundError} from '@dooboostore/simple-boot-http-server/errors/NotFoundError';
import {DomRenderProxy} from '@dooboostore/dom-render/DomRenderProxy';
import {filter} from '@dooboostore/core/message/operators/filter';
import {first} from '@dooboostore/core/message/operators/first';
import {delay} from '@dooboostore/core/message/operators/delay';
import {firstValueFrom} from '@dooboostore/core/message/internal/firstValueFrom';
import {parseHTML} from 'linkedom';
import {Promises} from '@dooboostore/core/promise/Promises';
import {DomParserInitializer} from '../initializers/DomParserInitializer';
import {JsdomInitializer} from "../initializers";

export type FactoryAndParams = {
  frontDistPath: string;
  frontDistIndexFileName?: string;
  factorySimFrontOption: (window: any) => SimFrontOption;
  factory: SimpleBootHttpSSRFactory;
  // poolOption: {
  //   max: number;
  //   min: number;
  //   clearIntervalTime?: number;
  // };
  using: ConstructorType<any>[];
  domExcludes?: ConstructorType<any>[];
  ssrExcludeFilter?: (rr: RequestResponse) => boolean;
  simpleBootFront?: {
    notFoundError?: boolean;
  };
};

export class SSRDomParserFilter implements Filter {
  // private simpleBootFrontPool: SimpleBootFront[] = [];
  // private simpleBootFrontQueue = new AsyncBlockingQueue<SimpleBootFront>();
  // private indexHTML: string;
  private welcomUrl = 'http://localhost';
  // private poolGeneration = 0;
  // private intervalId?: NodeJS.Timeout;

  constructor(
    public config: FactoryAndParams,
    public otherInstanceSim?: Map<ConstructorType<any>, any>
  ) {
    config.frontDistIndexFileName = config.frontDistIndexFileName || 'index.html';
    // this.indexHTML = JsdomInitializer.loadFile(this.config.frontDistPath, config.frontDistIndexFileName);
  }

  async onInit(app: SimpleBootHttpServer) {
    // for (let i = 0; i < this.config.poolOption.min; i++) {
    //   await this.pushQueue();
    // }

    // if (this.config.poolOption.clearIntervalTime && this.config.poolOption.clearIntervalTime > 0) {
    //   this.intervalId = setInterval(() => {
    //     this.poolGeneration++;
    //   }, this.config.poolOption.clearIntervalTime);
    // }
  }

  async onDestroy() {
    // if (this.intervalId) {
    //   clearInterval(this.intervalId);
    // }
    // // this.simpleBootFrontQueue.clear();
    // this.simpleBootFrontPool.forEach(front => {
    //   // JSDOM도 정리 (하위 호환성)
    //   (front as any).jsdom?.window.close();
    //   // Window close - 이것만으로 WindowBase.close()가 호출되어 메모리 정리됨
    //   (front.option.window as any)?.close?.();
    // });
    // this.simpleBootFrontPool = [];
  }

  async makePage() {
    const domParserInitializer = new DomParserInitializer(
      this.config.frontDistPath,
      this.config.frontDistIndexFileName || 'index.html',
      {url: this.welcomUrl}
    );
    const window = await domParserInitializer.run();
    // window.document.querySelector('#app').setAttribute(('vvv'),'zzz')
    // console.log('vvv', window.document.querySelector('#app'))
    // console.log('------', window.document.documentElement.outerHTML);
    return {window, domParserInitializer};
    // const jsdom = await new JsdomInitializer(
    //   this.config.frontDistPath,
    //   this.config.frontDistIndexFileName || 'index.html',
    //   { url: this.welcomUrl }
    // ).run();
    // return { window: jsdom.window as any, domParserInitializer: {destroy: () => {jsdom.window.close()}} };
    // return jsdom;
  }

  async makeFront(window: Window) {
    const name = RandomUtils.uuid();
    (window as any).ssrUse = false;
    const option = this.config.factorySimFrontOption(DomRenderProxy.final(window));
    const simpleBootFront = await this.config.factory.create(option, this.config.using, this.config.domExcludes);
    simpleBootFront.run(this.otherInstanceSim);
    // (simpleBootFront as any).generation = this.poolGeneration;
    return simpleBootFront;
  }

  // enqueueFrontApp(simpleBootFront: SimpleBootFront) {
  //   // this.simpleBootFrontPool.set(simpleBootFront.option.name!, simpleBootFront);
  //   this.simpleBootFrontPool.push(simpleBootFront);
  //   this.simpleBootFrontQueue.enqueue(simpleBootFront);
  // }
  //
  // async pushQueue() {
  //   if (this.simpleBootFrontPool.length < this.config.poolOption.max) {
  //     this.enqueueFrontApp(await this.makeFront(await this.makePage()));
  //   }
  // }

  async proceedBefore({rr, app}: { rr: RequestResponse; app: SimpleBootHttpServer; carrier: Map<string, any> }) {
    if (this.config.ssrExcludeFilter?.(rr)) {
      return false;
    }
    if (rr.reqHasAcceptHeader(Mimes.TextHtml) || rr.reqHasAcceptHeader(Mimes.All)) {
      // if (this.simpleBootFrontQueue.isEmpty()) {
      //   await this.pushQueue();
      // }
      // const simpleBootFront = await this.simpleBootFrontQueue.dequeue();
      const {window, domParserInitializer} = await this.makePage();
      const simpleBootFront = await this.makeFront(window);
      try {
        (simpleBootFront.option.window as any).ssrUse = true;
        delete (simpleBootFront.option.window as any).server_side_data;
        const url = rr.reqUrlObj({host: 'localhost'});
        if (this.config.simpleBootFront?.notFoundError) {
          // intent router check first
          const intent = await simpleBootFront.getIntent(url.pathname);
          // route를 못찾은상태에서 router path까지 안맞으면 404 처리한다.  route랑 router랑 다르니깐 헛갈리지말도록
          if (intent.module === undefined && !intent.getRouterPathData(rr.reqUrlPathName)) {
            throw new NotFoundError({message: `Not Found: ${rr.reqUrlPathName}`});
          }
        }

        // runRouting!!
        const targetUrl = url.toString();
        // console.log('runRoutingrunRouting', targetUrl);
        await simpleBootFront.goRouting(targetUrl);
        // await Promises.sleep(0); // <--중요: 이거 넣어야지 두번불러지는게 없어지는듯? 뭐지 event loop 변경된건가?

        // console.log('runRout22222ingrunRouting', targetUrl);

        // simpleBootFront.routingSubjectObservable.subscribe(it=>{
        //   console.log('zzzzzzzzzzzzzzzzzzz', it);
        //   if (it.triggerPoint==='end') {
        //     console.log('zzz@@', it.routerModule.intent);
        //   }
        // })

        // simpleBootFront.routingSubjectObservable.subscribe(it => {
        //   console.log('RRRRRRRRRRRRRRRRRRR', it);
        // })
        const data = await firstValueFrom(
          simpleBootFront.routingSubjectObservable.pipe(
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
        // await Promises.sleep(0)
        // console.log('???????done');
        const html = this.makeHTML(simpleBootFront);
        // console.log('---------',html);
        await this.writeOkHtmlAndEnd({rr}, html);
      } finally {
        try {
          (simpleBootFront.option.window as any).ssrUse = false;
          delete (simpleBootFront.option.window as any).server_side_data;
          // Stale instance, destroy it
          const jsdom = (simpleBootFront as any).jsdom as JSDOM.JSDOM | undefined;
          jsdom?.window.close();
          window.close();
          // window.close()만 호출하면 WindowBase.close()가 실행되어 메모리 정리됨
          (simpleBootFront.option.window as any)?.close?.();
          domParserInitializer.destroy();
        } catch (e) {
          console.log('eeeeee', e);
        }

        // const index = this.simpleBootFrontPool.indexOf(simpleBootFront);
        // if (index > -1) {
        //   this.simpleBootFrontPool.splice(index, 1);
        // }
        // this.pushQueue();
      }
      return false;
    } else {
      return true;
    }
  }

  makeHTML(simpleBootFront: SimpleBootFront) {
    (simpleBootFront.option.window as any).document.querySelectorAll('*').forEach((el: HTMLElement) => {
      Array.from(el.attributes).forEach(attr => {
        if (/^dr-/.test(attr.name) || /^domstyle/.test(attr.name) || /this-path/.test(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });
    });
    let html = simpleBootFront.option.window.document.documentElement.outerHTML;
    if (!/^<!DOCTYPE html>/i.test(html)) {
      html = '<!DOCTYPE html>' + html;
    }
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

  async writeOkHtmlAndEnd({rr, status = HttpStatus.Ok}: { rr: RequestResponse; status?: HttpStatus }, html: string) {
    rr.resStatusCode(status);
    rr.resSetHeader(HttpHeaders.ContentType, Mimes.TextHtml);
    await rr.resEnd(html);
  }

  async proceedAfter({rr, app}: { rr: RequestResponse; app: SimpleBootHttpServer; carrier: Map<string, any> }) {
    return true;
  }
}
