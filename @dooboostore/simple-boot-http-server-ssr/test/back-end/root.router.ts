import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { ApiRrouter } from '@back-end/api/ApiRrouter';

@Sim
@Router({
    path: '',
    route: {},
    routers: [ApiRrouter]
})
export class RootRouter {

    constructor() {
        // console.log('RootRouter constructor', this.databaseService);
        // this.databaseService.getRepository(WorldEntity).then(it => {
        //     return it.find()
        // }).then(it => {
        //     console.log('-=',it);
        // })
        // console.log('IndexRouter constructor');
    }
}