import { DomRender } from '@dooboostore/dom-render/DomRender';
import { Config } from '@dooboostore/dom-render/configs/Config';
import { ComponentSet } from '@dooboostore/dom-render/components/ComponentSet';
import { OnDestroyRender } from '@dooboostore/dom-render/lifecycle/OnDestroyRender';
import { OnCreateRender } from '@dooboostore/dom-render/lifecycle/OnCreateRender';
import { OnDrThisBind } from '@dooboostore/dom-render/lifecycle/dr-this/OnDrThisBind';
import { OnDrThisUnBind } from '@dooboostore/dom-render/lifecycle/dr-this/OnDrThisUnBind';
import { OnCreateRenderData, OnCreateRenderDataParams } from '@dooboostore/dom-render/lifecycle/OnCreateRenderData';
import { OnChangeAttrRender } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';

export class Home implements OnCreateRender, OnCreateRenderData {
  public name = 'home name';
  public dictionary = {
    name: 'visualkhh'
  };

  constructor() {
    console.log('Home constructor');
  }

  onCreateRender(...param: any[]): void {
    console.log('Home onCreateRender----------', data);
  }

  onCreateRenderData(data: OnCreateRenderDataParams): void {
    console.log('Home onCreateRenderData------', data);
  }

}

export class Profile {
  public hidden = false;
  constructor() {
    console.log('Profile constructor');
  }
}

export class User implements OnChangeAttrRender {
  constructor() {
    console.log('User constructor');
  }

  onChangeAttrRender(name: string, val: any): void {
    console.log('User onChangeAttrRender', name, val);
  }

}

export class SubThis {
  child: any;

  constructor() {
    this.child = new ComponentSet({ name: 'subThis' }, {template:'<div><h1>sub-sub-this [${@this@.name}$]</h1></div>'});
  }
}

export class Sub implements OnDestroyRender, OnCreateRender, OnDrThisBind, OnDrThisUnBind, OnChangeAttrRender {
  public hidden = true;
  public dictionary = {
    name: 'SubSubSub'
  };

  constructor(public name: string) {
    console.log('Sub constructor', name);
  }

  changeDic() {
    this.hidden = !this.hidden;
    this.dictionary.name = new Date().toISOString();
  }

  onDrThisBind(): void {
    console.log(this.name, 'onDrThisBind');
    // setInterval(() => {
    //   this.name = new Date().toString();
    // }, 1000)
  }

  onDrThisUnBind(): void {
    console.log(this.name, 'onDrThisUnBind');
  }

  onDestroyRender(data: any): void {
    console.log('onDestroyRender', this.name, data);
  }

  onCreateRender(...param: any[]): void {
    console.log('onCreateRender', this.name);
  }

  onChangeAttrRender(name: string, val: any) {
    console.log('sub0 onChangeAttrRender', name, val);
  }

}

export class Index implements OnCreateRender {
  child: any;
  name = 'wowname';
  value = 'wowvvvvvvvvv';
  hidden: true;
  dictionary = {
    name: 'visualkhh'
  };
  sub0 = new ComponentSet(new Sub('sub0'), {styles: 'div {background-color: red;}', template: '<div><h1 dr-event-click="@this@.changeDic()">00subthis</h1><div dr-if="@this@.hidden"> ${@this@.dictionary.name}$ <hr/> <profile>(@nearThis@)</profile> (@nearThis@) [<div dr-this="@this@.dictionary">  (${@nearThis@.name}$)   ${$nearThis.name}$  </div>]</div></div>' });
  sub1 = new ComponentSet(new Sub('sub1'), {styles: '', template: '<div><h1>11subthis</h1><div>${@this@.name}$  ${console.log("asas${@this@.name}$")}$ <!-- ${#this#}$--></div></div>' });
  sub2 = new ComponentSet(new Sub('sub2'), {styles: '', template: '<div><h1>22subthis</h1><div>${@this@.name}$</div></div>' });
  ss = {
    wow: 'wow'
  };

  constructor() {
    // this.child = new ComponentSet(new Sub(), '<div><h1>subthis00</h1>${@this@.name}$</div>');
    this.child = this.sub0;
    // console.log('@@@@@@@@@@', this.child.obj)
    // this.child = new ComponentSet(new SubThis(), '<div><h1>subthis @this@</h1>dd${#this#)}$dd</div>');
  }


  changeName() {
    this.name = new Date().toString();
  }

  change() {
    if (this.child === this.sub1) {
      this.child = this.sub2;
    } else {
      this.child = this.sub1;
    }
    console.log('-ss', this.child);
  }

  changeValue() {
    this.value = Date.now().toString();
  }

  onCreateRender(...param: any[]): void {
    console.log('index onCreateRender');
  }


}

const config: Config = {
  window,
  scripts: {
    concat: function(data: string, str: string) {
      return data + str;
    }
  },
  targetElements: [
    DomRender.createComponent({ type: User, template: '<div>user</div>' }),
    DomRender.createComponent({ type: Profile, styles:'div{background-color:blue;}', template: '<div dr-event-click="@this@.hidden = !@this@.hidden">profile: <div dr-if="@this@.hidden">[(@nearThis@)] #innerHTML# </divd></div>' }),
    DomRender.createComponent({ type: Home, styles: `div{color:red}`, template: '<div dd="@this@">home  <!--@this@--> <div dr-this="@this@.dictionary">  ${@this@.name}$</div></div>' })
  ]
};
const data = DomRender.run({ rootObject: new Index(), target: document.querySelector('#app')!, config });
(window as any)._data = data;
// setInterval(() => {
//   data.value = Date.now().toString();
// }, 2000)
