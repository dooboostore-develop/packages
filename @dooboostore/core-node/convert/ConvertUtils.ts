import { ValidUtils } from '@dooboostore/core/valid/ValidUtils';

export namespace ConvertUtils {


  export function toBuffer (data: string, config?: {encoding: BufferEncoding}): Buffer {
    if (config?.encoding === 'base64') {
      // const base64Content = base64Data.replace(/^data:.*,/, ''); 이걸로해도됨
      // base64Data가 data:image/png;base64,AAAAA... 이런 형태
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