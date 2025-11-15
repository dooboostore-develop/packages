export class Appender<T = any> implements Iterable<T> {
  // eslint-disable-next-line no-undef
  [key: number]: T[] | undefined;

  length = 0;

  keyMap: Map<string, number> = new Map();

  isAppender = true;
  constructor(...defaultDatas: T[]) {
    // console.log('defaultDatas', defaultDatas);
    this.push(...defaultDatas);
    // (this.childs as any).isAppender = true;
  }

  [Symbol.iterator](): Iterator<T> {
    const items = this.getAll();
    let idx = 0;
    return {
      next(value?: any): IteratorResult<T, any> {
        let r: IteratorResult<T> = {value: undefined, done: true};
        if (items.length > idx) {
          r = {value: items[idx], done: false};
        }
        idx++;
        return r;
      }
    }
  }

  get(key: string): T[] | undefined {
    const o = this.keyMap.get(key);
    if (o !== undefined) {
      return this[o];
    }
    return undefined;
  }
  set(key: string, ...v:T[]) {
    const o = this.keyMap.get(key);
    // console.log('set!!', o);
    if (o !== undefined) {
      this[o] = v;
    } else {
      this.keyMap.set(key, this.length);
      // console.log('setPush', v)
      this.push(...v);
    }
  }

  delete(key: string) {
    const o = this.keyMap.get(key);
    if (o !== undefined) {
      this[o] = [];
      this.keyMap.delete(key);
      // this.length--;
    }
  }


  getAll(): T[] {
    return this.getAlls().flat();
  }

  getAlls(): T[][] {
    const map = Array.from({length: this.length}).filter((it, idx) => this[idx]).map((it, idx) => this[idx]);
    return map as T[][];
  }

  push(...items: T[]): void {
    // console.log('----1>', items, items.length, this.length);
    if (items && items.length > 0) {
      (items as any).index = this.length;
      this[this.length++] = items;
      // this[this.length] = [];
    }
    // console.log('----2>', items, items.length, this.length);
    // console.log('---22->', this.length)
    // const appender = this.childs[this.lastIndex];
    // appender.values = items;
    // this.childs.push(new Appender(appender.index + 1));
  }

  // delete(idx: number): void {
  //     // if (idx in this) {
  //     //     console.log('---------dele',idx)
  //     //     delete this[idx];
  //     //     this.length = this.length - 1;
  //     // }
  //     this.length = this.length - 1;
  // }

  // 인덱스 접근을 위한 getter와 setter 추가
  // get(index: number): T | undefined {
  //     return this.storage[index];
  // }
  //
  // set(index: number, value: T): void {
  //     this.storage[index] = value;
  //     this.length = Math.max(this.length, index + 1);
  // }


  clear(): void {
    // console.log('length', this.length);
    for (let i = 0; i < this.length; i++) {
      delete this[i];
    }
    this.keyMap.clear();
    this.length = 0;
  }
}