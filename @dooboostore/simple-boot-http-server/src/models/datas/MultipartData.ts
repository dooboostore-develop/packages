import {HeaderData} from './HeaderData';

export class MultipartData<T> extends HeaderData<T> {
    constructor(public boundary: string, header: { [p: string]: [string] }, data: T) {
        super(header, data);
    }
}