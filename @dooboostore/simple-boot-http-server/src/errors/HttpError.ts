
export class HttpError {
    name: string = 'Error'
    message: string;
    stack?: string
    data?: any;
    public status: number;

    constructor({status, message = 'HttpError'}: { status: number, message?: string }) {
        // super(message);
        this.message = message;
        this.status = status;
    }
}
