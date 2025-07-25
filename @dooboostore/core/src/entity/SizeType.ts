export type SizeType = {
  width: number;
  height: number;
};

export const isSizeType = (obj: any): obj is SizeType =>
  !!obj &&
  typeof obj.width === 'number' &&
  typeof obj.height === 'number';