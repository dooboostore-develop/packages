import { RequestResponse } from '../models/RequestResponse';

/**
 * SSR 인프로세스 렌더용 sim 래퍼.
 *
 * 클라이언트는 SymbolIntentApiServiceProxy 가 HTTP 로 호출하며 IntentSchemeFilter 가
 * intent.data 마지막에 rr(RequestResponse) 을 붙여 백서비스의 data 인자로 전달한다.
 * 반면 SSR 은 페이지가 sim 을 인프로세스로 직접 호출(`svc.method(request)`)하므로 rr 이 없다.
 *
 * 이 프록시는 그 공백을 메운다 — 메서드 호출 시 넘어온 인자 **뒤에 rr 을 붙여준다**.
 * IntentSchemeFilter 규약과 동일하게:
 *   - 인자 0개 → (rr)            // 본문·쿼리 없는 요청과 동일
 *   - 인자 1개 → (request, rr)   // 일반 서비스 호출
 *   - 인자 N개 → (...args, rr)   // 이미 data 를 넘겼으면 그건 그대로 쓰이고 rr 은 뒤에 무시됨
 *
 * 백서비스 메서드가 `data?: RequestResponse` 옵셔널이라 fn.length 로 arity 를 못 재므로
 * (옵셔널은 length 에서 제외) "메서드 파라미터 수"가 아니라 "호출 인자 뒤 append" 방식을 쓴다.
 *
 * constructor / 비함수 프로퍼티는 감싸지 않는다 — Sim 이 it.constructor 로 타입·메타데이터를 찾기 때문.
 * rr 이 없으면(비SSR) 인자를 그대로 흘려보낸다.
 */
export const injectRequestResponse = <T extends object>(sim: T, rr?: RequestResponse): T =>
  new Proxy(sim, {
    get(target: any, prop: string | symbol) {
      const value = target[prop];
      if (prop === 'constructor' || typeof value !== 'function') return value;
      if (!rr) return value.bind(target);
      return (...args: any[]) => value.apply(target, [...args, rr]);
    }
  });
