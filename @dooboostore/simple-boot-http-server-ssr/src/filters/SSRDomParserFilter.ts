import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import { HttpHeaders } from '@dooboostore/simple-boot-http-server/codes/HttpHeaders';
import { SimpleBootHttpSSRFactory } from '../SimpleBootHttpSSRFactory';
import { ConstructorType } from '@dooboostore/core/types';
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
import { delay } from '@dooboostore/core/message/operators/delay';
import { firstValueFrom } from '@dooboostore/core/message/internal/firstValueFrom';
import { parseHTML } from 'linkedom';
import { Promises } from '@dooboostore/core/promise/Promises';
import { DomParserInitializer } from '../initializers/DomParserInitializer';
import { JsdomInitializer } from '../initializers';
import { SimConfig } from '@dooboostore/simple-boot/decorators/SimDecorator';

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
    public otherInstanceSim?: Map<ConstructorType<any> | Function | SimConfig | Symbol, any>
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

  async makePage(url = this.welcomUrl) {
    const domParserInitializer = new DomParserInitializer(this.config.frontDistPath, this.config.frontDistIndexFileName || 'index.html', { url: url });
    const window = await domParserInitializer.run();
    // window.document.querySelector('#app').setAttribute(('vvv'),'zzz')
    // console.log('vvv', window.document.querySelector('#app'))
    // console.log('------', window.document.documentElement.outerHTML);
    return { window, domParserInitializer };
    // const jsdom = await new JsdomInitializer(
    //   this.config.frontDistPath,
    //   this.config.frontDistIndexFileName || 'index.html',
    //   { url: this.welcomUrl }
    // ).run();
    // return { window: jsdom.window as any, domParserInitializer: {destroy: () => {jsdom.window.close()}} };
    // return jsdom;
  }

  async makeFront(window: Window, otherInstanceSim?: Map<Function | ConstructorType<any> | SimConfig | Symbol, any>) {
    const name = RandomUtils.uuid();
    (window as any).ssrUse = false;
    const option = this.config.factorySimFrontOption(DomRenderProxy.final(window));
    const domExcludes = [RequestResponse, ...(this.config.domExcludes || [])];
    const simpleBootFront = await this.config.factory.create(option, this.config.using, domExcludes);
    otherInstanceSim ??= new Map<Function | ConstructorType<any> | SimConfig | Symbol, any>();
    this.otherInstanceSim?.forEach((v, k) => otherInstanceSim!.set(k, v));

    simpleBootFront.run(otherInstanceSim);
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

  async proceedBefore({ rr, app }: { rr: RequestResponse; app: SimpleBootHttpServer; carrier: Map<string, any> }) {
    if (this.config.ssrExcludeFilter?.(rr)) {
      return false;
    }
    if (rr.reqHasAcceptHeader(Mimes.TextHtml) || rr.reqHasAcceptHeader(Mimes.All)) {
      // if (this.simpleBootFrontQueue.isEmpty()) {
      //   await this.pushQueue();
      // }
      // const simpleBootFront = await this.simpleBootFrontQueue.dequeue();
      const url = rr.reqUrlObj({ host: 'localhost' });
      const targetUrl = url.toString() ?? this.welcomUrl;
      const { window, domParserInitializer } = await this.makePage(targetUrl);
      const otherSim = new Map<Function | ConstructorType<any> | SimConfig | Symbol, any>();
      otherSim.set(RequestResponse, rr);
      const simpleBootFront = await this.makeFront(window, otherSim);
      try {
        (simpleBootFront.option.window as any).ssrUse = true;
        // console.log(simpleBootFront.routing)
        if (this.config.simpleBootFront?.notFoundError) {
          // intent router check first
          const intent = await simpleBootFront.routingRouterModule(url.pathname);
          // route를 못찾은상태에서 router path까지 안맞으면 404 처리한다.  route랑 router랑 다르니깐 헛갈리지말도록
          if (intent.module === undefined && !intent.getRouterPathData(rr.reqUrlPathName)) {
            throw new NotFoundError({ message: `Not Found: ${rr.reqUrlPathName}` });
          }
        }

        const data = await firstValueFrom(
          simpleBootFront.routingObservable.pipe(
            filter(it => {

              const sw = it.triggerPoint === 'end' && typeof it.routerModule.intent.uri === 'string' && targetUrl.endsWith(it.routerModule.intent.uri);
              return sw;
            }),
            // delay(1000),
            first()
          )
        );

        // [아키텍트님의 정석] 하이드레이션 데이터를 가상 윈도우의 body에 script 태그로 박제
        // @ts-ignore: writeDataHydration is part of the 정석
        simpleBootFront.writeDataHydration();
        simpleBootFront.clearDataHydration();

        const html = this.makeHTML(simpleBootFront);
        await this.writeOkHtmlAndEnd({ rr }, html);
      } finally {
        try {
          (simpleBootFront.option.window as any).ssrUse = false;
          window.close();
          simpleBootFront.onDestroy();

          // window.close()만 호출하면 WindowBase.close()가 실행되어 메모리 정리됨
          (simpleBootFront.option.window as any)?.close?.();
          domParserInitializer.destroy();
        } catch (e) {
          console.log('eeeeee', e);
        }

        // const index = this.simpleBootPool.indexOf(simpleBootFront);
        // if (index > -1) {
        //   this.simpleBootPool.splice(index, 1);
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

    // [아키텍트님의 정석]
    // body에 직접 append된 script tag가 outerHTML에 이미 포함되어 있으므로 추가 조작은 불필요합니다.

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
