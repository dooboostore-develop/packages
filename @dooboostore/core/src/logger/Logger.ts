// import { InspectOptions } from 'node:util';
import { DateUtils } from '../date/DateUtils';

export enum LoggerLevel {
  LOG = 'LOG',
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  TRACE = 'TRACE',
  OFF = 'OFF'
}

// logFormat
// ${date:'yyyy-MM-dd'} ${level} ${line} ${file} ${message}
// dateFormat :  yyyy-MM-dd HH:mm:ss
export type LoggerConfig = { level: LoggerLevel, format?: string };
//
// export interface Logger {
//   log(...args: any[]): void;
//
//   error(...args: any[]): void;
//
//   warn(...args: any[]): void;
//
//   info(...args: any[]): void;
//
//   debug(...args: any[]): void;
//
//   trace(...args: any[]): void;
// }

export class  Logger {
  constructor(protected config?: LoggerConfig) {}

  public setConfig(config: LoggerConfig) {
    this.config = config;
  }

  private _log(logLevel: LoggerLevel, ...args: any[]) {
    const now = new Date();
    let file, line;
    // const isNode = typeof process !== "undefined" && process.versions && process.versions.node;
    // console.log('------------isNode', isNode);
    // 환경별 스택 추출
    // if (isNode) {
    //   const stackObj = {} as any;
    //   Error.captureStackTrace(stackObj, this._log);
    //   const stack = stackObj?.stack.split("\n")[1];
    //   const match = stack.match(/at (.*):(\d+):(\d+)/);
    //   const path = isNode ? require("path") : null;
    //   file = path.basename(match[1]);
    //   line = match[2];
    // } else {
      const err = new Error();
      const stackLines = err.stack.split("\n");
    // console.log('------------', stackLines);
      let stack = stackLines[3];
      const match = stack.match(/(?:at\s)?(?:.*\s)?(?:\(|\@)?(.*):(\d+):(\d+)/);
    // console.log('mmmmmmmmmmmmm', match);
      file = match[1]; //new URL(match[1]).pathname.split("/").pop();
      line = `${match[2]}:${match[3]}`;
    // }

    // 출력 문자열 생성
    // const formattedDate = formatDate(now);
    const message = args.map(arg =>
      typeof arg === "object" ? JSON.stringify(arg) : String(arg)
    ).join(" ");

    const format = this.config?.format ?? '';
    // 포맷 파싱 및 적용
    let output = format;
    // 날짜 처리: ${date:'형식'}
    const dateMatch = format.match(/\${date:'([^']+)'\}/);
    if (dateMatch) {
      const dateFormat = dateMatch[1];
      output = output.replace(dateMatch[0], DateUtils.format(now, dateFormat));
    }
    // // 줄 번호 처리: ${line:자릿수}
    output = output.replace("${line}", line);
    output = output.replace("${level}", logLevel);
    // const lineMatch = format.match(/\${line:(\d+)\}/);
    // if (lineMatch) {
    //   const digits = parseInt(lineMatch[1], 10);
    //   const paddedLine = String(line).padStart(digits, "0");
    //   output = output.replace(lineMatch[0], paddedLine);
    // }
    // 파일명 처리
    output = output.replace("${file}", file.split('/').pop() ?? '');
    // 메시지 처리
    output = output.replace("${message}", message);
    return output;

    // const output = `[${formattedDate}] [${file}:${line}] ${message}`;
    //
    // // 캡처 및 출력
    // capturedOutput += output + "\n";
  }


  public log(msg: string,...args: any[]) {
    if (this.config?.level === LoggerLevel.OFF) {
      return;
    }
    console.log(this._log(LoggerLevel.LOG, msg),...args);
  }
  // public logDir(obj: any, option?: InspectOptions) {
  //   if (this.config?.level === LoggerLevel.OFF) {
  //     return;
  //   }
  //   console.dir(obj, option);
  // }

  public error(msg: string, ...args: any[]) {
    if (this.config?.level === LoggerLevel.OFF) {
      return;
    }
    (console.error ?? console.log)(this._log(LoggerLevel.ERROR, msg), ...args);
  }
  // public errorDir(obj: any, option?: InspectOptions) {
  //   if (this.config?.level === LoggerLevel.OFF) {
  //     return;
  //   }
  //   console.dir(obj, option);
  // }

  public warn(msg: string,...args: any[]) {
    if (
      this.config?.level === LoggerLevel.ERROR ||
      this.config?.level === LoggerLevel.LOG ||
      this.config?.level === LoggerLevel.OFF
    ) {
      return;
    }
    (console.warn ?? console.log)(this._log(LoggerLevel.WARN, msg),...args);
  }
  // public warnDir(obj: any, option?: InspectOptions) {
  //   if (
  //     this.config?.level === LoggerLevel.ERROR ||
  //     this.config?.level === LoggerLevel.LOG ||
  //     this.config?.level === LoggerLevel.OFF
  //   ) {
  //     return;
  //   }
  //   console.dir(obj, option);
  // }

  public info(msg: string,...args: any[]) {
    if (
      this.config?.level === LoggerLevel.WARN ||
      this.config?.level === LoggerLevel.ERROR ||
      this.config?.level === LoggerLevel.LOG ||
      this.config?.level === LoggerLevel.OFF
    ) {
      return;
    }
    (console.info ?? console.log)(this._log(LoggerLevel.INFO, msg),...args);
  }
  // public infoDir(obj: any, option?: InspectOptions) {
  //   if (
  //     this.config?.level === LoggerLevel.WARN ||
  //     this.config?.level === LoggerLevel.ERROR ||
  //     this.config?.level === LoggerLevel.LOG ||
  //     this.config?.level === LoggerLevel.OFF
  //   ) {
  //     return;
  //   }
  //   console.dir(obj, option);
  // }

  public debug(msg: string, ...args: any[]) {
    if (
      this.config?.level === LoggerLevel.INFO ||
      this.config?.level === LoggerLevel.WARN ||
      this.config?.level === LoggerLevel.ERROR ||
      this.config?.level === LoggerLevel.LOG ||
      this.config?.level === LoggerLevel.OFF
    ) {
      return;
    }
    (console.debug ?? console.log)(this._log(LoggerLevel.DEBUG, msg),...args);
  }
  // public debugDir(obj: any, option?: InspectOptions) {
  //   if (
  //     this.config?.level === LoggerLevel.INFO ||
  //     this.config?.level === LoggerLevel.WARN ||
  //     this.config?.level === LoggerLevel.ERROR ||
  //     this.config?.level === LoggerLevel.LOG ||
  //     this.config?.level === LoggerLevel.OFF
  //   ) {
  //     return;
  //   }
  //   console.dir(obj, option);
  // }

  public trace(...args: any[]) {
    if (this.config?.level === LoggerLevel.TRACE) {
      (console.trace ?? console.log)(...args);
    }
  }
  // public traceDir(obj: any, option?: InspectOptions) {
  //   if (this.config?.level === LoggerLevel.TRACE) {
  //     console.dir(obj, option);
  //   }
  // }
}
