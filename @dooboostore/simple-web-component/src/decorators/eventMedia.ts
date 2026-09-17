import { ReflectUtils } from '@dooboostore/core';
import { ElementDefineLifeCycler, HelperHostSet } from '../types';
import { SwcUtils } from '../utils/Utils';

export const EVENT_MEDIA_METADATA_KEY = Symbol.for('simple-web-component:event-media');

export interface EventMediaMetadata {
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
export function eventMedia(query: string, eventType: string): MethodDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    let metaList = ReflectUtils.getOwnMetadata(EVENT_MEDIA_METADATA_KEY, constructor) as EventMediaMetadata[];
    if (!metaList) {
      metaList = [];
      ReflectUtils.defineMetadata(EVENT_MEDIA_METADATA_KEY, metaList, constructor);
    }
    metaList.push({ propertyKey, query, eventType });
  };
}

/** eventMedia(query, 'change')의 별칭 - MediaQueryList가 실제로 발생시키는 유일한 이벤트. */
export function eventMediaChange(query: string): MethodDecorator {
  return eventMedia(query, 'change');
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

    const entries: Array<{ mql: MediaQueryList; eventType: string; handler: (e: Event) => void }> = [];
    for (const meta of metaList) {
      const mql = helperHostSet.$w.matchMedia(meta.query);
      const handler = (e: Event) => {
        try {
          inst[meta.propertyKey](e, helperHostSet);
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
