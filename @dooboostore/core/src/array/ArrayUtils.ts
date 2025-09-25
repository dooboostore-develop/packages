export namespace ArrayUtils {
  export type PickChanceType<T> = { data: T, chance: number };
  // export const uniqueBy = <T>(array: T[], predicate: (a: T, b: T) => boolean): T[] => {
  //   return array.filter((item, index, self) =>
  //     index === self.findIndex((other) => predicate(item, other))
  //   );
  // };
  export const create2DArray = <T>(rows: number, cols: number, initialValue: T | ((row: number, cols: number) => T)): T[][] => {
    const array: T[][] = [];
    for (let row = 0; row < rows; row++) {
      const rowArray: T[] = [];
      for (let col = 0; col < cols; col++) {
        if (typeof initialValue === 'function') {
          rowArray.push((initialValue as (row: number, col: number) => T)(row, col));
        } else {
          rowArray.push(initialValue as T);
        }
      }
      array.push(rowArray);
    }
    return array;

  }
  export const toShuffle = <T>(data: T[]): T[] => {
    const array = [...data];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // export function maxLength<T>(array: T[]): number;
  // export function maxLength<T>(array: T[][]): { maxRows: number; maxCols: number };
  // export function maxLength<T>(array: T[][][] ): { maxRows: number; maxCols: number };
  // export function maxLength <T>(array: T[] | T[][] | T[][][]  ): { maxRows: number; maxCols: number } | number {
  //   if (Array.isArray(array[0])) {
  //     return { maxRows: array.length, maxCols: Math.max(...array.map(row => row.length), 0) };
  //   } else {
  //     return array.length;
  //   }
  // }

  // export type Space = { x: number, y: number, w: number, h: number };
  // export const pickRandomSpace = (array: Space[], where: { w: number, h: number }): { x: number, y: number } | undefined => {
  //   const minmax = ConvertUtils.minMaxCenterAvg(array ?? [])
  //   // 2차 배열로 변환, 겹치는 영역이 있으면 3차 배열로 추가
  //   const cellSizes2D: Space[][][] = Array.from({length: minmax.y?.max ?? 0}, () =>
  //     Array.from({length: minmax.x?.max ?? 0}, () => [])
  //   );
  //
  //   array.forEach(it => {
  //     cellSizes2D[it.y] = cellSizes2D[it.y] || [];
  //     if (!cellSizes2D[it.y][it.x]) {
  //       // @ts-ignore
  //       cellSizes2D[it.y][it.x] = it;
  //     } else {
  //       // 이미 값이 있으면 3차 배열로 겹치는 값 추가
  //       if (!Array.isArray(cellSizes2D[it.y][it.x])) {
  //         // @ts-ignore
  //         cellSizes2D[it.y][it.x] = [cellSizes2D[it.y][it.x]];
  //       }
  //       (cellSizes2D[it.y][it.x]).push(it);
  //     }
  //   });
  //   const cellSizes = cellSizes2D.flatMap((it, y) => it.map((it, x) => {
  //     const minmax = ConvertUtils.minMaxCenterAvg(Array.isArray(it) ? it : [it])
  //     return {
  //       x: x,
  //       y: y,
  //       w: minmax.w?.max ?? 0,
  //       h: minmax.h?.max ?? 0,
  //       overlay: 0,
  //     }
  //   }));
  //
  //   // const cellSizes = array.map(it=> ({...it, overlay: 0}));
  //
  //
  //   cellSizes.filter(it => it.w > 0 && it.h > 0).forEach(it => {
  //     const wantW = it.w - 1;  // 자기자신포함해서w니깐 -1
  //     const wantH = it.h - 1;
  //     const finds = cellSizes.filter(cit =>
  //       (cit.x <= (it.x + wantW)) && (cit.x >= it.x) &&
  //       (cit.y <= (it.y + wantH)) && (cit.y >= it.y)
  //     );
  //     finds.forEach(it => it.overlay++);
  //   })
  //
  //   const wantW = where.w - 1;
  //   const wantH = where.h - 1; // 자기자신 포함부터니깐 -1 해준다
  //   const targetCells = cellSizes.filter(it => it.overlay <= 0)
  //   const targetCellsEmpty: { x: number, y: number }[] = [];
  //   for (let targetCell of targetCells) {
  //     const filter = cellSizes.filter(it =>
  //       (it.x <= (targetCell.x + wantW)) && (it.x >= targetCell.x) &&
  //       (it.y <= (targetCell.y + wantH)) && (it.y >= targetCell.y)
  //     );
  //     const overlaySum = MathUtil.sum(filter.map(it => it.overlay ?? 0));
  //     // console.log('------>!!!!',filter.length, targetCell,where.w, where.h, (where.w * where.h), overlaySum)
  //     if (filter.length === where.w * where.h && overlaySum === 0) {
  //       targetCellsEmpty.push(targetCell);
  //     }
  //   }
  //   return ArrayUtils.pick(targetCellsEmpty);
  // }


  export const popPick = <T>(array: T[]): T => {
    const index = Math.floor(Math.random() * array.length);
    return array.splice(index, 1)[0];
  }

  export const chancePick = <T>(array: PickChanceType<T>[], config?: {}): T => {
    const totalChance = array.reduce((sum, item) => sum + item.chance, 0);
    let randomValue = Math.random() * totalChance;

    for (const item of array) {
      if (randomValue < item.chance) {
        return item.data;
      }
      randomValue -= item.chance;
    }
    return pick(array.map(it => it.data))
  }

  export function pick<T>(array: T[], count: number): T[];
  export function pick<T>(array: T[]): T | undefined;
  export function pick<T>(array: T[][]): T[] | undefined;
  export function pick<T>(array: T[], count?: number): T[] | T | undefined {
    if (array.length === 0 && count !== undefined) {
      return [];
    }

    if (count === undefined) {
      return array[Math.floor(Math.random() * array.length)];
    }

    const result: T[] = [];
    const usedIndices = new Set<number>();
    while (result.length < count && usedIndices.size < array.length) {
      const randomIndex = Math.floor(Math.random() * array.length);
      if (!usedIndices.has(randomIndex)) {
        result.push(array[randomIndex]);
        usedIndices.add(randomIndex);
      }
    }
    return result;
  }

  export function maxLength<T>(array?: T[][]): { maxRows: number; maxCols: number, maxRowsCols: number, total: number; } {
    if (!array) {
      return {maxRows: 0, maxCols: 0, maxRowsCols: 0, total: 0};
    }
    const maxRows = array.length;
    const maxCols = Math.max(...array.map(row => row.length), 0);
    return {
      maxRows: maxRows,
      maxCols: maxCols,
      maxRowsCols: Math.max(maxCols, maxRows),
      total: array.reduce((total, row) => total + row.length, 0)
    }
  }

  // export const include = <T>(array:T[] | null = []) => {
  //
  // }
  export const toPush = <T>(array: T[] | null = [], ...data: T[]) => {
    return [...(array ?? []), ...data];
  }

  export const toRemove = <T>(array: T[] | null = [], ...data: T[]) => {
    return (array ?? []).filter(item => !data.includes(item));
  }

  export const toFilterOut = <T>(array: T[] | null = [], predicate: (item: T) => boolean): T[] => {
    return (array ?? []).filter(item => !predicate(item));
  }

  export const toFilter = <T>(array: T[] | null = [], predicate: (item: T) => boolean): T[] => {
    return (array ?? []).filter(item => predicate(item));
  }

  export const hasAll = <T>(array: T[] | null = [], ...targetArray: T[]): boolean => {
    return targetArray.every(item => (array ?? []).includes(item));
  }

  export const has = <T>(array: T[] | null = [], ...targetArray: T[]): boolean => {
    return targetArray.some(item => (array ?? []).includes(item));
  }

  export const hasNot = <T>(array: T[] | null = [], ...targetArray: T[]): boolean => {
    return targetArray.some(item => !(array ?? []).includes(item));
  }

  export const hasAllNot = <T>(array: T[] | null = [], ...targetArray: T[]): boolean => {
    return targetArray.every(item => !(array ?? []).includes(item));
  }

// 여러 배열의 교집합, 합집합, 차집합, 대칭 차집합을 계산하는 함수
  export const relation = <T>(...arrays: T[][]): {
    intersection: T[];
    union: T[];
    difference: T[];
    symmetricDifference: T[];
  } => {
    // 배열이 없거나 빈 경우 처리
    if (arrays.length === 0) {
      return {
        intersection: [],
        union: [],
        difference: [],
        symmetricDifference: []
      };
    }

    // 배열을 Set 배열로 변환 (중복 제거)
    const sets = arrays.map((arr) => new Set<T>(arr));

    // 교집합: 모든 배열에 공통으로 존재하는 요소
    // @ts-ignore
    const intersection = [...sets[0]].filter((item) =>
      sets.every((set) => set.has(item))
    );
    // const intersection = [...sets.reduce((acc, set) =>
    //   new Set([...acc].filter((item) => set.has(item)))
    // )];


    // 합집합: 모든 배열의 요소를 합친 후 중복 제거
    // @ts-ignore
    const union = [...new Set(arrays.flat())];

    // 차집합: 첫 번째 배열에서 나머지 배열에 없는 요소
    // @ts-ignore
    const difference = [...sets[0]].filter((item) =>
      sets.slice(1).every((set) => !set.has(item))
    );

    // 대칭 차집합: 각 배열에서 다른 배열에 없는 요소들의 합집합
    const allUniqueElements = new Set<T>();
    for (let i = 0; i < sets.length; i++) {
      const currentSet = sets[i];
      const otherSetsUnion = new Set<T>(
        arrays
          .filter((_, index) => index !== i)
          .flat()
      );
      // @ts-ignore
      const uniqueToCurrent = [...currentSet].filter(
        (item) => !otherSetsUnion.has(item)
      );
      uniqueToCurrent.forEach((item) => allUniqueElements.add(item));
    }
    // @ts-ignore
    const symmetricDifference = [...allUniqueElements];

    return {
      intersection,
      union,
      difference,
      symmetricDifference
    };
  };
}