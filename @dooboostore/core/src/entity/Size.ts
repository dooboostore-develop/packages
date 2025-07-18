export type Size = {
  width: number;
  height: number;
};

export const isSize = (obj: any): obj is Size =>
  !!obj &&
  typeof obj.width === 'number' &&
  typeof obj.height === 'number';