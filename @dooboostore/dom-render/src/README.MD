DOM-RENDER  
===   
[![typescript](https://img.shields.io/badge/-npm-black?logo=npm)](https://www.npmjs.com/package/dom-render) [![license](https://img.shields.io/badge/license-MIT-green)](LICENSE.md)
* view template engine
* Dom control and reorder and render
* all internal variables are managed by proxy. (DomRenderProxy)

# 🚀 Quick start 
```html
<script src="https://cdn.jsdelivr.net/npm/dom-render@1.0.91/dist/bundle.js"></script>
```
```html
<!DOCTYPE html>
<html lang="en">
<head``>
  <meta charset="UTF-8">
  <title>Title</title>
</head>
<body id="app">
${this.name}$
<script src="https://cdn.jsdelivr.net/npm/dom-render@1.0.86/dist/bundle.js"></script>
<script>
  let data = {
    name: 'my name is dom-render'
  };
  data = DomRender.run(data , document.querySelector('#app'));
</script>
</body>
</html>
```

# 😃 examples
- [examples](./examples)


## Expression
<details>
  <summary>${...}$, #{...}# <strong>🔻(click)</strong></summary>

### ${}$ innerTEXT, #{}# innerHTML
```html
<body id="app">
${this.name}$  <!-- outout: <i>my name is dom-render</i> -->
#{this.name}# <!-- outout text is italic: my name is dom-render -->
<script>
  let data = {
    name: '<i>my name is dom-render</i>'
  };
  data = DomRender.run(data , document.querySelector('#app'));
</script>
</body>
```
</details>

# dom-render attributes


## attribute change, bind
<details>
  <summary>attribute<strong>🔻(click)</strong></summary>

### attribute
```html
<body id="app">
  <input type="text" value="${this.name}$" style="${'color: '+this.color}$">
  <button dr-event-click="this.changeData();">change</button>
</body>
```
```typescript
class Data {
    name = 'my name is dom-render';
    color = '#ff0000';

    changeData() {
        this.name = RandomUtils.getRandomString(10);
        this.color = RandomUtils.getRandomColor();
    }
}
const data = DomRender.run(new Data(), document.querySelector('#app')!);
```
</details>


## style  css
```typescript
export class IndexComponent implements OnInitRender, OnDestroyRender, OnInit, OnSimCreate, OnDrThisBind, OnDrThisUnBind, OnCreateRender, OnCreateRenderData, OnCreatedThisChild {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  name = 'IndexComponent';
  age = 10;
  color = 'red';
  img = 'url(\'https://pbs.twimg.com/media/F1FHR-saMAAMTKm?format=jpg&name=360x360\')';
  //...
}
```
```css
.sign-container{
    cursor: pointer;
    width: 32px;
    height: 28px;
    background-image: ${@this@.img}$;
    background-position: center; /* 정가운데 */
    background-size: contain; /* 이미지 전체 표시 */
    background-repeat: no-repeat; /* 반복 방지 */
}
```
```css
.#uuid# {
color:${@this@.color}$;
}
```
```css
@media (width >= /*$@this@.ss$*/) {
    #profileDialog {
        max-width: ${@this@.ss}$;  /* 너비 조정 */
    }
}
```
### Release the style that applies only to the inside of the component. Please write (1line) online
```css
## .wow {...}
## body::-webkit-scrollbar {display: none;}
```
```html
<button dr-event-click="@this@.ss = '50rem'">aa</button>
```

selector expression: /*$@this@.ss$*/ 
uuid: rawSetUUID
##: escape scope



## control, print Statement
<details>
  <summary>dr-if<strong>🔻(click)</strong></summary>

### if element render
```html
<body id="app">
  <div dr-if="true">true</div>  <!-- render -->
  <div dr-if="this.gender === 'M'">gender: M</div> <!-- No Render -->
<script>
  let data = {
    gender: 'F',
  };
  data = DomRender.run(data , document.querySelector('#app'));
</script>
</body>
```
</details>





<details>
  <summary>dr-for, dr-for-of<strong>🔻(click)</strong></summary>

```html
<div dr-for="var i = 0; i < this.friends.length; i++"> friend</div>
<div dr-for-of="this.friends"> ${#it#.name}$</div>
<div dr-for-of="$range(10, 20)"><div>${#it#}$</div><div>
<div dr-for="var i = 1 ; i <= 9 ; i++" dr-it="i">
  ${#it#}$ *
  <scope dr-for="var y = 1 ; y <= 9 ; y++" dr-it="y" dr-var="superIt=#it#" dr-option-strip="true">
    #it# = ${$var.superIt * #it#}$
  </scope>
</div>
```
</details>

<details>
  <summary>dr-appender<strong>🔻(click)</strong></summary>

```html
<h3>appender</h3>
<ul>
  <li dr-appender="@this@.appender">
    ${#it#}$
  </li>
</ul>
<button dr-event-click="@this@.append()">appending</button>
<button dr-event-click="@this@.modifyAppender(0)">idx 0 modify</button>
<button dr-event-click="@this@.clearAppend()">appender clear</button>
```

```typescript
class Data {
    appender = new Appender();

    constructor() {
        this.appender.push('init' + RandomUtils.uuid(), 'init' + RandomUtils.uuid());
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

```
</details>


### dr-strip
```html
<div dr-strip="true">aa</div>  
```
only "aa" result  strip element



<details>
  <summary>dr-repeat<strong>🔻(click)</strong></summary>

```html
<div dr-repeat="10"><div>#it#</div></div>
<div dr-repeat="$range(10, 20)"><div>#it#</div></div>
<div dr-repeat="$range(10, 20, 5)"><div>#it#</div></div>
<div dr-repeat="$range('10..5, 2')"><div>#it#</div></div>
```
</details>

<details>
  <summary>dr-inner-text, dr-inner-html<strong>🔻(click)</strong></summary>

```html
<div dr-inner-text="'<b>aa</b> <button dr-event-click=\'alert(1)\'>aa</button>'"> friend</div>
<div dr-inner-html="'<b>aa</b> <button dr-event-click=\'alert(1)\'>aa</button>'"> friend</div>
```
</details>


## event
<details>
  <summary>dr-event-(name)<strong>🔻(click)</strong></summary>

* click, mousedown, mouseup, dblclick, mouseover, mouseout, mousemove, mouseenter, mouseleave, contextmenu, keyup, keydown, keypress, change, input, submit, resize, focus, blur
* ref: element
* variable: $event, $target
```html
click: <button dr-event-click="@this@.name = 'name' + new Date()">click</button> <br>
change: <input type="text" dr-event-change="@this@.name = $target.value"> <br>
input: <input type="text" dr-event-input="@this@.name = $target.value"> <br>
keyup: <input type="text" dr-event-keyup="@this@.name = $target.value"> <br>
...
keydown: <input type="text" dr-event-keydown="@this@.name = $target.value"><br>
submit: <form dr-event-submit="console.log($event); $event.preventDefault();"><input type="text"> <button type="submit">submit</button></form><br>
```
</details>

<details>
  <summary>dr-window-event-popstate<strong>🔻(click)</strong></summary>

* ref: window
* variable: $target

```html
window-event-popstate: <input type="text" dr-window-event-popstate="alert(@this@.name)"><br>
```
</details>

<details>
  <summary>dr-event<strong>🔻(click)</strong></summary>

* other event
* ref: element
* variable: $params, $event


```html
<input dr-event:bind='eventName1, eventName2' dr-event="console.log('event', $params, $event)"  type="text">
```
</details>


## this
<details>
  <summary>dr-this<strong>🔻(click)</strong></summary>
* dr-this
  * object mapping

```typescript
class data {
  dictionary = {
      name: 'visualkhh'
  }
}
```
```html
<div dr-this="@this@.dictionary">
  ${@this@.name}$
</div>
```
</details>

<details>
  <summary>dr-this-property<strong>🔻(click)</strong></summary>
* dr-property
  * property forEach in object
  * dynamic add, delete  

```typescript
class data {
  dictionary = {
      name1: 'visualkhh1',
      name2: 'visualkhh2',
      name3: 'visualkhh3'
  }
}
```
```html
<home dr-this-property="@this@.dictionary" dr-on-init:arguments="[2,#this#]">
  ${this}$
</home>
```
</details>


## nearThis
```html
<div dr-this="@this@.dictionary">  (${@nearThis@.name}$)   ${$nearThis.name}$  </div>
```


## dr-on-init
- element on-init event
```html
<canvas id="gameCanvas" dr-on-init="console.log('--@@@@@@@---', $element)"></canvas>sssss
```
## value
<details>
  <summary>dr-value, value-link<strong>🔻(click)</strong></summary>

* dr-value
  * The value is assigned the first time.
* dr-value-link
  * Value and variable values are referencing each other. It affects each other when changing. (Immediate reflection event: input)
  * instance variable first
* dr-checked-link
  * Value and variable values are referencing each other. It affects each other when changing. (Immediate reflection event: input)
  * instance variable first
* dr-disabled-link
  * Value and variable values are referencing each other. It affects each other when changing. (Immediate reflection event: input)
  * instance variable first

```html
dr-value: <input type="text" dr-value="@this@.office.name"> <br>
dr-value-link: <input type="text" dr-value-link="@this@.office.addr.street"> <br>
```
</details>

## dr-on-rendered-init
- rendered call

## other
<details>
  <summary>dr-attr<strong>🔻(click)</strong></summary>

```html
<textarea dr-attr="{rows: @this@.age/2, cols: @this@.age}"></textarea>
<div dr-attr="{wow: '123', good: 123444}"></div>
<div dr-attr="['wow=123', 'good=123444']"></div>
<div dr-attr="'wow=123, good=123444'"></div>
```
</details>

<details>
  <summary>dr-class<strong>🔻(click)</strong></summary>

```html
<div dr-class="{big: @this@.age > 50, red: @this@.age > 50}"></div>
<div dr-class="'big yellow ' + (@this@.age > 50 ? 'old' : 'young')"></div>
<div dr-class="['small', 'yellow']"></div>
```
</details>

<details>
  <summary>dr-style<strong>🔻(click)</strong></summary>

```html
<div dr-style="{'background-image': 'url(\''+@this@.my?.image+'\')'}" >aa</div>
<div dr-style="{fontSize: @this@.age + 'px'}"> style </div>
<div dr-style="{'font-size': '20px'}"> style</div>
<div dr-style="'font-size: ' + @this@.age +'px; margin: ' + @this@.age + 'px'"> style </div>
<div dr-style="['font-size: ' + @this@.age +'px', 'margin: ' + @this@.age + 'px']"> style </div>
```
</details>

<details>
  <summary>dr-strip<strong>🔻(click)</strong></summary>

```html
<div dr-strip="true"><span>hello</span></div> <!-- output html : <span>hello</span> -->
```
</details>

<details>
  <summary>dr-before, dr-after<strong>🔻(click)</strong></summary>

```html
<div dr-before="console.log('process before')" dr-after="console.log('process after')"></div>
```
</details>

<details>
  <summary>dr-complete<strong>🔻(click)</strong></summary>

```html
<select dr-value-link="@this@.currentContry" dr-event-change="@this@.contryChange($event)">
  <option dr-for-of="@this@.languages" dr-value="#it#.key" dr-complete="@this@.currentContry='defaultValue'">${#it#.title}$</option>
</select>
```
#nearForOfIndex#
```html
        <select dr-value-link="@this@.selectedStationIndex" dr-event-change="@this@.onChangeStation($event)">
              <option dr-for-of="@this@.stations" dr-value="#nearForOfIndex#">
                ${#it#.name}$
              </option>
            </select>
```

#it#
```html
 <input type="text" list="search-details-body-input-datalist" dr-on-init="@this@.onInitSearchElement($element);"> <button class="fa-solid fa-magnifying-glass"></button>
      <datalist id="search-details-body-input-datalist">
        <option dr-for-of="@this@.searchUsers" dr-value="#it#.name">
      </datalist>

<div id="search-details-body-result-container">
  <ul>
    <li dr-for-of="@this@.searchUsers">
      ${#it#.name}$
    </li>
  </ul>
</div>
```
</details>

## dr-form
<details>
  <summary>form<strong>🔻(click)</strong></summary>
* event: change  
* modify change: dr-form:event="input"

- [examples](./examples/forms)

```html
<body id="app">
<form dr-form="@this@.form" dr-event-submit="@this@.submit(); $event.preventDefault();">
  name: <input name="name">
  age: <input name="age">
  <button type="submit">submit</button>
</form>
<script>
  let data = {
    form: {},
    submit() {
      console.log(this.form);
    }
  };
  data = DomRender.run(data , document.querySelector('#app'));
</script>
</body>
<!-- 💥 submit call --> 
<!-- console: {name: 'name data', age: 'age data'}  -->
```
</details>

<details>
  <summary>validator<strong>🔻(click)</strong></summary>

```html
<body id="app">
<form dr-form="@this@.form" dr-event-submit="@this@.submit(); $event.preventDefault();">
    name: <input name="name">
    age: <input name="age">
    <button type="submit">submit</button>
</form>
<script>
    const form = new FormValidator();
    form.name = new NotEmptyValidator();
    form.age = new NotEmptyValidator();
    let data = {
        form,
        submit() {
            if (this.form.valid()){
                console.log('valid');
            } else {
                console.log('inValid');
            }
        }
    };
    data = DomRender.run(data , document.querySelector('#app'));
</script>
</body>
```
validator
- Validator (abstract)
- ValidatorArray (abstract)
- AllCheckedValidatorArray
- AllUnCheckedValidatorArray
- CheckedValidator
- CountEqualsCheckedValidatorArray
- CountEqualsUnCheckedValidatorArray
- CountGreaterThanCheckedValidatorArray
- CountGreaterThanEqualsCheckedValidatorArray
- CountGreaterThanEqualsUnCheckedValidatorArray
- CountGreaterThanUnCheckedValidatorArray
- CountLessThanCheckedValidatorArray
- CountLessThanEqualsCheckedValidatorArray
- CountLessThanEqualsUnCheckedValidatorArray
- CountLessThanUnCheckedValidatorArray
- CountUnCheckedValidatorArray
- EmptyValidator
- ExcludeCheckedValidatorArray
- FormValidator
- IncludeCheckedValidatorArray
- MultipleValidator
- NonPassValidator
- NotEmptyValidator
- NotRegExpTestValidator
- PassValidator
- RegExpTestValidator
- RequiredValidator
- UnCheckedValidator
- ValidMultipleValidator
- ValidValidator
- ValidValidatorArray
- ValueEqualsValidator
- ValueNotEqualsValidator
</details>



## Route
<details>
  <summary>Route<strong>🔻(click)</strong></summary>

- [examples](./examples/router)

* config routerType: 'hash' | 'path' | 'none'  (default: 'none')
```typescript
// Config
const config: Config = {
  window
};
config.targetElements = [
  DomRender.createComponent({type: Main, tagName: 'page-main', template: MainTemplate}),
  DomRender.createComponent({type: Second, tagName: 'page-second', template: SecondTemplate}),
  DomRender.createComponent({type: Detail, tagName: 'page-detail', template: DetailTemplate})
]
config.routerType = 'hash'; // 'hash' | 'path' | 'none';
const data = DomRender.run(new Data(), document.querySelector('#app')!, config);
```
```html
<header>
  <h1>examples header</h1>
  <h2>${@this@.name}$</h2>
  <div>
    <div><button dr-event-click="$router.go('/')">main</button></div>
    <div>
      <button dr-event-click="$router.go('/second', {secondata: 555})">second</button>
      <button dr-event-click="$router.go('/second/5')">second/1</button>
      <button dr-event-click="$router.go('/second/wow')">second/2</button>
    </div>
    <div><button dr-event-click="$router.go('/detail/25?name=zzz')">detail</button></div>
  </div>
</header>
<hr>
<main>
  <page-main dr-if="$router.test('/')"></page-main>
  <page-second dr-if="$router.test('/second')">1</page-second>
  <page-second dr-if="$router.testRegexp('/second/[0-9]?$')">2</page-second>
  <page-second dr-if="$router.testRegexp('/second/wow$')">wow</page-second>
  <page-detail url='/detail/{id:[0-9]+}' dr-if="$router.test($attribute.url)" dr-on-create:callback="$component.routerData($router.getRouteData($attribute.url))" ></page-detail>
  <div>
    <button dr-event-click="@this@.plusCount()">${@this@.count}$ count  pluse++</button>
  </div>
</main>
<hr>
<footer>footer</footer>
```
```typescript
export class Second implements OnCreateRender {
    name = 'Second'

    onCreateRender(data: CreatorMetaData): void {
        console.log('----->', data.router)
    }
}
```
```typescript
import {RouteData} from 'dom-render/routers/Router';
import {OnCreateRender} from 'dom-render/lifecycle/OnCreateRender';

export class Detail implements OnCreateRender {
  name = 'Detail';

  onCreateRender(data: CreatorMetaData) {
    console.log('routeData->', data);
  }

  routerData(routeData: RouteData) {
    console.log('--------', routeData);
  }
}
```

```typescript
// RouteData type
type RouteData = {
  path: string;
  url: string;
  data?: any;
  searchParams: URLSearchParams;
  pathData?: any;
}
```
</details>

## Messenger (Data transmission) 
* publish, subscribe
<details>
  <summary>publish<strong>🔻(click)</strong></summary>

```typescript
export class Home implements OnProxyDomRender {
    private channel?: Channel;

  sendIndexMessage() {
    const rtn = this.channel?.publish(Index, {
      name: this.name,
      age: this.age,
      title: this.title
    });
    console.log('sendIndexMessage return value: ', rtn);
  }
    
    onProxyDomRender({messenger}: Config): void {
        this.channel = messenger?.createChannel(Home);
    }
}
```
</details>
<details>
  <summary>subscribe<strong>🔻(click)</strong></summary>

```typescript
class Index implements OnProxyDomRender {
    onProxyDomRender({messenger}: Config): void {
      messenger?.createChannel(this).filter((data) => (data.age ?? 0) > 5).subscribe((data) => {
        this.rcvData = data;
        return {data: 'good', action: 'actionGood'}
      });
      // messenger?.createChannel(this).subscribe((data) => {
      //     this.rcvData = data;
      //     return {data: 'good', action: 'actionGood'}
      // });
    }
}
````
</details>

## Class
<details>
  <summary>Range<strong>🔻(click)</strong></summary>

```javascript
const range = new Range(100,55, 10);
for (let data of new Range(100,55, 10)) {
  console.log(data);
}
const rangeArray = new Range(100,55, 10).toArray();
```
</details>
<details>
  <summary>Appender<strong>🔻(click)</strong></summary>

```javascript
const appender = new Appender<number>([1, 2]);
appender.push(3, 4)
for (const data of appender) {
    console.log('----appender item--->', data);
}
```
</details>

## Detect Get, Set
<details>
  <summary>Method Proxy<strong>🔻(click)</strong></summary>

### using detect
```typescript
{
    name: 'dom-render'
    onBeforeReturnSet: (name: string, value: any, fullpath: string[]) => {
        console.log('set name-->', name, value, fullpath);
    }
    onBeforeReturnGet: (name: string, value: any, fullpath: string[]) => {
        console.log('get name-->', name, value, fullpath);
    }
}
```
exclude detect property: Config
- proxyExcludeOnBeforeReturnGets: ['propertyName']
- proxyExcludeOnBeforeReturnSets: ['propertyName']
---

### OnBeforeReturnSet
```typescript
export interface OnBeforeReturnSet {
    onBeforeReturnSet(name: string, value: any, fullPath?: string[]): void;
}
```
### OnBeforeReturnGet
```typescript
export interface OnBeforeReturnGet {
    onBeforeReturnGet(name: string, value: any, fullPath?: string[]): void;
}
```
</details>



## Proxy
all internal variables are managed by proxy. (DomRenderProxy)
### exclude proxy (situation: Maximum call stack error)
exclude detect property: Config
- proxyExcludeTyps: [Class...]

Code base
```typescript
// frezz
{name : Object.freeze({...})}

// Shield Object type: {[k: string]: any}
{name : new Shield()}

// DomRenderProxy Final
{name : DomRenderProxy.final({...})}
```
--- 


## LifeCycle
* OnCreateRender
  * onCreateRender(): created call
* OnInitRender
  * onInitRender(): init render call
* OnDestroyRender
  * onDestroyRender(): component Destroy call

## Script
```typescript
new DomRender.run(obj, target, {
  scripts: {
    concat: function (head: string, tail: string) {
      return head + tail; 
    }
  }
});
```
using script
```typescript
const data = config.scripts.concat('head', 'tail')
```
```html
<div>${$scripts.concat('head', 'tail')}</div>
<div dr-if="$scripts.concat('wow', 'good') === 'wowgood'"> is wowgood</div>
```

---
# Component, Attribute, AttributeCallBack
# 😃 examples
- [examples](./examples/component_script_attr) lazy load (html, css)
```html
<body id="app">
${@this@.name}$
<h1>component</h1>
<profile dr-on-create:callback="$component.name='jhone'; $component.age=55;"><b>${#component#.details}$</b></profile>
<profile dr-on-create:callback="$component.name='cal'; $component.age=56;"><b>detail-2</b></profile>
<profile dr-on-create:callback="$component.name='rose'; $component.age=57;">
    <profile dr-on-create:callback="$component.name='rose-sub'; $component.age=156;">
        <b>${@this@.name}$</b>
    </profile>
</profile>
<h3>component data link and detect</h3>
<Profile dr-if="@this@.toggle" dr-detect="$component.age = @this@.age" dr-on-create:callback="$component.name='papa'; $component.age=58;">
    <b>${@this@.name}$</b>
</Profile>
<Profile dr-if="@this@.toggle" dr-detect="$component.age = @this@.age" dr-on-constructor:arguments="[1,2]">
    <b>${@this@.name}$</b>
</Profile>

<button dr-event-click="@this@.name = new Date().toString();">change name</button>
<button dr-event-click="@this@.age = Date.now();">change age</button>
<button dr-event-click="@this@.toggle = !@this@.toggle;">change toggle</button>

<j1>component constructor, on-create, dr-on-create:callback</j1>
<home dr-constructor="[@this@.name, @this@.age, 'home welcom']" dr-on-create-arguments="{type: 'onCreate', data: 'datadata'}" dr-on-create:callback="$component.onInit('data')"></home>



<h1>scripts</h1>
<div>
    ${$scripts.concat('hello', 'tail')}$
</div>

<h1>attr</h1>
<button link="@this@.link">
link attribute
</button>
<h1>attrCallBack</h1>
<input id="callback" type="text" wow>
</body>
```
```typescript
config.targetElements = [
  DomRender.createComponent({type: Profile, template: ProfileTemplate}),  // lazy loading format 'lazy://component/home.html'
  DomRender.createComponent({type: Home, template: HomeTemplate, styles: HomeStyle})
]

config.targetAttrs = [
  DomRender.createAttribute('link',
          (element: Element, attrValue: string, obj: any, rawSet: RawSet) => {
            return obj;
          },
          (element: Element, attrValue: string, obj: any, rawSet: RawSet) => {
            const fag = window.document.createDocumentFragment();
            if (attrValue) {
              const n = element.cloneNode(true) as Element;
              attrValue = ScriptUtils.eval(`return ${attrValue}`, obj)
              n.addEventListener('click', () => {
                location.href = attrValue;
              });
              fag.append(n);
            }
            return fag;
          }
  )
]

config.applyEvents = [
  {
    attrName: 'wow',
    callBack: (e, a, o) => {
      e.addEventListener('click', (event) => {
        alert((event.target as any).value);
      })
    }
  }
]
const data = DomRender.run(new Data(), document.querySelector('#app')!, config);
```
using component
```html
<my-element dr-on-create:callback="$component.say();"></my-element>

<home value="${@this@.name}$" wow="${@this@.color}$">
  ${#component#.homeName}$
  <home value="${#component#.homeName}$" wow="${#component#.homeColor}$" dr-component-name="sub_component" dr-component-inner-html-name="innerHTML">
    ${#sub_component#.homeName}$
  </home>
</home>
```
lazy loading rollup config
```javascript
    copy({
            targets: [
                {
                    src: ['**/*.html', '**/*.css', '!node_modules/**/*.html', '!node_modules/**/*.css'], dest: 'dist',
                    rename: (name, extension, fullPath) => `${fullPath}`
                },
                { src: 'assets', dest: 'dist' }
            ]
        })
```

## parameter
- dr-option-component-inner-html-name
- dr-option-component-name

- callback
 - onChangeAttrRender
 -   onCreateRenderData<T = any>(data: OnCreateRenderDataParams<T>): void
   - type OnCreateRenderDataParams<T = any> = { parent: T, render: Render };
 - OnCreateThisChild
   - thisChild created callback
 - OnChildRenderedByProperty
   - onChildRenderedByProperty(key: string, value: any, config: {rawSets:RawSet[]}): void; 
- event
  - dr-event-...:filter  event filter!!
    - ex) dr-event-change:filter="false"
  - dr-event-...:dispatch
    - ```html
      <input name="${@this@.data.attribute.name}$"
       dr-event-change="@this@.change($element.checked)"
       dr-event-change:dispatch
       value="good"
       type="checkbox"
       checked
      />
      ```
- attribute
  - dr-on-constructor:arguments: component constructor arguments
  - dr-on-create:callback: component created init callback script
  - dr-on-create:arguments: component onCreatedRender arguments
  - dr-on-init:arguments: component onInitRender arguments
  - dr-on-rendered-init: rendered
    - $component: component  instance
    - $element: element instance
    - $attribute: element attribute object
    - $innerHTML: element innerHTML string
    - $creatorMetaData: metaData
  - #component#: component instance
  - #innerHTML#: element innerHTML
  - dr-option-this-name: renaming component variable name (default: component)
  - dr-option-component-name: renaming component variable name (default: component)
  - dr-option-inner-html-name: renaming innerHTML variable name (default: innerHTML)
---

# License
* MIT
* visualkhh@gmail.com
