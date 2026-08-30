export class LocationBase implements Location {
  private _href: string = 'about:blank';
  private _protocol: string = 'about:';
  private _host: string = '';
  private _hostname: string = '';
  private _port: string = '';
  private _pathname: string = 'blank';
  private _search: string = '';
  private _hash: string = '';
  private _origin: string = 'null';
  private _urlChangeCallback?: (url: string) => void;
  private _hashChangeCallback?: (oldUrl: string, newUrl: string) => void;

  constructor(initialUrl: string = 'about:blank', urlChangeCallback?: (url: string) => void) {
    this._urlChangeCallback = urlChangeCallback;
    this.parseUrl(initialUrl);
  }

  setHashChangeCallback(cb: (oldUrl: string, newUrl: string) => void): void {
    this._hashChangeCallback = cb;
  }

  // DOMStringList stub – browsers expose this as a read-only live list of
  // ancestor origins, but in SSR there are no frames so it is always empty.
  readonly ancestorOrigins: DOMStringList = {
    length: 0,
    item: (_index: number) => null,
    contains: (_string: string) => false,
    [Symbol.iterator]: function* () {},
  } as unknown as DOMStringList;

  get href(): string {
    return this._href;
  }

  set href(url: string) {
    const oldHref = this._href;
    const oldHash = this._hash;
    this.parseUrl(url);
    if (this._href !== oldHref) {
      this._urlChangeCallback?.(this._href);
      if (this._hash !== oldHash) {
        this._hashChangeCallback?.(oldHref, this._href);
      }
    }
  }

  get protocol(): string {
    return this._protocol;
  }
  set protocol(value: string) {
    if (!value.endsWith(':')) value += ':';
    this._protocol = value;
    this.reconstructUrl();
  }

  get host(): string {
    return this._host;
  }
  set host(value: string) {
    this._host = value;
    const colonIndex = value.lastIndexOf(':');
    if (colonIndex !== -1 && colonIndex > value.lastIndexOf(']')) {
      this._hostname = value.substring(0, colonIndex);
      this._port = value.substring(colonIndex + 1);
    } else {
      this._hostname = value;
      this._port = '';
    }
    this.reconstructUrl();
  }

  get hostname(): string {
    return this._hostname;
  }
  set hostname(value: string) {
    this._hostname = value;
    this._host = this._port ? `${value}:${this._port}` : value;
    this.reconstructUrl();
  }

  get port(): string {
    return this._port;
  }
  set port(value: string) {
    this._port = value;
    this._host = value ? `${this._hostname}:${value}` : this._hostname;
    this.reconstructUrl();
  }

  get pathname(): string {
    return this._pathname;
  }
  set pathname(value: string) {
    if (!value.startsWith('/')) value = '/' + value;
    this._pathname = value;
    this.reconstructUrl();
  }

  get search(): string {
    return this._search;
  }
  set search(value: string) {
    if (value && !value.startsWith('?')) value = '?' + value;
    this._search = value;
    this.reconstructUrl();
  }

  get hash(): string {
    return this._hash;
  }
  set hash(value: string) {
    if (value && !value.startsWith('#')) value = '#' + value;
    this._hash = value;
    this.reconstructUrl();
  }

  get origin(): string {
    return this._origin;
  }

  assign(url: string): void {
    const oldHref = this._href;
    const oldHash = this._hash;
    this.parseUrl(url);
    if (this._href !== oldHref) {
      this._urlChangeCallback?.(this._href);
      if (this._hash !== oldHash) {
        this._hashChangeCallback?.(oldHref, this._href);
      }
    }
  }

  replace(url: string): void {
    this.assign(url);
  }

  reload(_forcedReload?: boolean): void {}

  toString(): string {
    return this._href;
  }

  parseUrl(url: string): void {
    try {
      let parsedUrl: URL;
      if (url.startsWith('//')) {
        parsedUrl = new URL(this._protocol + url);
      } else if (url.startsWith('/')) {
        parsedUrl = new URL(url, `${this._protocol}//${this._host}`);
      } else if (url.includes('://')) {
        parsedUrl = new URL(url);
      } else {
        const base = `${this._protocol}//${this._host}${this._pathname}`;
        parsedUrl = new URL(url, base);
      }
      this._href = parsedUrl.href;
      this._protocol = parsedUrl.protocol;
      this._host = parsedUrl.host;
      this._hostname = parsedUrl.hostname;
      this._port = parsedUrl.port;
      this._pathname = parsedUrl.pathname;
      this._search = parsedUrl.search;
      this._hash = parsedUrl.hash;
      this._origin = parsedUrl.origin;
    } catch (e) {
      if (url === 'about:blank') {
        this._href = 'about:blank';
        this._protocol = 'about:';
        this._host = '';
        this._hostname = '';
        this._port = '';
        this._pathname = 'blank';
        this._search = '';
        this._hash = '';
        this._origin = 'null';
      }
    }
  }

  private reconstructUrl(): void {
    try {
      let url = this._protocol;
      if (this._protocol !== 'about:' && this._protocol !== 'data:') {
        url += '//';
        if (this._host) url += this._host;
      }
      url += this._pathname;
      url += this._search;
      url += this._hash;
      const testUrl = new URL(url);
      this._href = testUrl.href;
      this._origin = testUrl.origin;
    } catch (e) {}
  }
}
