import {HeaderData} from './HeaderData';

export type MultipartData = {
    isFile: true;
    name: string;
    filename: string;
    contentType: string;
    value: Buffer
} | {
    isFile: false;
    name: string;
    value: string;
}
// export class MultipartData<T> extends HeaderData<T> {
//     constructor(private _info:MultipartDataInfo, header: { [p: string]: [string] }, data: T) {
//         super(header, data);
//
//     }
//
//     get info() {
//         return this._info;
//     }
//
//     get isFile() {
//         return !!this._info.filename;
//     }
// }