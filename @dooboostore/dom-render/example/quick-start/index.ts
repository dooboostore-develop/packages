import {DomRender} from '@dooboostore/dom-render/DomRender';
import { Config } from '@dooboostore/dom-render/configs/Config';

class Data {
    name = 'my name is dom-render';
    friends = [{name: 'a'}, {name: 'b'}, {name: 'c'}];
}

const data = DomRender.run({rootObject: ()=> new Data(), target:document.querySelector('#app')!, config:{window: window, routerType: 'path'}});
setInterval(() => {
    data.rootObject.name = Date.now().toString()
    // data.friends[1].name = Date.now().toString()
}, 1000)