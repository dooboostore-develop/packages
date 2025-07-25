import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Router as DomRenderRouter } from '@dooboostore/dom-render/routers/Router';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './index.html'
import style from './index.css'
import { Home } from './pages/home/home';
import { User } from './pages/user';
import { RouterAction } from '@dooboostore/simple-boot/route/RouterAction';
import { ItemComponent } from './components/item/item.component';
import { ComponentSet } from '@dooboostore/simple-boot-front/component/ComponentSet';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender';
import SystemComponent from '@dooboostore/app-system/component';
import { Appender } from '@dooboostore/dom-render/operators/Appender';
@Sim({
    using: [ItemComponent, SystemComponent]
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
    testData = true;
    appender = new Appender();
    constructor(private router: DomRenderRouter, private home: Home) {
        console.log('constructor IndexComponent', router)
    }
    async go() {
        this.router.go({path:'/user'})
    }

    onCreateAppender(appender: Appender) {

    }

    onInitRender(...param) {

        setInterval(() => {
          this.appender.push('a'+ (new Date().toISOString()));
        }, 1000)
        // this.child = new ComponentSet(this.home);
        // this.child = new DomRenderComponentSet({name:'sub1'}, '<div><h1>11subthis</h1><div>${@this@.name}$  ${console.log("asas${@this@.name}$")}$ <!-- ${#this#}$--></div></div>')
        // this.child = new DomRenderComponentSet(this.home, '<div><h1>11subthis</h1><div>${@this@.name}$  ${console.log("asas${@this@.name}$")}$ <!-- ${#this#}$--></div></div>')
        // console.log('222222', this.navigation, this.home.name)
        // console.log('33333333333', this.child.obj);
    }

    async canActivate(url: any, module: any) {
        this.child = new ComponentSet(module);
        console.log('route->', url, module, this.child);
    }
}

