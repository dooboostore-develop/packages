import { ReplaySubject } from './ReplaySubject';
import { Subject } from './Subject';
import { Subscription } from './Subscription';

class ReplayForwardSubject<T> extends ReplaySubject<T> {
  private forward = new Subject<T>();
  private internalSub: Subscription;  // 내부 구독 저장

  constructor(bufferSize?: number) {
    super(bufferSize);  // 버퍼 크기 옵션으로 (기본 무한)
    this.internalSub = this.subscribe(this.forward.next.bind(this.forward));  // 구독 저장
  }

  getForwardOnly() {
    return this.forward.asObservable();
  }

  // 소멸 시 호출할 destroy 메서드 (또는 complete 오버라이드)
  destroy() {
    if (this.internalSub && !this.internalSub.closed) {
      this.internalSub.unsubscribe();  // 내부 구독 해제
    }
    super.complete();  // 부모 complete 호출 (자동 cleanup)
    this.forward.complete();  // forward도 complete (선택: 구독자 notify)
  }

  // 옵션: complete 오버라이드 (destroy 대신 사용 가능)
  override complete() {
    if (this.internalSub && !this.internalSub.closed) {
      this.internalSub.unsubscribe();
    }
    super.complete();
    this.forward.complete();
  }
}