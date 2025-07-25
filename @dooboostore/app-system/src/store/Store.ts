import { catchError, concat, debounceTime, defer, distinctUntilChanged, EMPTY, filter, from, map, Observable, OperatorFunction, repeat, shareReplay, tap, timer } from 'rxjs';
import { ValidUtils } from '@dooboostore/core/valid/ValidUtils';

export namespace Store {
  export namespace Observable {
    export type DepperResponseConfigType = {
      executeCount: number;
    }
    export type DepperResponseType<T> = {
      data: T;
      config: DepperResponseConfigType
    }

    // 약간이상하게 동작하는듯?
    export const createRepeat= <T>(source: Promise<T> | (()=>Promise<T>) | any, config?: {repeat:boolean, afterDelayTime: number}): Observable<DepperResponseType<T>> => {
      let executionCount = 0;
      // 1. 핵심 데이터 가져오기 Observable 정의 (에러 처리 포함)
      const fetchObservable$ = defer(() => {
        // Promise 또는 Promise 함수 실행
        const promiseSource = typeof source === 'function' ? source() : source;
        return from(promiseSource); // Promise를 Observable로 변환
      }).pipe(
        tap(() => {
          executionCount++;
          // console.log(`Execution count incremented: ${executionCount}`); // 디버깅 로그
        }),
        // 성공한 데이터와 현재 카운트를 객체로 매핑
        map(data => ({ data: data, config: {executeCount: executionCount} })),
        catchError((error) => {
          console.error(`${new Date().toLocaleTimeString()}: Source Error Handled:`, error?.message || error);
          // 에러 발생 시 값을 방출하지 않고 이 주기를 완료시킴
          return EMPTY;
        })
      ); // fetchObservable$ 정의 끝

      // 2. 반복될 기본 단위 시퀀스 정의 (지연 포함될 수 있음)
      let sequenceUnit$: Observable<any>;
      const needsDelay = config?.repeat && typeof config.afterDelayTime === 'number' && config.afterDelayTime >= 0;

      if (needsDelay) {
        // 반복이 필요하고 지연 시간이 유효하면: 데이터 가져오기 후 지연
        // concat을 사용하여 순차 실행 보장
        sequenceUnit$ = concat(fetchObservable$, timer(config.afterDelayTime!)); // Non-null assertion 사용
      } else {
        // 반복이 없거나 지연 시간이 없으면: 데이터 가져오기만 포함
        sequenceUnit$ = fetchObservable$;
      }

      // 3. 최종 Observable 정의 (조건부 반복 적용)
      let finalSequence$: Observable<any>;
      if (config?.repeat) {
        // 반복이 필요하면 sequenceUnit$에 repeat() 적용
        finalSequence$ = sequenceUnit$.pipe(repeat());
      } else {
        // 반복이 필요 없으면 sequenceUnit$ 그대로 사용 (1회 실행)
        finalSequence$ = sequenceUnit$;
      }

      // 4. 공통 후처리 연산자 적용 (shareReplay, filter)
      return finalSequence$.pipe(
        // repeat가 적용되었든 아니든 그 결과 Observable에 공통 연산자 적용
        shareReplay({ bufferSize: 1, refCount: true }),
        filter(it => it !== null && typeof it === 'object') // 이전 필터 로직 유지
      )
    }

    export const createDebounceDistinctUntilChanged = <T>(start: Observable<T>, config?: {debounceTime?: number, distinct?: boolean}) => {
      let result$ = start; // 시작 Observable
      // 2. 사용자가 타이핑을 멈출 때까지 1초 기다림
      if (ValidUtils.isNotNullUndefined(config?.debounceTime) && config?.debounceTime > 0) {
        result$ = result$.pipe(debounceTime<T>(config?.debounceTime));
      }
      // 3. 이전 값과 동일하면 무시 (예: 'abc' -> 'abc')
      if (ValidUtils.isNotNullUndefined(config?.distinct) && config?.distinct === true) {
        result$ = result$.pipe(distinctUntilChanged<T>());
      }

      return result$;
    }
  }
}