import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { Router } from '@dooboostore/core-web/routers/Router';

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

export type SpecialSelector = ':host' | ':window' | ':document' | ':parentHost' | ':appHost' | ':firstHost' | ':lastHost' | ':firstAppHost' | ':lastAppHost' | ':hosts' | ':appHosts';

export type SwcQueryOptions = { root?: SwcRootType };

export type HelperSet = {
  $d: Document;
  $w: Window;
  $q: (selector: string, root?: Element | Document | ShadowRoot) => HTMLElement | null;
  $qa: (selector: string, root?: Element | Document | ShadowRoot) => HTMLElement[];
  $qi: (id: string, root?: Document | ShadowRoot) => HTMLElement | null;
};

export type HostSet = {
  $host: HTMLElement; // Current component itself
  $parentHost: HTMLElement | null; // Nearest parent SWC component
  $hosts: HTMLElement[]; // [root, ..., parent, self]
  $firstHost: HTMLElement | null; // Top-most SWC ancestor
  $lastHost: HTMLElement | null; // Same as $parentHost (for backward compatibility or clarity)
  $appHost: SwcAppInterface | null;
  $appHosts: SwcAppInterface[];
  $firstAppHost: SwcAppInterface | null;
  $lastAppHost: SwcAppInterface | null;
};

export type HelperHostSet = HelperSet & HostSet;

export interface SwcAppInterface extends HTMLElement {
  simpleApplication?: SimpleApplication;
  router?: Router;
  routing(path: string): Promise<void>;
}
