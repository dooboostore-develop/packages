import { LocationBase } from './LocationBase';

export class HistoryBase implements History {
  length: number = 1;
  state: any = null;
  scrollRestoration: ScrollRestoration = 'auto';

  private window: Window;
  private historyStack: Array<{ state: any; title: string; url?: string }> = [];
  private currentIndex: number = -1;

  constructor(window: Window) {
    this.window = window;
  }

  back(): void {
    this.go(-1);
  }

  forward(): void {
    this.go(1);
  }

  go(delta?: number): void {
    if (!delta || this.historyStack.length === 0) return;
    const newIndex = this.currentIndex + delta;
    if (newIndex >= 0 && newIndex < this.historyStack.length) {
      // bfcache 시뮬레이션: pagehide(persisted=true) → popstate → pageshow(persisted=true)
      this.window.dispatchEvent(this._createPageTransitionEvent('pagehide', true));

      this.currentIndex = newIndex;
      const entry = this.historyStack[this.currentIndex];
      this.state = entry.state;

      if (entry.url) {
        (this.window.location as unknown as LocationBase).parseUrl(entry.url);
      }

      this.window.dispatchEvent({
        type: 'popstate',
        state: entry.state,
        url: entry.url,
        target: this.window,
        currentTarget: this.window,
      } as any);

      this.window.dispatchEvent(this._createPageTransitionEvent('pageshow', true));
    }
  }

  pushState(data: any, title: string, url?: string | URL | null): void {
    this.historyStack = this.historyStack.slice(0, this.currentIndex + 1);
    const urlStr = url != null ? String(url) : undefined;
    this.historyStack.push({ state: data, title, url: urlStr });
    this.currentIndex = this.historyStack.length - 1;
    this.state = data;
    this.length = this.historyStack.length;

    if (urlStr) {
      // href setter를 통해 처리 → urlChangeCallback/hashChangeCallback 자동 호출
      (this.window.location as unknown as LocationBase).parseUrl(urlStr);
    }
  }

  replaceState(data: any, title: string, url?: string | URL | null): void {
    const urlStr = url != null ? String(url) : undefined;
    if (this.currentIndex >= 0 && this.currentIndex < this.historyStack.length) {
      this.historyStack[this.currentIndex] = { state: data, title, url: urlStr };
    } else {
      this.historyStack = [{ state: data, title, url: urlStr }];
      this.currentIndex = 0;
      this.length = 1;
    }
    this.state = data;

    if (urlStr) {
      // href setter를 통해 처리 → urlChangeCallback/hashChangeCallback 자동 호출
      (this.window.location as unknown as LocationBase).parseUrl(urlStr);
    }
  }

  private _createPageTransitionEvent(type: 'pageshow' | 'pagehide', persisted: boolean): any {
    return {
      type,
      persisted,
      target: this.window,
      currentTarget: this.window,
      bubbles: false,
      cancelable: false,
      defaultPrevented: false,
      timeStamp: Date.now(),
      preventDefault() { (this as any).defaultPrevented = true; },
    };
  }
}
