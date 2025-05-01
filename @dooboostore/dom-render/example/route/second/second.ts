import {OnCreateRender} from '@dooboostore/dom-render/lifecycle/OnCreateRender';
import {CreatorMetaData} from '@dooboostore/dom-render/rawsets/CreatorMetaData';

export class Second implements OnCreateRender {
    name = 'Second'

    onCreateRender(data: CreatorMetaData): void {
        console.log('----->', data?.router);
        // console.log('----->', param[0].getData())
    }
}
