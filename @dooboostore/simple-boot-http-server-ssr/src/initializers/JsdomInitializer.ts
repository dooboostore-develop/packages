import * as JSDOM from 'jsdom';
import fs from 'fs';
import path from 'path';

import {ReconfigureSettings} from 'jsdom';
import { UrlUtils } from '@dooboostore/core';

export class JsdomInitializer {
    constructor(private frontDistPath: string, private frontDistIndexFileName: string, private reconfigureSettings?:ReconfigureSettings) {
    }

    public static loadFile(distPath: string, filePath: string): string {
        return fs.readFileSync(path.join(distPath, filePath), 'utf8');
    }

    async run(): Promise<JSDOM.JSDOM> {
        // const indexHTML = fs.readFileSync(path.join(this.frontDistPath, 'index.html'), 'utf8');
        // const indexHTML = JsdomInitializer.loadFile(this.frontDistPath, this.frontDistIndexFileName);
        const pathStr = path.join(this.frontDistPath, this.frontDistIndexFileName);


        const jsdom = await JSDOM.JSDOM.fromFile(pathStr, {});
        if (this.reconfigureSettings) {
            jsdom.reconfigure(this.reconfigureSettings);
        }
        // devDependencies
        // "@types/jsdom": "^21.1.2",
        // "canvas": "^3.1.0",
        // global setting
        // @ts-ignore
        global.document = jsdom.window.document;
        // @ts-ignore
        global.window = jsdom.window as unknown as Window & typeof globalThis;
        // @ts-ignore
        global.window.requestAnimationFrame = () => {};
        global.window.scrollTo = () => {};
        // const originalPushState = global.window.history.pushState;
        // global.window.history.pushState = (data: any,title: any,path: string) => {
        //   console.log('----iida',path)
        //   path.replace()
        //
        //   let s = `${UrlUtils.origin(global.window.location.href)}${path?`${path}`:''}`;
        //   console.log('----da',s)
        //   originalPushState.apply(global.window.history, [data, title, s]);
        // }
        // const originalReplaceState = global.window.history.replaceState;
        // global.window.history.replaceState = (data: any,title: any,path: string) => {
        //   let s = `${UrlUtils.origin(global.window.location.href)}${path?`${path}`:''}`;
        //   originalReplaceState.apply(global.window.history, [data, title, s]);
        // }
        // const dummyResponse = {ok: false, json: () => Promise.resolve({})}; // as Response;
        // global.fetch = (...data: any): Promise<any> => {
        //   console.log('dummy fetch')
        //   return Promise.resolve(dummyResponse)
        // };
        // @ts-ignore
        global.history = jsdom.window.history;
        global.Event = jsdom.window.Event;
        // @ts-ignore
        global.PopStateEvent = jsdom.window.Event;
        global.IntersectionObserver = jsdom.window.IntersectionObserver;
        // @ts-ignore
        // global.Error = ErrorBase;
        // @ts-ignore
        // global.navigator = jsdom.window.navigator;
        global.NodeFilter = jsdom.window.NodeFilter;
        global.Node = jsdom.window.Node;
        global.HTMLElement = jsdom.window.HTMLElement;
        global.HTMLMetaElement = jsdom.window.HTMLMetaElement;
        global.Element = jsdom.window.Element;
        global.HTMLCanvasElement = jsdom.window.HTMLCanvasElement;
        global.HTMLCanvasElement.prototype.getContext = () => {
            return null;
        }
        global.CanvasRenderingContext2D = jsdom.window.CanvasRenderingContext2D;
        global.CanvasPattern = jsdom.window.CanvasPattern;
        global.CanvasGradient = jsdom.window.CanvasGradient;
        global.Path2D = jsdom.window.Path2D;
        global.ImageData = jsdom.window.ImageData;
        return jsdom;
    }
}
//
// export default new JsdomInitializer();
