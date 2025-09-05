import {DomRender} from '@dooboostore/dom-render/DomRender';
import { Config } from '@dooboostore/dom-render/configs/Config';

class Data {
    name = 'my name is dom-render';
    address='aaaaavv';
  dateFilter = {to: '', from:''};
    friends = [{name: 'a'}, {name: 'b'}, {name: 'c'}];
    clearDateFilter() {
      this.dateFilter = {to: '', from:''};
    }
}

const data = DomRender.run({rootObject: ()=> new Data(), target:document.querySelector('#app')!, config:{window: window, routerType: 'path'}});
// setInterval(() => {
//     data.name = Date.now().toString()
//     // data.friends[1].name = Date.now().toString()
// }, 1000)