export type Point2DType = {
  x: number;
  y: number;
};
export const isPoint2DType = (obj: any): obj is Point2DType =>
  !!obj && typeof obj.x === 'number' && typeof obj.y === 'number';