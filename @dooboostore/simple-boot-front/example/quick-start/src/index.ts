import {Sim} from '@dooboostore/simple-boot/decorators/SimDecorator';
import {Router} from '@dooboostore/simple-boot/decorators/route/Router';
import {Component} from '@dooboostore/simple-boot-front/decorators/Component';
import template from './index.html'
import style from './index.css'
import {Home} from './pages/home/home';
import {User} from './pages/user';
import {RouterAction} from '@dooboostore/simple-boot/route/RouterAction';
import {ItemComponent} from './components/item/item.component';
import { SimstanceManager } from '@dooboostore/simple-boot/simstance/SimstanceManager';
import { ProjectService } from './services/ProjectService';
import { Navigation } from '@dooboostore/simple-boot-front/service/Navigation.ts';
import { OnInit } from '@dooboostore/simple-boot-front/lifecycle/OnInit.ts';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender.ts';
import { ComponentSet } from '@dooboostore/simple-boot-front/component/ComponentSet.ts';
// import { createComponentSet } from '@dooboostore/simple-boot-front/component/FrontComponentSet.ts';
// console.log('!!!!!!!!!!!!!!!!!!!!!!1', style)
@Sim({
    using: [ItemComponent]
})
@Router({
    path: '',
    route: {
        '/': Home,
        '/user': User
    }
})
@Component({
    template,
    styles: [style]
})
export class Index implements RouterAction, OnInitRender {
    child?: ComponentSet<any>
    constructor(private navigation: Navigation, private home: Home) {
        console.log('constructor IndexComponent', navigation)
    }
    async go() {
        const router = await this.navigation.getRouter()
        router.go({path:'/user'})
    }

    onInitRender(...param) {
        // this.child = new ComponentSet(this.home);
        // this.child = new DomRenderComponentSet({name:'sub1'}, '<div><h1>11subthis</h1><div>${@this@.name}$  ${console.log("asas${@this@.name}$")}$ <!-- ${#this#}$--></div></div>')
        // this.child = new DomRenderComponentSet(this.home, '<div><h1>11subthis</h1><div>${@this@.name}$  ${console.log("asas${@this@.name}$")}$ <!-- ${#this#}$--></div></div>')
        console.log('222222', this.navigation, this.home.name)
        console.log('33333333333', this.child.obj);
    }

    async canActivate(url: any, module: any) {
        this.child = new ComponentSet(module);
        console.log('route->', url, module, this.child);
    }
}

