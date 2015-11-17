export class HandlerObject{
    private _handler:Function;
    private _context:any;


    get handler():Function {
        return this._handler;
    }

    get context():any {
        return this._context;
    }

    constructor(handler:Function, context:any) {
        this._handler = handler;
        this._context = context;
    }
}
