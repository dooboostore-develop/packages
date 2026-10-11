// 컴파일 전용 검사 (test:types): @fetch 필드는 `(...args) => Promise<…>` 로 선언해야 한다
import { fetch, fetchGet, fetchPost } from '../../src/index.ts';

type Post = { title: string };
declare const w: Window & { HTMLElement: typeof HTMLElement };

export class Fields extends w.HTMLElement {
  @fetchGet('/a') declare ok: (id: number) => Promise<Post>;
  @fetchPost('/a') declare okVoid: (body: Post) => Promise<void>;
  @fetchGet('/a') declare protected okProtected: () => Promise<Post>;   // TS 가 못 봐서 검사 없이 통과
  // @ts-expect-error 반환이 Promise 가 아님
  @fetchGet('/a') declare notPromise: () => Post;
  // @ts-expect-error 함수가 아님
  @fetchGet('/a') declare notFunction: string;
  // 값 필드: Promise 도 된다 (별칭도 같음)
  @fetch('/a') declare value: Promise<Post>;
  @fetchGet('/a') declare value2: Promise<Post>;

  // 옵셔널 값 필드: strict 에서도 undefined 로 비울 수 있다
  @fetch('/a') declare optional?: Promise<Post>;
  reload() { this.optional = undefined; }
  // @ts-expect-error 옵셔널이어도 Promise 가 아니면 막힌다
  @fetch('/a') declare optionalStr?: string;

  // 메서드 방식은 그대로
  @fetchGet('/a') method(_p?: Promise<Post>) { return 1; }
}
