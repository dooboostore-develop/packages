import { elementDefine, innerHtml } from '../index';

@elementDefine({ name: 'swc-other' })
export class SwcOther extends HTMLElement {
  @innerHtml({ useShadow: true })
  render() {
    return `
      <style>:host { display: contents; }</style>
      <slot></slot>
    `;
  }
}
