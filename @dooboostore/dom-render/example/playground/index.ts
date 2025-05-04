import { DomRender } from '@dooboostore/dom-render/DomRender';
import { Config } from '@dooboostore/dom-render/configs/Config';
import { ComponentSet } from '@dooboostore/dom-render/components/ComponentSet';
import { OnDestroyRender } from '@dooboostore/dom-render/lifecycle/OnDestroyRender';
import { OnCreateRender } from '@dooboostore/dom-render/lifecycle/OnCreateRender';
import { OnDrThisBind } from '@dooboostore/dom-render/lifecycle/dr-this/OnDrThisBind';
import { OnDrThisUnBind } from '@dooboostore/dom-render/lifecycle/dr-this/OnDrThisUnBind';
import { OnCreateRenderData, OnCreateRenderDataParams } from '@dooboostore/dom-render/lifecycle/OnCreateRenderData';
import { OnChangeAttrRender, OtherData } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';
import { Appender } from '@dooboostore/dom-render/operators/Appender';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import { StringUtils } from '@dooboostore/core/string/StringUtils';
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

export class Profile implements OnChangeAttrRender {
  public hidden = false;
  constructor() {
    console.log('Profile constructor');
  }

  onChangeAttrRender(name: string, value: any, other: OtherData): void {
    console.log('change profile attribute', name, value)
  }

}

export class User implements OnChangeAttrRender {
  color: 'red'
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
  color = 'blue';
  format = 'jpg';
  name = 'IndexName';
  src = 'data:image/png;base64,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';
  public checked = true;
  value = 'wowvvvvvvvvv';
  hidden: true;
  appender = new Appender();
  dictionary = {
    name: 'visualkhh'
  };
  sub0 = new ComponentSet(new Sub('sub0'), {styles: 'div {background-color: red;}', template: '<div><h1 dr-event-click="@this@.changeDic()">00subthis</h1><div dr-if="@this@.hidden"> ${@this@.dictionary.name}$ <hr/> <profile>(@nearThis@)</profile> (@nearThis@) [<div dr-this="@this@.dictionary">  (${@nearThis@.name}$)   ${$nearThis.name}$  </div>]</div></div>' });
  sub1 = new ComponentSet(new Sub('sub1'), {styles: '', template: '<div><h1>11subthis</h1></div>' });
  sub2 = new ComponentSet(new Sub('sub2'), {styles: '', template: '<div><h1>22subthis</h1><div>${@this@.name}$</div></div>' });
  ss = {
    wow: 'wow'
  };

  constructor() {
    // this.child = new ComponentSet(new Sub(), '<div><h1>subthis00</h1>${@this@.name}$</div>');
    this.child = this.sub0;
    this.appender.push();
    // this.appender.push('init' + RandomUtils.uuid(), 'init' + RandomUtils.uuid());

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
  append() {
    this.appender.push(RandomUtils.uuid(), RandomUtils.uuid());
  }

  clearAppend() {
    this.appender.clear()
  }

  modifyAppender(idx: number) {
    this.appender[idx][0] = RandomUtils.uuid();
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
    DomRender.createComponent({ tagName:'detailsss', type: User, styles:'div{color:${this.color}$; background-image:url(\'https://pbs.twimg.com/profile_images/1407500731528007682/vcjRMQFb_400x400.jpg\')} ', template: '<div>user${this.name}$ ${@this@.color}$<button dr-event-click="window._data.color=\'red\'">change ${@this@.color}$</button></div>' }),
    DomRender.createComponent({ type: Profile, styles:'div{}', noStrip:true, template: '<div>profile<hr/> ${@nearThis@.name}$<input type="text" dr-value-link="@nearThis@.name" data-wow="${@nearThis@.name}$" >\n' +
        '<button dr-event-click="console.log(@nearThis@.name)">aa</button>\n' +
        '<button dr-event-click="@nearThis@.name = new Date().toString()">aaaaa</button></div>' }),
    DomRender.createComponent({ type: Home, styles: `div{color:red}`, template: '<div>' +
        '<img src="${@this@.src+\'2222\'}$"/>\n' +
        // '${@this@.src}$\n' +
        '<button dr-event-click="@this@.src=\'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyyBcnn8TMHh0YRyHxeNzTlCVmLiw1YY6pgA&s\'">change</button>\n' +
        '</div>' })
  ]
};
const data = DomRender.run({ rootObject: new Index(), target: document.querySelector('#app')!, config });
(window as any)._data = data;
// setInterval(() => {
//   data.value = Date.now().toString();
// }, 2000)
