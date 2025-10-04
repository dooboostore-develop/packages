import fs from 'fs';
import path from 'path';
import { parseHTML } from 'linkedom';

export class LinkedomInitializer {
  constructor(
    private frontDistPath: string,
    private frontDistIndexFileName: string,
    private reconfigureSettings?: {url: string}
  ) {}

  public static loadFile(distPath: string, filePath: string): string {
    return fs.readFileSync(path.join(distPath, filePath), 'utf8');
  }

  async run(): Promise<Window> {
    // const indexHTML = fs.readFileSync(path.join(this.frontDistPath, 'index.html'), 'utf8');
    // const indexHTML = JsdomInitializer.loadFile(this.frontDistPath, this.frontDistIndexFileName);
    const pathStr = path.join(this.frontDistPath, this.frontDistIndexFileName);

    const html = fs.readFileSync(pathStr,'utf8');

    const w = parseHTML(html);
    // @ts-ignore
    // w.location ??= { href: 'about:blank'};
    // if(this.reconfigureSettings?.url){
      // console.log('--',w,w.location);
      // @ts-ignore
      // w.location.href = this.reconfigureSettings.url;
    // }
    // console.log('!!!!!!!!!!!', html, w.document);
    // @ts-ignore
    global.document = w.document;
    // @ts-ignore
    global.window = w as unknown as Window & typeof globalThis;
    // @ts-ignore
    global.window.requestAnimationFrame = () => {};
    global.window.scrollTo = () => {};
    // @ts-ignore
    global.history = w.history;
    global.Event = w.Event;
    // @ts-ignore
    global.PopStateEvent = w.Event;
    global.IntersectionObserver = w.IntersectionObserver;
    // @ts-ignore
    // global.Error = ErrorBase;
    // @ts-ignore
    // global.navigator = w.navigator;
    global.NodeFilter = w.NodeFilter;
    global.Node = w.Node;
    global.DocumentFragment = w.DocumentFragment;
    global.HTMLElement = w.HTMLElement;
    global.HTMLMetaElement = w.HTMLMetaElement;
    global.Element = w.Element;
    global.HTMLCanvasElement = w.HTMLCanvasElement;
    global.HTMLCanvasElement.prototype.getContext = () => {
      return null;
    };
    global.CanvasRenderingContext2D = w.CanvasRenderingContext2D;
    global.CanvasPattern = w.CanvasPattern;
    global.CanvasGradient = w.CanvasGradient;
    global.Path2D = w.Path2D;
    global.ImageData = w.ImageData;
    // console.log('cvvvvvvvvvvvvvv', w.Node.DOCUMENT_FRAGMENT_NODE);
    return w;
  }
}
//
// export default new JsdomInitializer();
