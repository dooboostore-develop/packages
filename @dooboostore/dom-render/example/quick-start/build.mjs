import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';

(async () => { // Wrap in an IIFE
  const __dirname = path.dirname(new URL(import.meta.url).pathname);

  const projectRoot = path.resolve(__dirname);
  const distDir = path.resolve(projectRoot, 'dist');

  const args = process.argv.slice(2);
  const watch = args.includes('--watch');

  // Clean dist directory if not in watch mode
  if (!watch) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }

  const commonOptions = {
    entryPoints: [path.resolve(projectRoot, 'index.ts')],
    outfile: path.resolve(distDir, 'bundle.js'), // Output to bundle.js
    bundle: true,
    platform: 'browser', // dom-render is a browser package
    format: 'esm',    // package.json has "type": "module"
    sourcemap: true,
    target: 'es2020',
    mainFields: ['module', 'main'],
    tsconfig: path.resolve(projectRoot, 'tsconfig.json'),
    nodePaths: [path.resolve(__dirname, '../../../../node_modules')],
    loader: {
      '.html': 'text',
      '.css': 'text',
    },
    plugins: [{
      name: 'dooboostore-core-types-resolver',
      setup(build) {
        build.onResolve({ filter: /^(..\/types)$/ }, args => {
          if (args.importer.includes('@dooboostore/core')) {
            return { path: path.resolve(__dirname, '../../../../@dooboostore/core/src/types.ts') };
          }
        });
      },
    }],
  };

  if (watch) {
    const context = await esbuild.context(commonOptions);
    await context.watch();
    console.log('Watching for changes in quick-start...');
  } else {
    await esbuild.build(commonOptions);
    // Copy index.html to dist directory
    fs.copyFileSync(path.resolve(projectRoot, 'index.html'), path.resolve(distDir, 'index.html'));
    console.log('Copied index.html to dist directory.');
    console.log('quick-start build complete.');
  }
})().catch((error) => {
  console.error('quick-start build process failed:', error);
  process.exit(1);
});