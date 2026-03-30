import {ConstructorType} from '@dooboostore/core';
import {RawSet} from '../rawsets/RawSet';
import {Messenger} from '../messenger/Messenger';
import {TargetElement} from './TargetElement';
import {TargetAttr} from './TargetAttr';
import {Attrs} from '../rawsets/Attrs';
import {OperatorAround} from '../operators/OperatorExecuter';
import {EventManager} from '../events/EventManager';
import {Router} from "@dooboostore/core-web";

export type DomRenderConfig<T = any> = {
  window: Window;
  targetElements?: TargetElement[];
  targetAttrs?: TargetAttr[];
  operatorAround?: { [key in keyof Attrs]?: OperatorAround },
  onElementInit?: (name: string, obj: any, rawSet: RawSet, targetElement: TargetElement) => any;
  onAttrInit?: (name: string, attrValue: string, obj: any, rawSet: RawSet) => any;
  proxyExcludeTyps?: ConstructorType<any>[];
  proxyExcludeOnBeforeReturnSets?: string[];
  proxyExcludeOnBeforeReturnGets?: string[];
  uuid: string;
  scripts?: { [n: string]: any };
  root: any;
  rootElement?: Element | null;
  router?: Router;
  messenger: Messenger;
  eventManager: EventManager;
  eventVariables?: { [n: string]: any };
  applyEvents?: { attrName: string, callBack: (elements: Element, attrValue: string, obj: any) => void }[];
}
