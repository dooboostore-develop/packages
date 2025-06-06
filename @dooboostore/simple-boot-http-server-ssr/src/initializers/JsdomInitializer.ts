import * as JSDOM from 'jsdom';
import fs from 'fs';
import path from 'path';

import {ReconfigureSettings} from 'jsdom';

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
        global.window.requestAnimationFrame = () => {}
        const dummyResponse = {ok: false, json: () => Promise.resolve({})}; // as Response;
        global.fetch = (...data: any): Promise<any> => Promise.resolve(dummyResponse);
        // @ts-ignore
        global.history = jsdom.window.history;
        global.Event = jsdom.window.Event;
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
