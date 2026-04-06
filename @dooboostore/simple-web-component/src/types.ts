import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { Router } from '@dooboostore/core-web';
import {SwcAttributeConfigType, SwcConfigType} from "./SwcAppEngine";

export enum InjectSituationType {
  HOST_SET = 'SIMPLE_WEB_COMPONENT://HOSTSET',
  APP_HOST = 'SIMPLE_WEB_COMPONENT://APPHOST',
  APP_HOSTS = 'SIMPLE_WEB_COMPONENT://APPHOSTS',
  HOST = 'SIMPLE_WEB_COMPONENT://HOST',
  PARENT_HOST = 'SIMPLE_WEB_COMPONENT://PARENTHOST',
  HOSTS = 'SIMPLE_WEB_COMPONENT://HOSTS',
  FIRST_HOST = 'SIMPLE_WEB_COMPONENT://FIRSTHOST',
  LAST_HOST = 'SIMPLE_WEB_COMPONENT://LASTHOST',
  FIRST_APP_HOST = 'SIMPLE_WEB_COMPONENT://FIRSTAPPHOST',
  LAST_APP_HOST = 'SIMPLE_WEB_COMPONENT://LASTAPPHOST'
}

export type SwcRootType = 'light' | 'shadow' | 'all' | 'auto';

export type SpecialSelector = '$this' | '$window' | '$document' | '$host' | '$appHost' | '$firstHost' | '$lastHost' | '$firstAppHost' | '$lastAppHost' | '$hosts' | '$appHosts';

export type SwcQueryOptions = { root?: SwcRootType };

export type HelperSet = {
  $d: Document;
  $w: Window;
  $q: (selector: string, root?: Element | Document | ShadowRoot) => HTMLElement | null;
  $qa: (selector: string, root?: Element | Document | ShadowRoot) => HTMLElement[];
  $qi: (id: string, root?: Document | ShadowRoot) => HTMLElement | null;
};

export type HostSet = {
  $host: HTMLElement | null; // Nearest parent SWC component
  $parentHost: HTMLElement | null; // Grandparent SWC ancestor
  $hosts: HTMLElement[]; // All SWC ancestors [root, ..., parent]
  $firstHost: HTMLElement | null; // Top-most SWC ancestor
  $lastHost: HTMLElement | null; // Same as $host
  // $templateHost: HTMLTemplateElement | null | undefined;
  $appHost: SwcAppInterface | null;
  $appHosts: SwcAppInterface[];
  $firstAppHost: SwcAppInterface | null;
  $lastAppHost: SwcAppInterface | null;
};

export type HelperHostSet = HelperSet & HostSet & {$this: any};

export type SwcAppMessage<T = any> = {
  publisher?: any;
  data?: T;
  type?: string;
};

export interface SwcChooseInterface extends HTMLTemplateElement {
  value: any;
  refresh(a: any): void;
}
export interface SwcIfInterface extends HTMLTemplateElement {
  value: any;
  refresh(): void;
}
export interface SwcAppInterface extends HTMLElement {
  simpleApplication?: SimpleApplication;
  config?:  SwcConfigType;
  router?: Router;
  connect(config?: SwcAttributeConfigType): Promise<void>;
  routing(path: string): Promise<void>;
  reload(): void;
  back(): void;
  forward(): void;
  publishMessage(message: SwcAppMessage): void;
}

export interface SwcElement {
  // _swcId: string;
  createSlotString(id: string): string
  createEaHtml(id: string, script: string): string
  createEaText(id: string, script: string): string
  createEaAttribute(id: string, attributeName: string): string
  createEaEvent(id: string, eventName: string): string
  createEaProperty(id: string, propertyName: string): string
}