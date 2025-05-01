export interface CompileResult {
  code: string;
  map?: any;
}

export interface Compiler {
  compile(node: any): string;
  map?: any;
  applySourceMaps?(): void;
} 