import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { RequestResponse } from '../RequestResponse';
import { HttpStatus } from '../../codes/HttpStatus';
import { HttpHeaders } from '../../codes/HttpHeaders';

export class Resource {
    constructor(public path: string | RequestResponse | URL, public rootPath = process.cwd()) {
    }

    get absolutePath(): string {
        if (this.path instanceof RequestResponse) {
            return path.join(this.rootPath, this.path.reqUrlObj.pathname);
        } else if (this.path instanceof URL) {
            return path.join(this.rootPath, this.path.pathname);
        } else {
            return path.join(this.rootPath, this.path);
        }
    }

    get conTentType(): string {
        return mime.lookup(this.absolutePath).toString();
    }

    get data(): Promise<string> {
        const promise = new Promise<string>((resolve, reject) => {
            fs.readFile('', (error, fileBuffer) => {
                if (error) {
                    reject(error);
                }
                const fileContent = fileBuffer.toString();
                resolve(fileContent);
            });
        });
        return promise;
    }

    async write(rr: RequestResponse) {
        rr.resStatusCode(HttpStatus.Ok);
        rr.resSetHeader(HttpHeaders.ContentType, this.conTentType);
        await rr.resEnd(fs.readFileSync(this.absolutePath));
    }
}