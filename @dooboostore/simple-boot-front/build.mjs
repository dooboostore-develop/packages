import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Function to find all .ts files in a directory
function findTsFiles(dir) {
  let filelist = [];
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filepath = path.join(dir, file);
      try {
        if (fs.statSync(filepath).isDirectory()) {
          if (file !== 'node_modules') {
            filelist = filelist.concat(findTsFiles(filepath));
          }
        } else if (filepath.endsWith('.ts')) {
          filelist.push(filepath);
        }
      } catch (e) {
        // ignore stat errors
      }
    });
  }
  catch (e) {
    // ignore readdir errors
  }
  return filelist;
}

const srcDir = path.resolve(__dirname, 'src');
const tsFiles = findTsFiles(srcDir);

const entryPoints = tsFiles.reduce((acc, file) => {
  const entryName = path.relative(srcDir, file).replace(/\.ts$/, '');
  acc[entryName] = file;
  return acc;
}, {});

async function performBuild(options, watch) {
  if (watch) {
    const context = await esbuild.context(options);
    await context.watch();
    console.log('Watching for changes...');
  } else {
    await esbuild.build(options);
  }
}

async function buildTarget(target, watch = false) {
  const baseOptions = {
    bundle: true, // Always bundle for web
    sourcemap: true,
    target: 'es2020', // Target modern browsers
    platform: 'browser', // Build for browser environment
    external: [
      'reflect-metadata',
      '@dooboostore/core',
      '@dooboostore/core-node',
      '@dooboostore/core-web',
      '@dooboostore/dom-render',
      '@dooboostore/simple-boot',
    ],
  };

  switch (target) {
    case 'esm':
      console.log('Starting ESM build...');
      await performBuild({
        ...baseOptions,
        entryPoints: entryPoints,
        outdir: path.resolve(__dirname, 'dist', 'esm'),
        format: 'esm',
        tsconfig: 'tsconfig.esm.json',
      }, watch);
      console.log('ESM build complete.');
      break;
    case 'cjs':
      console.log('Starting CJS build...');
      await performBuild({
        ...baseOptions,
        entryPoints: entryPoints,
        outdir: path.resolve(__dirname, 'dist', 'cjs'),
        format: 'cjs',
        tsconfig: 'tsconfig.cjs.json',
      }, watch);
      console.log('CJS build complete.');
      break;
    case 'umd-bundle':
      console.log('Starting UMD bundle build...');
      await performBuild({
        ...baseOptions,
        entryPoints: [path.resolve(srcDir, 'index.ts')],
        outfile: path.resolve(__dirname, 'dist', 'umd-bundle', 'dooboostore-simple-boot-front.umd.js'),
        format: 'iife',
        globalName: 'dooboostoreSimpleBootFront',
        tsconfig: 'tsconfig.umd.json',
      }, watch);
      console.log('UMD bundle build complete.');
      break;
    case 'esm-bundle':
      console.log('Starting ESM bundle build...');
      await performBuild({
        ...baseOptions,
        entryPoints: [path.resolve(srcDir, 'index.ts')],
        outfile: path.resolve(__dirname, 'dist', 'esm-bundle', 'dooboostore-simple-boot-front.esm.js'),
        format: 'esm',
        tsconfig: 'tsconfig.esm.json',
      }, watch);
      console.log('ESM bundle build complete.');
      break;
    case 'all':
      if (!watch) { // Only clean if not in watch mode
        fs.rmSync(path.resolve(__dirname, 'dist'), { recursive: true, force: true });
      }
      await buildTarget('esm', watch);
      await buildTarget('cjs', watch);
      await buildTarget('umd-bundle', watch);
      await buildTarget('esm-bundle', watch);
      break;
    default:
      console.error('Invalid build target specified.');
      process.exit(1);
  }
}

const args = process.argv.slice(2);
const target = args[0] || 'all';
const watch = args.includes('--watch');

buildTarget(target, watch).catch((error) => {
  console.error('Build process failed:', error);
  process.exit(1);
});