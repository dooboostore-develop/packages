export namespace HashUtils{

  const core53 = (str: string, seed: number): string => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
  };

  /** cyrb53 — 순수 JS 53비트 해시 → hex (node:crypto 없이 브라우저·노드 공통).
   *  동일 입력 → 동일 출력. 자릿수는 xyz(기본 16)로 자름.
   *  @example HashUtils.hash53('abc') // 16자리 hex */
  export const hash53 = (str: string, seed = 0, xyz = 16): string =>
    `${core53(str, seed)}${core53(str, seed + 1)}`.slice(0, Math.max(1, xyz));

}