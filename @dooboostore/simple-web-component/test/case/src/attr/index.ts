import 'reflect-metadata';
import { elementDefine, innerHtml, attribute, onAttributeChanged } from '@dooboostore/simple-web-component';

@elementDefine({ name: 'attr-element' })
class AttrElement extends HTMLElement {
  @attribute({ type: Number }) count = 0;
  @attribute({ type: Boolean }) active = false;

  @innerHtml
  render() {
    return `
            <div style="padding: 10px; border: 1px solid #ccc;">
                <p>Count: <strong>{{count}}</strong></p>
                <p>Active: <strong>{{active}}</strong></p>
            </div>
        `;
  }

  @onAttributeChanged('count')
  onCountChange(newVal: any, oldVal: any) {
    console.log(`Count changed from ${oldVal} to ${newVal}`);
  }

  @onAttributeChanged('active')
  onActiveChange(newVal: any, oldVal: any) {
    console.log(`Active state changed: ${newVal}`);
  }
}
