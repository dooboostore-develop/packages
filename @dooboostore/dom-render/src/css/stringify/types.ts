export interface CompileResult {
  code: string;
  map?: any;
}

export interface Compiler {
  compile(node: any): string;
  map?: any;
  applySourceMaps?(): void;
}

export interface CompilerOptions {
  compress?: boolean;
  sourcemap?: boolean | 'generator';
  indent?: string;
} 