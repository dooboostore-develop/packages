import {RouteData} from '@dooboostore/dom-render/routers/Router';

export class Sub {
    constructor(public routeData: RouteData) {
        console.log('Sub.constructor', routeData);
    }
}