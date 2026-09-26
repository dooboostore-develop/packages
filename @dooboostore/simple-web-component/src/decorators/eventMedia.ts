import { ReflectUtils } from '@dooboostore/core';
import { ElementDefineLifeCycler, HelperHostSet } from '../types';
import { SwcUtils } from '../utils/Utils';
import { buildSwcParameterArgs } from './parameter';

export const EVENT_MEDIA_METADATA_KEY = Symbol.for('simple-web-component:event-media');

export interface EventMediaOptions<Return = any> {
  /** 미디어쿼리 변화 시 핸들러 실행 여부 게이트. Promise<boolean>도 되어 async 판정 가능. false면 스킵. */
  filter?: (e: MediaQueryListEvent, meta: { currentThis: any; helper: HelperHostSet }) => boolean | Promise<boolean>;
  /** filter 통과 후 핸들러 직전 훅. await되고, 리턴값은 @eventMediaBeforeReturn 으로 핸들러에 주입된다. */
  before?: (e: MediaQueryListEvent, meta: { currentThis: any; helper: HelperHostSet }, args: any[]) => any | Promise<any>;
  /** 핸들러가 성공/실패해도 항상 실행되는 정리 훅. ctx로 핸들러 인자/결과/에러를 받는다. 에러는 삼키지 않고(로깅됨). */
  finally?: (e: MediaQueryListEvent, meta: { currentThis: any; helper: HelperHostSet }, ctx: { args: any[]; result?: Return; error?: any }) => any | Promise<any>;
}

export interface EventMediaMetadata extends EventMediaOptions {
  propertyKey: string | symbol;
  query: string;
  eventType: string;
}

/**
 * CSS 미디어쿼리(`window.matchMedia`) 상태 변화를 감지한다.
 * connect 시 자동으로 구독하고, disconnect 시 자동으로 해제한다.
 *
 * MediaQueryList는 스펙상 'change' 이벤트 하나만 정의돼있다 — eventType은 그래도 명시적으로 받는다
 * (다른 @event* 계열처럼 베이스는 명시적, 편의 별칭이 값을 고정하는 컨벤션을 따름). 'change' 고정 버전은
 * eventMediaChange를 사용한다.
 */
export function eventMedia(query: string, eventType: string): MethodDecorator;
export function eventMedia<Return = any>(query: string, eventType: string, options: EventMediaOptions<NoInfer<Return>>): MethodDecorator;
export function eventMedia(query: string, eventType: string, options?: EventMediaOptions): MethodDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    let metaList = ReflectUtils.getOwnMetadata(EVENT_MEDIA_METADATA_KEY, constructor) as EventMediaMetadata[];
    if (!metaList) {
      metaList = [];
      ReflectUtils.defineMetadata(EVENT_MEDIA_METADATA_KEY, metaList, constructor);
    }
    metaList.push({ propertyKey, query, eventType, filter: options?.filter, before: options?.before, finally: options?.finally });
  };
}

/** eventMedia(query, 'change')의 별칭 - MediaQueryList가 실제로 발생시키는 유일한 이벤트. */
export function eventMediaChange(query: string): MethodDecorator;
export function eventMediaChange<Return = any>(query: string, options: EventMediaOptions<NoInfer<Return>>): MethodDecorator;
export function eventMediaChange(query: string, options?: EventMediaOptions): MethodDecorator {
  return eventMedia(query, 'change', options as any);
}

export const findAllEventMediaMetadata = (target: any): EventMediaMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  return (ReflectUtils.findAllMetadata<EventMediaMetadata[]>(EVENT_MEDIA_METADATA_KEY, constructor) || []).flat();
};

export class EventMediaLifeCycler implements ElementDefineLifeCycler {
  private readonly entriesMap = new WeakMap<any, Array<{ mql: MediaQueryList; eventType: string; handler: (e: Event) => void }>>();

  onConnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    const metaList = findAllEventMediaMetadata(inst);
    if (metaList.length === 0) return;

    const win = helperHostSet.$w;
    const entries: Array<{ mql: MediaQueryList; eventType: string; handler: (e: Event) => void }> = [];
    for (const meta of metaList) {
      const mql = win.matchMedia(meta.query);
      const handler = async (e: Event) => {
        try {
          const helper = SwcUtils.getHelperAndHostSet(win, inst);
          if (meta.filter && !(await meta.filter(e as MediaQueryListEvent, { currentThis: inst, helper }))) return;
          const hostSet = SwcUtils.getHostSet(inst);
          const helperSet = SwcUtils.getHelperSet(win);
          const legacyArgs = [e, helperHostSet];
          const buildArgs = (beforeReturn: any) => buildSwcParameterArgs(inst, meta.propertyKey, {
            eventObject: e,
            hostSet,
            helperHostSet: helper,
            helperSet,
            eventMediaBeforeReturn: beforeReturn
          }, legacyArgs);
          // before를 먼저 돌려 그 리턴값을 @eventMediaBeforeReturn 으로 주입.
          let args = buildArgs(undefined);
          if (meta.before) {
            const beforeReturn = await meta.before(e as MediaQueryListEvent, { currentThis: inst, helper }, args);
            args = buildArgs(beforeReturn);
          }
          let result: any, error: any;
          try {
            result = await inst[meta.propertyKey](...args);
          } catch (err) {
            error = err;
          } finally {
            if (meta.finally) await meta.finally(e as MediaQueryListEvent, { currentThis: inst, helper }, { args, result, error });
          }
          if (error) throw error;
        } catch (err) {
          console.error('[SWC] eventMedia handler error:', err);
        }
      };
      mql.addEventListener(meta.eventType, handler);
      entries.push({ mql, eventType: meta.eventType, handler });
    }
    this.entriesMap.set(inst, entries);
  }

  onDisconnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    for (const { mql, eventType, handler } of this.entriesMap.get(inst) ?? []) {
      try {
        mql.removeEventListener(eventType, handler);
      } catch (e) {
        console.error('[SWC] eventMedia cleanup error:', e);
      }
    }
    this.entriesMap.delete(inst);
  }
}
