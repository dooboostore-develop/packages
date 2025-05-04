export interface Runnable<R = any, PR =void> {
  run(params: PR, ...p: any[]): R;
  stop?(): void;
}
// export interface Runnable<R = any, PR extends [...unknown[]] = [...unknown[]]> {
//   run(...params: PR): R;
//   stop?(): void;
// }
