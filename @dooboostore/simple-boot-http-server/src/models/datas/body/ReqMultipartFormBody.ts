import {MultipartData} from '../MultipartData';

export class ReqMultipartFormBody {
    constructor(public field: MultipartData<any>[] = []) {
    }
}