import { Filter } from '../filters/Filter';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { HttpHeaders } from '../codes/HttpHeaders';
import { HttpStatus } from '../codes/HttpStatus';
import { SimpleBootHttpServer } from '../SimpleBootHttpServer';
import { RequestResponse } from '../models/RequestResponse';

export type RequestFilterType = string | RegExp | ((rr: RequestResponse, app: SimpleBootHttpServer) => boolean) | ((rr: RequestResponse, app: SimpleBootHttpServer) => Promise<boolean>);

export class ResourceFilter implements Filter {
    constructor(private resourceDistPath: string, private resourceRegex: (RequestFilterType | { request: RequestFilterType, dist: string })[] = []) {
    }

    async onInit(app: SimpleBootHttpServer) {
    }

    async proceedBefore({rr, app}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) {
        const url = (rr.reqUrlPathName ?? '').replace(/\.\./g, '');
        const urlObj = rr.reqUrlObject;
        // const requestUrl = parse(rr.reqUrl ?? '', true);
        let sw = true;
        const regExps = this.resourceRegex.filter(it => {
            if (it instanceof RegExp) {
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
                }
                return RegExp(it.request).test(url);
            }
        })
        // console.log('regExps', regExps, url, this.resourceRegex);
        // eslint-disable-next-line no-unused-vars
        for (const it of regExps) {
            const resourcePath = path.join(this.resourceDistPath, typeof it === 'object' && 'dist' in it ? it.dist : urlObj.pathname);
            // console.log('ResourceFilter', resourcePath, it, urlObj.pathname, url);
            sw = false;
            // console.log('-----', resourcePath);
            if (fs.existsSync(resourcePath)) {
                // const header = {} as any;
                // header[HttpHeaders.ContentType] = mime.lookup(resourcePath);
                // res.writeHead(HttpStatus.Ok, header);
                rr.resStatusCode(HttpStatus.Ok);
                rr.resSetHeader(HttpHeaders.ContentType, mime.lookup(resourcePath).toString());
                await rr.resEnd(fs.readFileSync(resourcePath));
                break;
            } else {
                rr.resStatusCode(HttpStatus.NotFound)
                await rr.resEnd();
                break;
            }
            sw = false;
        }
        return sw;
    }

    async proceedAfter({rr, app}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) {
        return true;
    }
}
