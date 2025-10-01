import * as process from 'node:process';

export namespace ProcessUtils {
  // 프로세스 ID 반환
  export const getPid = () => {
    return process.pid;
  }

  // 플랫폼 정보 반환 (darwin, linux, win32 등)
  export const getPlatform = () => {
    return process.platform;
  }

  // Node.js 버전 반환
  export const getNodeVersion = () => {
    return process.version;
  }

  // 아키텍처 반환 (x64, arm64 등)
  export const getArch = () => {
    return process.arch;
  }

  // 현재 작업 디렉터리 반환
  export const getCwd = () => {
    return process.cwd();
  }

  // 환경 변수 가져오기
  export const getEnv = (key: string) => {
    return process.env[key];
  }

  // 환경 변수 설정하기
  export const setEnv = (key: string, value: string) => {
    process.env[key] = value;
  }

  // 프로세스 실행 시간 (초 단위)
  export const getUptime = () => {
    return process.uptime();
  }

  // CPU 사용량 정보
  export const getCpuUsage = () => {
    return process.cpuUsage();
  }

  // 명령줄 인수 반환
  export const getArgv = () => {
    return process.argv;
  }

  // 프로세스 타이틀 반환
  export const getTitle = () => {
    return process.title;
  }

  // production 환경인지 확인
  export const isProduction = () => {
    return process.env.NODE_ENV === 'production';
  }

  // development 환경인지 확인
  export const isDevelopment = () => {
    return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  }

  // test 환경인지 확인
  export const isTest = () => {
    return process.env.NODE_ENV === 'test';
  }

  // Node.js 및 의존성 버전 정보
  export const getVersions = () => {
    return process.versions;
  }

  // 프로세스 종료
  export const exit = (code: number = 0) => {
    process.exit(code);
  }

  // 종료 시 실행될 훅 설정
  // process.on('exit', (code) => {
  //   console.log(`Process exited with code: ${code}`);
  //   // 동기 작업만 가능
  // });
  //
  // // 종료 전 실행 (비동기 가능)
  // process.on('beforeExit', async (code) => {
  //   console.log('Process will exit with code:', code);
  //   // 비동기 작업 예시
  //   await new Promise(resolve => setTimeout(resolve, 1000));
  //   console.log('Cleanup completed before exit');
  // });
  //
  // // Ctrl+C (SIGINT) 처리
  // process.on('SIGINT', async () => {
  //   console.log('Received SIGINT. Performing cleanup...');
  //   // 비동기 작업
  //   await new Promise(resolve => setTimeout(resolve, 1000));
  //   console.log('Cleanup done. Exiting...');
  //   process.exit(0); // 명시적 종료
  // });
  //
  // // SIGTERM 처리
  // process.on('SIGTERM', async () => {
  //   console.log('Received SIGTERM. Performing cleanup...');
  //   // 비동기 작업
  //   await new Promise(resolve => setTimeout(resolve, 1000));
  //   console.log('Cleanup done. Exiting...');
  //   process.exit(0);
  // });
  //
  // // 예외 처리
  // process.on('uncaughtException', (error) => {
  //   console.error('Uncaught Exception:', error.message);
  //   process.exit(1); // 종료
  // });
}