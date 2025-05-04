import { Sim } from '../decorators/SimDecorator';
import { SimpleApplication } from '../SimpleApplication';
import {   findCacheByKey as CfindCacheByKey,
  findCacheByKeyStartWith as CfindCacheByKeyStartWith,
  deleteCacheByKey as CdeleteCacheByKey,
  deleteCacheByKeyStartWith as CdeleteCacheByKeyStartWith, } from '../decorators/cache/CacheDecorator';

@Sim
export class CacheManager {
  constructor(private simpleApplication: SimpleApplication) {
    // console.log('CacheManager constructor', simpleApplication);
  }


  findCacheByKey(key: string){
    return CfindCacheByKey(this.simpleApplication, key);
  }

  findCacheByKeyStartWith(key: string){
    return CfindCacheByKeyStartWith(this.simpleApplication, key);
  }

  deleteCacheByKey(key: string){
    return CdeleteCacheByKey(this.simpleApplication, key);
  }

  deleteCacheByKeyStartWith(key: string){
    return CdeleteCacheByKeyStartWith(this.simpleApplication, key)
  }

}