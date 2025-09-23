export namespace ConvertUtils {

  export function toString (data: string): string;
  export function toString (data: string | Buffer): string;
  export function toString (data: Buffer, config?: {encoding?: BufferEncoding, start?: number, end?: number}): string;
  export function toString (data: string | Buffer, config?: {encoding?: BufferEncoding, start?: number, end?: number})  {
    if (data === undefined || data === null) {
      return '';
    } else if (typeof data === 'string') {
      return data;
    } else {
      return data.toString(config?.encoding ?? 'utf-8', config?.start, config?.end );
    }

  }

  export const toBuffer = (data: string, config?: {encoding: BufferEncoding}): Buffer => {
    if (config?.encoding === 'base64') {
      // const base64Content = base64Data.replace(/^data:.*,/, ''); 이걸로해도됨
      // base64Data가 data:image/png;base64,AAAAA... 이런 형태
      data = data.split(';base64,').pop() || '';
      // if (ValidUtils.isBase64(data)) {
        return Buffer.from(data, 'base64');
      // } else {
      //   throw new Error(`Invalid data (${config?.encoding})`);
      // }
    } else {
      return Buffer.from(data)
    }

  }
}