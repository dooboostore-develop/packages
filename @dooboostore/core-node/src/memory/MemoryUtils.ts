import * as process from 'node:process';
import * as v8 from 'v8';
import * as path from 'path';

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
  /*
  // setInterval(()=>{
//   const used = MemoryUtils.memoryUsage();
//   const m = Array.from(Object.entries(used)).map(([key, value]) => `${key}: ${Math.round(value / 1024 / 1024 * 100) / 100} MB`)
//   console.log(m.join(',\t'))
// }, 1000)

   */
  export const memoryUsage = () => {
    return process.memoryUsage();
  };

  /**
   * 메모리 사용량을 포맷팅하여 로깅
   */
  export const logMemoryUsage = (): void => {
    const used = memoryUsage();
    const m = Array.from(Object.entries(used)).map(
      ([key, value]) => `${key}: ${Math.round((value / 1024 / 1024) * 100) / 100} MB`
    );
    console.log(`[Memory] ${m.join(', ')}`);
  };

  /**
   * Heap snapshot 생성
   * @param logPath 저장 경로
   * @returns 생성된 파일 경로 또는 null
   */
  export const writeHeapSnapshot = (logPath: string): string | null => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(logPath, `heap-${timestamp}.heapsnapshot`);

    try {
      const heapSnapshot = v8.writeHeapSnapshot(filename);
      console.log(`✅ Heap snapshot created: ${heapSnapshot}`);
      logMemoryUsage();
      return heapSnapshot;
    } catch (error) {
      console.error('❌ Failed to create heap snapshot:', error);
      return null;
    }
  };


  /** pm2config
   module.exports = {
   apps: [
   {
   name: 'genview',
   cwd: '/home/dooboostore/genview',
   script: '/home/dooboostore/genview/deploy/genview/dist-back-end/index.js',
   instances: 'max', // CPU 코어 수만큼 인스턴스 생성 (또는 숫자로 지정: 2, 4 등)
   exec_mode: 'cluster', // 클러스터 모드
   watch: false,
   max_memory_restart: '1G',
   node_args: [
   '--max-old-space-size=1024',  // 힙 메모리 1GB 제한
   '--inspect=9229',              // 디버거 활성화 (chrome://inspect에서 연결)
   '--trace-warnings',            // 경고 추적
   '--expose-gc'                  // GC 수동 실행 가능
   ],
   env: {
   NODE_ENV: 'production',
   PORT: 3000
   },
   error_file: '/home/dooboostore/genview/logs/genview-error.log',
   out_file: '/home/dooboostore/genview/logs/genview-out.log',
   log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
   merge_logs: true,
   autorestart: true,
   max_restarts: 10,
   min_uptime: '10s',
   restart_delay: 4000,            // 재시작 간 4초 딜레이
   kill_timeout: 5000,             // 종료 타임아웃
   listen_timeout: 3000            // 시작 타임아웃
   }
   ]
   };

   */
  /**
   * # 또는 CLI로 덤프 생성
   * node --inspect apps/genview/back-end/index.ts
   * # 또는 CLI로 덤프 생성
   * node --inspect=9229 apps/genview/back-end/index.ts
   *
   * 완료! 각 앱마다 다른 inspect 포트를 할당했어요:
   *
   * 포트 할당
   * genview: 9229 (ecosystem.config.js)
   * collector: 9230
   * generator: 9231
   * message: 9232
   * schedule: 9233
   * 적용 방법
   * # 서버에서 실행
   * pm2 reload ecosystem.config.js
   * pm2 reload ecosystem.job.config.js
   *
   * # 또는 전체 재시작
   * pm2 restart all
   * Chrome DevTools로 디버깅하는 방법
   * GCP 방화벽 규칙 추가 (필요시)
   * # 9229-9233 포트 열기
   * gcloud compute firewall-rules create allow-node-inspect \
   *   --allow tcp:9229-9233 \
   *   --source-ranges YOUR_IP/32
   * SSH 터널링 (더 안전한 방법 - 추천)
   * # 로컬에서 실행
   * ssh -L 9229:localhost:9229 \
   *     -L 9230:localhost:9230 \
   *     -L 9231:localhost:9231 \
   *     -L 9232:localhost:9232 \
   *     -L 9233:localhost:9233 \
   *     user@your-gcp-server
   * Chrome에서 접속
   * Chrome 열고 chrome://inspect 접속
   * "Configure" 클릭 → localhost:9229, localhost:9230 등 추가
   * "Remote Target" 섹션에 프로세스들이 나타남
   * "inspect" 클릭하면 DevTools 열림
   * 메모리 프로파일링
   * Memory 탭 → "Take heap snapshot" 클릭
   * 시간 간격 두고 여러 번 찍어서 비교
   * 계속 증가하는 객체 찾기
   * CPU 프로파일링
   * Profiler 탭 → "Start" 클릭
   * 일정 시간 후 "Stop"
   * 어떤 함수가 CPU 많이 쓰는지 확인
   * 네, --inspect=9229 옵션으로 Node.js가 디버거 모드로 실행되고, 해당 포트로 Chrome DevTools가 연결할 수 있어요!
   */
  /**
   * SIGUSR2 시그널 핸들러 등록 (heap dump 생성)
   * # 서버에서 실행
   * pm2 sendSignal SIGUSR2 genview
   *
   * # 또는 PID로 직접
   * kill -SIGUSR2 <PID>
   * @param logPath 저장 경로
   */
  export const registerHeapDumpSignal = (logPath: string): void => {
    process.on('SIGUSR2', () => {
      console.log('🔍 Received SIGUSR2 signal - Creating heap snapshot...');
      writeHeapSnapshot(logPath);
    });
    console.log('💡 Heap dump signal handler registered (pm2 sendSignal SIGUSR2 <app-name>)');
  };

  /**
   * 주기적 메모리 모니터링 시작
   * @param intervalMs 모니터링 간격 (밀리초)
   * @param thresholdMB 메모리 임계값 (MB) - 초과 시 자동 heap dump 생성
   * @param logPath heap dump 저장 경로 (임계값 설정 시 필수)
   * @returns 인터벌 ID (중지 시 사용)
   */
  export const startMemoryMonitoring = (
    intervalMs: number = 1000 * 60 * 5,
    thresholdMB?: number,
    logPath?: string
  ): NodeJS.Timeout => {
    return setInterval(() => {
      const used = memoryUsage();
      const heapUsedMB = used.heapUsed / 1024 / 1024;

      logMemoryUsage();

      if (thresholdMB && heapUsedMB > thresholdMB) {
        console.warn(`⚠️ High memory usage: ${heapUsedMB.toFixed(2)} MB (threshold: ${thresholdMB} MB)`);
        if (logPath) {
          console.warn('🔍 Creating automatic heap snapshot...');
          writeHeapSnapshot(logPath);
        }
      }
    }, intervalMs);
  };

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