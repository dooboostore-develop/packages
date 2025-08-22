import * as process from 'node:process';

export namespace MemoryUtils {

  /**
   * const used = memoryUsage();
   * for (let key in used) {
   *   console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
   * }
   * 반환 값:
   * rss: Resident Set Size, 프로세스가 사용하는 총 메모리.
   * heapTotal: 힙에 할당된 총 메모리.
   * heapUsed: 실제 사용 중인 힙 메모리.
   * external: V8 엔진 외부에서 사용되는 메모리 (C++ 객체 등).
   * arrayBuffers: ArrayBuffer와 SharedArrayBuffer에 사용된 메모리.
   */
  export const memoryUsage =() => {
    return process.memoryUsage();
  }
  /**
   * V8 엔진의 힙 스냅샷
   * V8 엔진의 힙 메모리 상태를 분석하려면 힙 스냅샷을 생성할 수 있습니다. 이를 위해 --inspect 플래그를 사용해 Node.js를 실행하고 Chrome DevTools를 연결합니다.
   * node --inspect app.js
   *
   * 외부 도구 사용
   *
   * pm2: 프로세스 관리 도구로, 메모리 사용량을 모니터링할 수 있습니다.
   * pm2 monit
   *
   * clinic.js: 메모리 사용량과 성능 병목 지점을 시각화.
   * clinic doctor -- node app.js
   *
   * 메모리 프로파일링 라이브러리
   *
   * heapdump 모듈을 사용해 힙 덤프를 생성하고 분석할 수 있습니다.
   * npm install heapdump
   */
}