export type Point3DType = {
  x: number;
  y: number;
  z: number;
};
export const isPoint3DType = (obj: any): obj is Point3DType =>
  !!obj && typeof obj.x === 'number' && typeof obj.y === 'number' && typeof obj.z === 'number';