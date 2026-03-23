import { elementDefine, innerHtml } from '../index';

@elementDefine({ name: 'swc-when' })
export class SwcWhen extends HTMLElement {
  @innerHtml({ useShadow: true })
  render() {
    return `
      <style>:host { display: contents; }</style>
      <slot></slot>
    `;
  }
}
