import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

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
    bundle: true,
    sourcemap: true,
    target: 'es2020', // Target modern browsers
    platform: 'browser', // Build for browser environment
    entryPoints: [path.resolve(__dirname, 'index.ts')],
    loader: {
      '.html': 'text',
      '.css': 'text',
    },
    // No external dependencies for the example bundle
  };

  switch (target) {
    case 'dev':
      console.log('Starting development build...');
      await performBuild({
        ...baseOptions,
        outfile: path.resolve(__dirname, 'dist', 'bundle.js'),
        format: 'iife', // IIFE for direct script inclusion
        globalName: 'quickStartApp',
        tsconfig: 'tsconfig.json',
        minify: false,
      }, watch);
      console.log('Development build complete.');
      break;
    case 'prod':
      console.log('Starting production build...');
      await performBuild({
        ...baseOptions,
        outfile: path.resolve(__dirname, 'dist', 'bundle.js'),
        format: 'iife', // IIFE for direct script inclusion
        globalName: 'quickStartApp',
        tsconfig: 'tsconfig.json',
        minify: true,
      }, watch);
      console.log('Production build complete.');
      break;
    default:
      console.error('Invalid build target specified.');
      process.exit(1);
  }
}

const args = process.argv.slice(2);
const target = args[0] || 'dev'; // Default to dev build
const watch = args.includes('--watch');

buildTarget(target, watch).catch((error) => {
  console.error('Build process failed:', error);
  process.exit(1);
});