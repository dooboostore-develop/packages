import { Filter } from '../filters/Filter';
import { HttpStatus } from '../codes/HttpStatus';
import { RequestResponse } from '../models/RequestResponse';
import { SimpleBootHttpServer } from '../SimpleBootHttpServer';
import * as fs from 'fs';
import * as path from 'path';
import {  FileUtils } from '@dooboostore/core-node/file/FileUtils';
import { ConvertUtils } from '@dooboostore/core-node/convert/ConvertUtils';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';

export type CacheFilterSessionType = { key: string, lifeTime: number, isUpdate: boolean, responseHeaders?: string[] };

type CacheConfigCacheItemType = { path: string, createTime: number, lifeTime: number, responseHeader: { [key: string]: string | number | string[] } };

type KeyAndConfig = { key: string, lifeTime?: number, responseHeaders?: string[] } ;

export class CacheFilter implements Filter {
  public static readonly CARRIER_KEY_NAME = '_CARRIER_CACHE_FILTER_KEY_NAME';
  private storage = new Map<string, string | Buffer>();
  private cacheConfig: {
    createDate: string;
    updateDate: string;
    caches: { [key: string]: CacheConfigCacheItemType }
  }

  constructor(private config: {
    config: {
      cacheDir?: string;
      lifeTime: number;
      startUpClean?: boolean;
    },
    filter?: (rr: RequestResponse, app: SimpleBootHttpServer) => boolean;
    key: (rr: RequestResponse, app: SimpleBootHttpServer) => KeyAndConfig;
  }) {

    if (config.config.cacheDir && config.config.startUpClean) {
      FileUtils.deleteSync(config.config.cacheDir, {options: {recursive: true}});
    }
  }

  async onInit(app: SimpleBootHttpServer) {
  }

  async proceedBefore({rr, app, carrier}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) {
    // this.key = undefined;
    // this.lifeTime = undefined;
    // this.isUpdate = false;
    const filter = this.config.filter?.(rr,app);
    if (!filter) {
      return true;
    }
    if (this.config.config.cacheDir) {
      FileUtils.mkdirSync(this.config.config.cacheDir, {recursive: true});
    }
    if (!this.cacheConfig && this.config.config.cacheDir) {
      try {
        this.cacheConfig = JSON.parse(ConvertUtils.toString(FileUtils.readSync([this.config.config.cacheDir, 'cacheConfig.json'], { option: {encoding: 'utf-8'}})));
      } catch (e) {
      }
    }
    const date = new Date().toISOString();
    this.cacheConfig ??= {
      createDate: date,
      updateDate: date,
      // accessDate: date,
      caches: {}
    };
    this.cacheConfig.createDate ??= date;
    this.cacheConfig.updateDate ??= date;
    // this.cacheConfig.accessDate ??= date;
    this.cacheConfig.caches ??= {};


    const rkey = this.config.key(rr, app);
    // console.log('--path filter', rr.reqMethod(), rr.reqUrlPathName, filter, rkey)
    const sessionData: CacheFilterSessionType = {key: rkey.key, lifeTime: rkey.lifeTime ?? this.config.config.lifeTime, isUpdate: false, responseHeaders: rkey.responseHeaders};


    const cache = this.cacheConfig.caches[sessionData.key];
    if (cache) {
      const existes = this.config.config.cacheDir ? FileUtils.existsSync(cache.path) : this.storage.has(cache.path);
      const diffTime = Date.now() - cache.createTime;
      if (!existes || diffTime > cache.lifeTime) {
        delete this.cacheConfig[sessionData.key];
        this.deleteChunk(cache.path);
        sessionData.isUpdate = true;
      } else {
        rr.resSetHeaders({
          ...cache.responseHeader,
          cacheFilter: `true;remainTime=${cache.lifeTime - diffTime}`
        });
        // console.log('chunk--->',  cache.path);
        try {
          const chunk = this.getChunk(cache.path);
        // console.log('chunk--->',  chunk);
        await rr.resEnd(chunk);
        } catch (e) {
          console.log('--------e', e)
        }
      }
    } else {
      sessionData.isUpdate = true;
    }
    carrier.set(CacheFilter.CARRIER_KEY_NAME, sessionData);
    return sessionData.isUpdate;
  }

  private deleteChunk(path: string) {
    if (this.config.config.cacheDir && FileUtils.existsSync(path)) {
      FileUtils.deleteFileSync(path);
    } else if (this.storage.has(path)) {
      this.storage.delete(path);
    }
  }

  private getChunk(path: string) {
    return this.config.config.cacheDir ? FileUtils.readSync(path) : this.storage.get(path);
  }

  async proceedAfter({rr, app, carrier}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) {
    // const data = await rr.resBodyStringData()
    const sessionData = carrier.get(CacheFilter.CARRIER_KEY_NAME) as CacheFilterSessionType ;
    if (sessionData && sessionData.isUpdate) {
      try {
        if (this.config.config.cacheDir) {
          FileUtils.mkdirSync([this.config.config.cacheDir, 'caches'], {recursive: true});
        }
        const resBody = rr.resBodyData();
        if (!resBody) {
          return true;
        }
        let  p: string | undefined = undefined;
        const destFileUUID = RandomUtils.uuid4();
        p = this.writeChunk(destFileUUID, resBody);
        const updateDateNow = Date.now();
        const updateDate = new Date(updateDateNow).toISOString();
        this.cacheConfig.createDate ??= updateDate;
        this.cacheConfig.updateDate = updateDate;
        const responseHeaders: {[key: string]: string | number | string[]} = {}
        sessionData.responseHeaders?.map(it=>it.toLowerCase()).forEach(it => {
          responseHeaders[it] = rr.resHeader(it);
        })
        this.cacheConfig.caches[sessionData.key] = {
          path: p,
          createTime: updateDateNow,
          lifeTime: sessionData.lifeTime,
          responseHeader: responseHeaders
        };

        if (this.config.config.cacheDir) {
          FileUtils.write(JSON.stringify(this.cacheConfig), {path: [this.config.config.cacheDir, 'cacheConfig.json']});
        }
      } catch (e) {
        console.log('---', e)
      }
    }

    return true;
  }

  private writeChunk(destFileUUID: string, resBody: string | Buffer ) {
    if (this.config.config.cacheDir) {
      return FileUtils.write(resBody, {path: [this.config.config.cacheDir, 'caches', destFileUUID]});
    } else {
      this.storage.set(destFileUUID, resBody);
      return destFileUUID;
    }
  }
}
