import jsonpatch, { Operation as JsonOperation } from 'fast-json-patch';
// export enum OP {
//     test = 'test',
//     remove = 'remove',
//     add = 'add',
//     replace = 'replace',
//     move = 'move',
//     copy = 'copy',
//
// }
// export type RequestPatchBody = {
//     op: OP;
//     path?: string;
//     from?: string;
//     value?: string | any[] | any;
// }
export type Operation = JsonOperation;
export class PatchJson {
    constructor(private patch: Operation[]) {
    }

    apply(obj: any) {
        obj = jsonpatch.applyPatch(obj, this.patch).newDocument;
        return obj;
        // switch (this.body.op) {
        //     case OP.test:
        //         return obj[this.body.path!] === this.body.value;
        //     case OP.remove:
        //         delete obj[this.body.path!];
        //         return true;
        //     case OP.add:
        //         obj[this.body.path!] = this.body.value;
        //         return true;
        //     case OP.replace:
        //         obj[this.body.path!] = this.body.value;
        //         return true;
        //     case OP.move:
        //         obj[this.body.path!] = obj[this.body.from!];
        //         delete obj[this.body.from!];
        //         return true;
        //     case OP.copy:
        //         obj[this.body.path!] = obj[this.body.from!];
        //         return true;
        // }
    }
}
