import { Filter } from '../filters/Filter';
import fs from 'node:fs';
import path from 'node:path';
import mime from 'mime-types';
import { HttpHeaders } from '../codes/HttpHeaders';
import { HttpStatus } from '../codes/HttpStatus';
import { SimpleBootHttpServer } from '../SimpleBootHttpServer';
import { RequestResponse } from '../models/RequestResponse';
import { Blob } from 'node:buffer';

export type RequestFilterType = string | RegExp | ((rr: RequestResponse, app: SimpleBootHttpServer) => boolean) | ((rr: RequestResponse, app: SimpleBootHttpServer) => Promise<boolean>);

type PathDist = RequestFilterType|{request: RequestFilterType, dist: string | ((rr: RequestResponse, app: SimpleBootHttpServer) => string)};

type DataDist = {request: RequestFilterType, response: (rr: RequestResponse, app: SimpleBootHttpServer) => (string | Promise<Blob | ArrayBuffer | Response>)};
export const isPathDist = (item: any): item is PathDist => {
    return typeof item === 'object' && ('request' in item) && ('dist' in item);
};
export const isDataDist = (item: any): item is DataDist => {
    return typeof item === 'object' && ('request' in item) && ('response' in item);
};
export class ResourceFilter implements Filter {
  // private requestFilter: RequestFilterType;
  private resourceDistPath?: string;
  private resources?: (DataDist|PathDist)[];
  constructor(resourceDistPath: string, resourceRegex: PathDist[]);
  constructor(resourceRegex: DataDist[]);
  constructor(resourceDistPathOrResourceRegex: string |  DataDist[], resourceRegex?: PathDist[]) {
    if (typeof resourceDistPathOrResourceRegex === 'string') {
      this.resourceDistPath = resourceDistPathOrResourceRegex;
      this.resources = resourceRegex;
    } else {
      this.resources = resourceDistPathOrResourceRegex;
      // this.requestFilter = resourceDistPathOrResourceRegex
    }
  }
  //   constructor(private resourceDistPath: string, private resourceRegex: (RequestFilterType | { request: RequestFilterType, dist: string | ((rr: RequestResponse, app: SimpleBootHttpServer) => (string|Promise<Blob |ArrayBuffer| Response>)) })[] = []) {
  //   }

    async onInit(app: SimpleBootHttpServer) {
    }

    async proceedBefore({rr, app}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) {
        const url = (rr.reqUrlPathName ?? '').replace(/\.\./g, '');
        const urlObj = rr.reqUrlObject;
        // const requestUrl = parse(rr.reqUrl ?? '', true);
      // console.log('resource filter!!**-------', url);
        let sw = true;
        const regExps = this.resources?.filter(it => {
          // console.log('---it', it, it instanceof RegExp, typeof it)
            if (it instanceof RegExp) {
              // console.log('--------', it.test(url))
                return it.test(url);
            }

            if (typeof it === 'string') {
                return RegExp(it).test(url);
            }

            if (typeof it === 'function') {
                return it(rr, app);
            }

            if (typeof it === 'object' && 'request' in it) {
                if (typeof it.request === 'function') {
                    return it.request(rr, app);
                } else if (it .request instanceof RegExp) {
                    return it.request.test(url);
                } else {
                  return RegExp(it.request).test(url);
                }
            }
        })??[]
        // console.log('regExps', regExps, url);
        // eslint-disable-next-line no-unused-vars
        for (const it of regExps) {
            sw = false;
            //DataDist
            if (isDataDist(it)) {
              let distValue = typeof it.response === 'function' ? it.response(rr,app) : it.response;
              if (distValue instanceof Promise) {
                const result = await distValue;
                if (result instanceof Response) {
                  await rr.resEnd(result);
                  break;
                } else if (result instanceof Blob) {
                  rr.resStatusCode(HttpStatus.Ok);
                  await rr.resEnd(result);
                  break;
                }
              }
            } else {
              //PathDist or undefined
              const dist = typeof it === 'object' && 'dist' in it ? it.dist : urlObj.pathname;
              let distValue = typeof dist === 'function' ? dist(rr, app) : dist;
              if (this.resourceDistPath) {
                // It's a string path
                const resourcePath = path.join(this.resourceDistPath, distValue);
                // console.log('-----------',this.resourceDistPath, resourcePath);
                if (fs.existsSync(resourcePath)) {
                  rr.resStatusCode(HttpStatus.Ok);
                  rr.resSetHeader(HttpHeaders.ContentType, mime.lookup(resourcePath).toString());
                  await rr.resEnd(fs.readFileSync(resourcePath));
                  break;
                } else {
                  rr.resStatusCode(HttpStatus.NotFound);
                  await rr.resEnd();
                  break;
                }
              } else {
                rr.resStatusCode(HttpStatus.InternalServerError);
                await rr.resEnd();
                break;
              }
            }
          sw = true;
        }
        return sw;
    }

    async proceedAfter({rr, app}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) {
      // console.log('resource filter!!end@@**-------');
        return true;
    }
}