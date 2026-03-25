import 'reflect-metadata';
import { elementDefine, innerHtml, onBeforeConnected, onAfterConnected, onBeforeDisconnected, onAfterDisconnected } from '@dooboostore/simple-web-component';

@elementDefine({ name: 'lifecycle-element' })
class LifecycleElement extends HTMLElement {
  @innerHtml
  render() {
    return `<div>Check console for lifecycle logs</div>`;
  }

  @onBeforeConnected
  beforeConnected() {
    console.log('1. onBeforeConnected');
  }

  @onAfterConnected
  afterConnected() {
    console.log('2. onAfterConnected');
  }

  @onBeforeDisconnected
  beforeDisconnected() {
    console.log('3. onBeforeDisconnected');
  }

  @onAfterDisconnected
  afterDisconnected() {
    console.log('4. onAfterDisconnected');
  }
}
