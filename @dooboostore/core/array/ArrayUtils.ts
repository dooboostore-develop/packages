export namespace ArrayUtils {
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

  export function randomPick<T>(array: T[], count: number): T[];
  export function randomPick<T>(array: T[]): T | undefined;
  export function randomPick<T>(array: T[], count?: number): T[] | T | undefined {
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
  };

  export function maxLength<T>(array?: T[][]): { maxRows: number; maxCols: number, total: number; } {
    if (!array) {
      return { maxRows: 0, maxCols: 0, total: 0 };
    }
    return {
      maxRows: array.length,
      maxCols: Math.max(...array.map(row => row.length), 0),
      total: array.reduce((total, row) => total + row.length, 0)
    };
  }

  export const push = <T>(array: T[] | null = [], data: T) => {
    return [...(array ?? []), data];
  }
  export const filterOut = <T>(array: T[] | null = [], predicate: (item: T) => boolean): T[] => {
    return (array??[]).filter(item => !predicate(item));
  };

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