import {RouteData} from '@dooboostore/dom-render/routers/Router';
import {OnCreateRender} from '@dooboostore/dom-render/lifecycle/OnCreateRender';
import {CreatorMetaData} from '@dooboostore/dom-render/rawsets/CreatorMetaData';

export class Detail implements OnCreateRender {
    name = 'Detail';

    onCreateRender(data: CreatorMetaData) {
        console.log('routeData->', data);
    }

    routerData(routeData: RouteData) {
        console.log('--------', routeData);
    }
}