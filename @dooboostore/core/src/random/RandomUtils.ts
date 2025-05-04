import { ValidUtils } from '../valid/ValidUtils';

export namespace RandomUtils {
  // export const readonly d = ''

  // export const getUniqueNumbers = (max: number, length: number) => {
  //   max = Math.max(max, 0);
  //   length = Math.max(Math.min(max, length), 0);
  //   const array: number[] = [];
  //   while (array.length < length) {
  //     const num = Math.floor(Math.random() * max);
  //     if (!array.includes(num)) array.push(num);
  //   }
  //   return array;
  // };

  export const uniqueInts = (min: number, max: number, count: number) => {
    const result: number[] = [];
    if (count > max - min) {
      throw new Error('Count is greater than the range of unique integers');
    }
    while (result.length < count) {
      const randomInt = RandomUtils.int(min,  max);
      if (!result.includes(randomInt)) {
        result.push(randomInt);
      }
    }
    return result;
  }


 export const chance = (percentage: number): boolean => {
   if (percentage < 0 || percentage > 1) {
     throw new Error('Percentage must be between 0 and 1');
   }
   return Math.random() < percentage;
 };
  // max는 포함하지 않음
  export const int = (min?: number, max?: number) => {
    return Math.floor(RandomUtils.float(min, max));
  }

  // ex) 0,5   0~<5   <5는 포함하지 않습니다.   소수점포함
  export const float = (min?: number, max?: number) => {
    if (ValidUtils.isNullOrUndefined(min)) {
      return Math.random();
    } else if (!ValidUtils.isNullOrUndefined(min) && ValidUtils.isNullOrUndefined(max)) {
      return Math.random() * (min || 0);
    } else {
      return Math.random() * ((max || 0) - (min || 0)) + (min || 0);
    }
  };

  export const uuid = (format: string = 'xxxx-xxxx-xxxx-xxxx'): string => {
    return format.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };


  export const uuid4 = (): string => {
    // // return uuid of form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    let uuid = '';
    let ii;
    for (ii = 0; ii < 32; ii += 1) {
      switch (ii) {
        case 8:
        case 20:
          uuid += '-';
          uuid += ((Math.random() * 16) | 0).toString(16);
          break;
        case 12:
          uuid += '-';
          uuid += '4';
          break;
        case 16:
          uuid += '-';
          uuid += ((Math.random() * 4) | 8).toString(16);
          break;
        default:
          uuid += ((Math.random() * 16) | 0).toString(16);
      }
    }
    return uuid;
  };

  export const hex = (): string => {
    const letters = '0123456789ABCDEF'.split('');
    let hex = '';
    for (let i = 0; i < 6; i++) {
      hex += letters[Math.floor(Math.random() * 16)];
    }
    return hex;
  };


  export const rgb = (): string => {
    const letters = '0123456789ABCDEF'.split('');
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  export const rgba = (): string => {
    const letters = '0123456789ABCDEF'.split('');
    let color = '#';
    for (let i = 0; i < 8; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  // (Math.random().toString(36)+'00000000000000000').slice(2, 10) + Date.now()

  export const alphabet = (len: number): string => {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    let color = '';
    for (let i = 0; i < len; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
  };
}
