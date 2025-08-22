export namespace ProcessUtils {
  // // 종료 시 실행될 훅 설정
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