/**
 * Module dependencies.
 */

import { CompressCompiler } from './compress';
import { IdentityCompiler } from './identity';
import { CompileResult, CompilerOptions } from './types';

/**
 * Stringfy the given AST `node`.
 *
 * Options:
 *
 *  - `compress` space-optimized output
 *  - `sourcemap` return an object with `.code` and `.map`
 *
 * @param {Object} node
 * @param {Object} [options]
 * @return {String}
 * @api public
 */

interface StringifyOptions extends CompilerOptions {
  compress?: boolean;
  sourcemap?: boolean | 'generator';
}

export default function(node: any, options: StringifyOptions = {}): string | CompileResult {
  const compiler = options.compress
    ? new CompressCompiler(options)
    : new IdentityCompiler(options);

  // source maps
  // if (options.sourcemap) {
  //   var sourcemaps = require('./source-map-support');
  //   sourcemaps(compiler);
  //
  //   var code = compiler.compile(node);
  //   compiler.applySourceMaps();
  //
  //   var map = options.sourcemap === 'generator'
  //     ? compiler.map
  //     : compiler.map.toJSON();
  //
  //   return { code: code, map: map };
  // }

  const code = compiler.compile(node);
  return code;
}
