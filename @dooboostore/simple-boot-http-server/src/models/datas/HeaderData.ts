export class HeaderData<T> {
    constructor(public header: { [p: string]: [string] }, public data: T) {
    }
}