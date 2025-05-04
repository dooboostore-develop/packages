import { ValidUtils } from '@dooboostore/core/valid/ValidUtils';

export namespace ConvertUtils {


  export function toBuffer (data: string, config?: {encoding: BufferEncoding}): Buffer {
    if (config?.encoding === 'base64') {
      data = data.split(';base64,').pop();
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