import * as nodePath from 'path';
import * as fs from 'fs';
export namespace PathUtils {

  // __dirname은 Node.js에서 현재 파일이 위치한 디렉터리의 절대 경로를 나타내는 전역 변수입니다.
  //   예를 들어, console.log(__dirname)을 실행하면 해당 파일이 있는 폴더의 전체 경로가 출력됩니다.
  //   주로 파일 경로를 조합하거나, 파일 시스템 작업을 할 때 많이 사용됩니다.
  // __dirname: 현재 파일이 위치한 디렉터리의 절대 경로
  // __filename: 현재 파일의 절대 경로
  // exports: 현재 모듈의 export 객체
  // module: 현재 모듈 객체
  // require: 모듈을 불러오는 함수
  // global: 전역 객체 (브라우저의 window와 유사)
  // process: 현재 Node.js 프로세스에 대한 정보와 제어 제공


  // join(...paths: string[]): 여러 경로 조각을 하나의 경로로 합칩니다. 내부적으로 Node.js의 path.join을 사용합니다.
  export const join = (...paths: string[]) => {
    return nodePath.join(...paths);
  }

  // basename(path: string, suffix?: string): 경로에서 파일명(확장자 포함 또는 제외)을 반환합니다. Node.js의 path.basename을 사용합니다.
  export const basename = (path: string, suffix?: string) => {
    // new URL(video.thumbnailUrl).pathname
    return nodePath.basename(path, suffix);
  }

  // resolve(...paths: string[]): 절대 경로를 생성합니다.
  export const resolve = (...paths: string[]) => {
    return nodePath.resolve(...paths);
  }

  // dirname(path: string): 경로에서 디렉터리 부분을 반환합니다.
  export const dirname = (path: string) => {
    return nodePath.dirname(path);
  }

  // extname(path: string): 경로에서 확장자를 반환합니다.
  export const extname = (path: string) => {
    return nodePath.extname(path);
  }

  // parse(path: string): 경로를 분석하여 객체로 반환합니다.
  export const parse = (path: string) => {
    return nodePath.parse(path);
  }

  // format(pathObject): 경로 객체를 경로 문자열로 변환합니다.
  export const format = (pathObject: nodePath.FormatInputPathObject) => {
    return nodePath.format(pathObject);
  }

  // isAbsolute(path: string): 경로가 절대 경로인지 확인합니다.
  export const isAbsolute = (path: string) => {
    return nodePath.isAbsolute(path);
  }

  // relative(from: string, to: string): from에서 to로 가는 상대 경로를 반환합니다.
  export const relative = (from: string, to: string) => {
    return nodePath.relative(from, to);
  }

  // normalize(path: string): 경로를 정규화합니다.
  export const normalize = (path: string) => {
    return nodePath.normalize(path);
  }

}