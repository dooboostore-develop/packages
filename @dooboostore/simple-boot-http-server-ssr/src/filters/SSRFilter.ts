import {RequestResponse} from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import {HttpHeaders} from '@dooboostore/simple-boot-http-server/codes/HttpHeaders';
import {SimpleBootHttpSSRFactory} from '../SimpleBootHttpSSRFactory';
import {ConstructorType} from '@dooboostore/core/types';
import {JsdomInitializer} from '../initializers/JsdomInitializer';
import {Filter} from '@dooboostore/simple-boot-http-server/filters/Filter';
import {Mimes} from '@dooboostore/simple-boot-http-server/codes/Mimes';
import {HttpStatus} from '@dooboostore/simple-boot-http-server/codes/HttpStatus';
import {SimpleBootHttpServer} from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import {SimFrontOption} from '@dooboostore/simple-boot-front/option/SimFrontOption';
import {SimpleBootFront} from '@dooboostore/simple-boot-front/SimpleBootFront';
import {AsyncBlockingQueue} from '@dooboostore/simple-boot/queues/AsyncBlockingQueue';
import {RandomUtils} from '@dooboostore/core/random/RandomUtils';
import * as JSDOM from 'jsdom';

export type FactoryAndParams = {
    frontDistPath: string;
    frontDistIndexFileName?: string;
    factorySimFrontOption: (window: any) => SimFrontOption;
    factory: SimpleBootHttpSSRFactory;
    poolOption: {
        max: number;
        min: number;
    }
    using: ConstructorType<any>[];
    domExcludes: ConstructorType<any>[];
    ssrExcludeFilter?: (rr: RequestResponse) => boolean;
}
export class SSRFilter implements Filter {
    private simpleBootFrontPool: SimpleBootFront[] = [];
    private simpleBootFrontQueue = new AsyncBlockingQueue<SimpleBootFront>();
    private indexHTML: string;
    private welcomUrl = 'http://localhost'
    constructor(public factory: FactoryAndParams, public otherInstanceSim?: Map<ConstructorType<any>, any>) {
        factory.frontDistIndexFileName = factory.frontDistIndexFileName || 'index.html';
        this.indexHTML = JsdomInitializer.loadFile(this.factory.frontDistPath, factory.frontDistIndexFileName);
    }

    async onInit(app: SimpleBootHttpServer) {
        for (let i = 0; i < this.factory.poolOption.min; i++) {
            await this.pushQueue()
        }
        // console.log('SimpleBootHttpSSRFactory init success ', + this.simpleBootFrontPool.length)
    }


    // workerTs(workerOptions: WorkerOptions) {
    //     workerOptions.eval = true;
    //     if (!workerOptions.workerData) {
    //         workerOptions.workerData = {};
    //     }
    //     workerOptions.workerData.__filename = '/Users/hyunhakim/source/visualkhh/pet-space/libs/simple-boot-http-ssr/dist/filters/SSRCreatorWorker.js';
    //     return new Worker(` const wk = require('worker_threads'); require('ts-node').register(); let file = wk.workerData.__filename; require(file); `, workerOptions,);
    // }

    async makeJsdom() {
        const jsdom = await new JsdomInitializer(this.factory.frontDistPath, this.factory.frontDistIndexFileName || 'index.html', {url: this.welcomUrl}).run();
        return jsdom;
    }

    async makeFront(jsdom: JSDOM.JSDOM) {
        const name = RandomUtils.uuid();
        // const jsdom = await this.makeJsdom();
        const window = jsdom.window as unknown as Window & typeof globalThis;
        (window as any).ssrUse = false;
        const option = this.factory.factorySimFrontOption(window);
        const simpleBootFront = await this.factory.factory.create(option, this.factory.using, this.factory.domExcludes);
        simpleBootFront.run(this.otherInstanceSim);
        (simpleBootFront as any).jsdom = jsdom;
        return simpleBootFront;
    }

    enqueueFrontApp(simpleBootFront: SimpleBootFront) {
        // this.simpleBootFrontPool.set(simpleBootFront.option.name!, simpleBootFront);
        this.simpleBootFrontPool.push(simpleBootFront);
        this.simpleBootFrontQueue.enqueue(simpleBootFront);
    }

    // async pushQueue(destorFront?: SimpleBootFront) {
    //     if (destorFront) {
    //         this.simpleBootFrontPool.delete(destorFront.option.name!);
    //     }
    async pushQueue() {
        if (this.simpleBootFrontPool.length < this.factory.poolOption.max) {
            this.enqueueFrontApp(await this.makeFront(await this.makeJsdom()));
        }
    }

    async before(rr: RequestResponse) {
        if (this.factory.ssrExcludeFilter?.(rr)) {
            return false;
        }
        if ((rr.reqHasAcceptHeader(Mimes.TextHtml) || rr.reqHasAcceptHeader(Mimes.All))) {
            if (this.simpleBootFrontQueue.isEmpty()) {
                await this.pushQueue();
            }
            const simpleBootFront = await this.simpleBootFrontQueue.dequeue();
            try {
                // console.log('SSRFilter before-->' , simpleBootFront.option.name, 'poolLength:',this.simpleBootFrontPool.size);
                (simpleBootFront.option.window as any).ssrUse = true;
                delete (simpleBootFront.option.window as any).server_side_data;

                // runRouting!!
                await simpleBootFront.goRouting(rr.reqUrl);
                await new Promise((r)=> setTimeout(r, 0)); // <--중요: 이거 넣어야지 두번불러지는게 없어지는듯? 뭐지 event loop 변경된건가?
                let html = simpleBootFront.option.window.document.documentElement.outerHTML;
                const serverSideData = (simpleBootFront.option.window as any).server_side_data;
                if (serverSideData) {
                    const data = Object.entries(serverSideData).map(([k, v]) => {
                        if (typeof v === 'string') {
                            return `window.server_side_data.${k} = ${v}`;
                        } else {
                            return `window.server_side_data.${k} = ${JSON.stringify(v)}`;
                        }
                    }).join(';');
                    if (data) {
                        html = html.replace('</head>', `<script> window.server_side_data={}; ${data}; </script></head>`);
                    }
                }
                await this.writeOkHtmlAndEnd({rr}, html);
            } finally {
                (simpleBootFront.option.window as any).ssrUse = false;
                delete (simpleBootFront.option.window as any).server_side_data;
                // console.log('--------->', simpleBootFront.option.window)
                // simpleBootFront.ninitWriteRootRouter();
                // ((simpleBootFront as any).jsdom as JSDOM.JSDOM)?.reconfigure({url: '/' });
                // simpleBootFront.option.window.location.href = 'about:blank';
                this.simpleBootFrontQueue.enqueue(simpleBootFront);
                // simpleBootFront.option.window.document.body.innerHTML = this.rootJSDOM.window.document.body.innerHTML;
                // simpleBootFront.writeRootRouter()
                // await simpleBootFront.goRouting('/');

                // ((simpleBootFront as any).jsdom as JSDOM.JSDOM)?.reconfigure({url: this.welcomUrl });

                // simpleBootFront.option.window.location.href = this.welcomUrl;
                // simpleBootFront.option.window.document.documentElement.outerHTML = this.indexHTML;
                // this.simpleBootFrontQueue.enqueue(simpleBootFront);
                // await new Promise((re, r) => setTimeout(() => re(true), 10000));
                // new Promise((re, r) => setTimeout(() => re(true), 10000)).then(it => {
                //     console.log('ddddddddddd')
                // });
                // this.simpleBootFrontPool.delete(simpleBootFront.option.name!);
                // if (isMainThread) { // 메인 스레드
                //     console.log('file-->', __filename)
                //     const worker = new Worker(__filename);
                //     worker.on('message', (value: any) => {
                //         console.log('워커로부터', value)
                //     })
                //     worker.on('exit', (value: any) => { // parentPort.close()가 일어나면 이벤트 발생
                //         console.log('워커 끝~');
                //     })
                //     worker.postMessage('ping'); // 워커스레드에게 메세지를 보낸다.
                // } else { // 워커스레드
                //     parentPort.on('message', (value: any) => {
                //         console.log("부모로부터", value);
                //         parentPort.postMessage('pong');
                //         parentPort.close(); // 워커스레드 종료라고 메인스레드에 알려줘야 exit이벤트 발생
                //     })
                // }


                //worker thrad
                // const workerPath = path.join(__dirname, 'SSRWorker.js');
                // const worker = new Worker(workerPath);
                // worker.once('message', (value: any) => {
                //     console.log('워커로부터', value)
                // });
                // const receiveWorker = new Worker('/Users/hyunhakim/source/visualkhh/pet-space/libs/simple-boot-http-ssr/dist/filters/SSRCreatorWorker.js');
                // receiveWorker.on('message', (msg: JSDOM.JSDOM)=>{
                //     console.log('워커로부터', msg, msg.window.document.body.innerHTML)
                //     console.log('a message is sent! : ', msg)
                //
                // });
                //
                // receiveWorker.on('error', err=>{
                //     console.error(err);
                // })
                //
                // receiveWorker.on('exit', ()=>console.log('exited!'));
                // receiveWorker.postMessage(
                //     {
                //         frontDistPath: this.factory.frontDistPath,
                //         frontDistIndexFileName: this.factory.frontDistIndexFileName,
                //     }
                // );

                // const myWorkers = this.workerTs({});
                // myWorkers.postMessage(this);
                // myWorkers.on('message', (value: SimpleBootFront) => {
                //     this.pushQueue(value);
                // })
                // this
                // this.pushQueue(simpleBootFront).then(it => {
                //     console.log('deee')
                // });
                // console.log('-1->', simpleBootFront.option.window.location.href);
                // simpleBootFront.option.window.location.href = this.welcomUrl;
                // simpleBootFront.option.window.location.reload();
                // console.log('-2->', simpleBootFront.option.window.location.href);
                // simpleBootFront.option.window.location.reload();
                // console.log('-3->', simpleBootFront.option.window.location.href);
                // this.simpleBootFrontQueue.enqueue(simpleBootFront);
                // await this.makeJsdom();
                // simpleBootFront.option.window.location.href = this.welcomUrl;
            }
            // console.log('----doen')
            return false;
        } else {
            // console.log('----doen2')
            return true;
        }
    }

    async writeOkHtmlAndEnd({rr, status = HttpStatus.Ok}: {rr: RequestResponse, status?: HttpStatus}, html: string) {
        // rr.res.writeHead(status, {[HttpHeaders.ContentType]: Mimes.TextHtml});
        rr.resStatusCode(status);
        rr.resSetHeader(HttpHeaders.ContentType, Mimes.TextHtml);
        await rr.resEnd(html);
    }

    async after(rr: RequestResponse, app: SimpleBootHttpServer, sw: boolean) {
        // console.log('done--------', sw)
        return sw;
    }

}
