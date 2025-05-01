import { Filter } from '../filters/Filter';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { HttpHeaders } from '../codes/HttpHeaders';
import { HttpStatus } from '../codes/HttpStatus';
import { SimpleBootHttpServer } from '../SimpleBootHttpServer';
import { RequestResponse } from '../models/RequestResponse';
import { parse } from 'url';

export class ResourceFilter implements Filter {
    constructor(private resourceDistPath: string, private resourceRegex: (string|RegExp)[] = []) {
    }

    async onInit(app: SimpleBootHttpServer) {
    }

    async before(rr: RequestResponse, app: SimpleBootHttpServer) {
        const url = (rr.reqUrl ?? '').replace(/\.\./g, '');
        const urlObj = rr.reqUrlObject;
        // const requestUrl = parse(rr.reqUrl ?? '', true);
        let sw = true;
        const regExps = this.resourceRegex.filter(it => {
            return it instanceof RegExp ? it.test(url) : RegExp(it).test(url);
        })
        // eslint-disable-next-line no-unused-vars
        for (const it of regExps) {
            const resourcePath = path.join(this.resourceDistPath, urlObj.pathname); // url.replace(it, '')
            sw = false;
            console.log('-----', resourcePath);
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
            }
            sw = false;
        }
        return sw;
    }

    async after(rr: RequestResponse, app: SimpleBootHttpServer) {
        return true;
    }
}
