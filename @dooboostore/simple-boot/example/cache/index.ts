import { Expression } from '@dooboostore/core/expression/Expression';
import { Cache } from '@dooboostore/simple-boot/decorators/cache/CacheDecorator';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Storage } from '@dooboostore/core/storage/Storage';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { SimOption } from '@dooboostore/simple-boot/SimOption';
import { ConstructorType } from '@dooboostore/core/types';
import { MemoryStorage } from '@dooboostore/core/storage/MemoryStorage';
import { Promises } from '@dooboostore/core/promise';
import { CacheManager } from '@dooboostore/simple-boot/cache/CacheManager';

@Sim
class MyStore implements Storage {
  [name: string]: any;

  readonly length: number;

  clear(): void {
  }

  getItem(key: string): string | null {
    return undefined;
  }

  key(index: number): string | null {
    return undefined;
  }

  removeItem(key: string): void {
  }

  setItem(key: string, value: string): void {
  }

}

class MyStoreA {

}

@Sim
class WOW {



  // @Cache({
  //   // key: 'good',
  //   // key: (s, age) => '',
  //   key: (s: string, age: number) => {
  //     return `good-${s}-${age}`
  //   },
  //   // key: {
  //     // key: (s, age) => '',
  //     // childrenKey: (s, age) => ({key: '', data: 'a'}),
  //   // }
  //   // ms: 21000
  // })
  // good(s: string, age: number): string {
  //   console.log('call-->good');
  //   return `WOW ${s}` + this;
  // }
  //
  // @Cache<WOW['deleteGood']>({
  //   // key: 'good',
  //   // key: (s, age) => '',
  //   deleteKey: (s: string, age: number) => {
  //     return `good-${s}-${age}`
  //   },
  //   // key: {
  //   // key: (s, age) => '',
  //   // childrenKey: (s, age) => ({key: '', data: 'a'}),
  //   // }
  //   // ms: 10000
  // })
  // deleteGood(s: string, age: number): void {
  //   console.log('call-->deleteGood');
  // }
  //
  // @Cache<WOW['good']>({
  //   key: (s: string, age: number) => `xx-${s}-${age}`,
  //   // ms: 11000
  // })
  // xx(s: string, age: number): string {
  //   console.log('call-->xx');
  //   return `xx ${s}` + this;
  // }


  // @Cache<WOW['goods']>({
  //   key: {
  //     key: (s: string) => `goods`,
  //     childrenKey(r: {seq: number,name: string, age:number}[]) {
  //       return r.map(it => {
  //         return {key: `${it.seq}`, data: it};
  //       })
  //     }
  //   },
  // })
  // goods(keyword: string): {seq: number, name: string, age:number}[] {
  //   console.log('call-->goods');
  //   return [
  //     {seq:1, name: 'ssss1', age: 11},
  //     {seq:2, name: 'ssss2', age: 12},
  //     {seq:3, name: 'ssss3', age: 13},
  //   ];
  // }
  //
  // @Cache<WOW['deleteGoods']>({
  //   deleteKey: `goods`
  // })
  // deleteGoods(keyword: string): {seq: number,name: string, age:number} {
  //   console.log('call-->deleteGoods');
  //   return {seq: 1, name: 'ssss1', age: 11};
  // }
  // @Cache<WOW['deleteGoods']>({
  //   deleteKey: {
  //     key: (s: string) => `goods`,
  //     childrenKey(r: {seq: number,name: string, age:number}) {
  //       return `goods-${r.seq}`;
  //     }
  //   },
  // })
  // deleteGoods(keyword: string): {seq: number,name: string, age:number} {
  //   console.log('call-->deleteGoods');
  //   return {seq: 1, name: 'ssss1', age: 11};
  //
  // }

  @Cache
  async getNice(): Promise<string> {
    console.log('call-->nice');
    await Promises.sleep(2000)
    return `Nice ` + new Date().toISOString();
  }
  @Cache({
    deleteKey: 'WOW.getNice'
  })
  async deleteNice() {
  }

  // @Cache({
  //   key: 'nice'
  // })
  // async getNice(): Promise<string> {
  //   console.log('call-->nice');
  //   await Promises.sleep(2000)
  //   return `Nice ` + new Date().toISOString();
  // }
  //
  // @Cache({
  //   deleteKey: 'nice'
  // })
  // deleteNice(): void {
  //   console.log('call-->deleteNice');
  // }
}
const m = new Map<string, any>();
const option = new SimOption({
  cache: {
    enable: true,
  }
});
const sim = new SimpleApplication(option);
sim.run();
const wow = sim.sim(WOW)
const cacheManager = sim.sim(CacheManager);
setInterval(async () => {
  // console.log('return:good:', wow.good('World', 10));
  // console.log('return:xx:',wow.xx('Wxxorld', 10));
  // console.log('return:goods:',wow.goods('wow'));
  const data = await wow.getNice()
  console.log('return:nice:',data);
}, 5000)

setInterval(() => {
  // cacheManager.deleteCacheByKey('WOW.getNice');
  // wow.deleteNice();
  // wow.deleteGoods('World')
}, 11000);

// const data = Expression.bindExpression(`Hello $\{name} \${date:ffff}`, {name: 'World', date: (param: string) => new Date().toLocaleDateString() + param});
// console.log(data);