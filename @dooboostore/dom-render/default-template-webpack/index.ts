import { DomRender, DomRenderRunConfig } from '@dooboostore/dom-render/DomRender';
import { DomRenderConfig } from '@dooboostore/dom-render/configs/DomRenderConfig';
import { ComponentSet } from '@dooboostore/dom-render/components/ComponentSet';
import { OnDestroyRender } from '@dooboostore/dom-render/lifecycle/OnDestroyRender';
import { OnCreateRender } from '@dooboostore/dom-render/lifecycle/OnCreateRender';
import { OnDrThisBind } from '@dooboostore/dom-render/lifecycle/dr-this/OnDrThisBind';
import { OnDrThisUnBind } from '@dooboostore/dom-render/lifecycle/dr-this/OnDrThisUnBind';
import { OnCreateRenderData, OnCreateRenderDataParams } from '@dooboostore/dom-render/lifecycle/OnCreateRenderData';
import { OnChangeAttrRender } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';
import { Appender } from '@dooboostore/dom-render/operators/Appender';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';

export class Home implements OnCreateRender, OnCreateRenderData {
  public name = 'home name';

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
  public name = 'profile name';
  constructor() {
    console.log('Profile constructor');
  }
}

export class User implements OnChangeAttrRender {
  name='user';
  constructor() {
    console.log('User constructor');
  }

  onChangeAttrRender(name: string, val: any): void {
    console.log('User onChangeAttrRender', name, val);
  }

}
export class Sub implements OnDestroyRender, OnCreateRender, OnDrThisBind, OnDrThisUnBind, OnChangeAttrRender {
  child= new ComponentSet(new User(), {template: '<div>user</div>'})

  children = [
    new ComponentSet(new Profile(), {template: '<div>profile</div>'}),
    new ComponentSet(new Home(), {template: '<div>home</div>'})
  ]

  // appender = new Appender(1,2,3,4);
  appender = new Appender();

  public dictionary = {
    name: 'SubSubSub'
  };

  constructor(public name: string) {
    console.log('Sub constructor', name);
    this.appender.push(1,2)
  }


  onDrThisBind(): void {
    console.log(this.name, 'onDrThisBind');
    // setInterval(() => {
    //   this.name = new Date().toString();
    // }, 1000)
  }

  private uuid = '';
  add(): void {
    // this.appender.push(RandomUtils.uuid(), RandomUtils.uuid())

    this.uuid = RandomUtils.uuid();
    // this.appender.set(RandomUtils.uuid(), 1);
    this.appender.set(this.uuid, 2);
    console.log(this.name, 'add', this.appender);
  }

  delete(): void {
    this.appender.clear();
    console.log(this.name, 'delete', this.appender);
  }

  change(): void {
    this.appender.set(this.uuid, 32+RandomUtils.uuid())
    console.log(this.name, 'change', this.appender);
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

  // child = new ComponentSet(new Sub('sub0'), {styles: '', template: '<div><h1>subthis1</h1><div>0subthis <div dr-this="@this@.child"></div></div>' });
  // child = new ComponentSet(new Sub('sub0'), {styles: '', template: '<div><h1>subthis1</h1><div>0subthis <div dr-for-of="@this@.children" zz="#it#">ss</div></div>' });
  // child = new ComponentSet(new Sub('sub0'), {styles: '', template: '<div><h1>subthis1</h1><div>0subthis <div dr-for-of="@this@.children" dr-option-this="#it#">s#bb#s</div></div>' });
  child = new ComponentSet(new Sub('sub0'), {styles: '', template: '<div><h1>subthis1</h1><div>0subthis<div><button dr-event-click="@this@.add()">add</button> <button dr-event-click="@this@.delete()">delete</button><button dr-event-click="@this@.change()">change</button></div> <div dr-appender="@this@.appender" dr-option-this="#it#" >${#it#}$ #it#</div></div>' });
  // child = new ComponentSet(new Sub('sub0'), {styles: '', template: '<div><h1>subthis1</h1><div>0subthis <div dr-this="@this@.children[0]" zz="@this@.children[0]">ss</div></div>' });
  // subs = [
  //   new ComponentSet(new Sub('sub0'), {styles: '', template: '<div><h1>subthis1</h1><div>0subthis </div>' }),
  //   new ComponentSet(new Sub('sub0'), {styles: '', template: '<div><h1>subthis2</h1><div>0subthis </div>' }),
  //   new ComponentSet(new Sub('sub0'), {styles: '', template: '<div><h1>subthis3</h1><div>0subthis </div>' }),
  // ]

  constructor() {
    // this.child = new ComponentSet(new Sub(), '<div><h1>subthis00</h1>${@this@.name}$</div>');
    // this.child = this.sub0;
    // console.log('@@@@@@@@@@', this.child.obj)
    // this.child = new ComponentSet(new SubThis(), '<div><h1>subthis @this@</h1>dd${#this#)}$dd</div>');
  }

  onCreateRender(...param: any[]): void {
    console.log('index onCreateRender');
  }


}

const config: DomRenderRunConfig = {
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
