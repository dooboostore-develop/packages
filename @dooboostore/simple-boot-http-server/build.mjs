import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';
import esbuildPluginTsc from 'esbuild-plugin-tsc';
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
// Function to add .js extension to relative imports/exports in generated JS files
function addJsExtensionToImports(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            addJsExtensionToImports(filepath); // Recurse into subdirectories
        } else if (filepath.endsWith('.js')) {
            let content = fs.readFileSync(filepath, 'utf8');
            // Regex to find import/export statements with relative paths
            // and without a file extension (or with .ts extension)
            const regex = /(import|export)([\s\S]*?from\s+['"])((\.?\.?\/|\/)[^'"]+)(['"];)/g;
            content = content.replace(regex, (match, p1, p2, p3, p4, p5) => {
                // Check if the path already has an extension
                if (!p3.endsWith('.js') && !p3.endsWith('.json') && !p3.endsWith('.mjs') && !p3.endsWith('.cjs')) {
                    // Construct the full absolute path to the potential module
                    const absoluteImportPath = path.resolve(path.dirname(filepath), p3);

                    // Check if it's a directory
                    if (fs.existsSync(absoluteImportPath) && fs.statSync(absoluteImportPath).isDirectory()) {
                        return p1 + p2 + p3 + '/index.js' + p5;
                    } else {
                        return p1 + p2 + p3 + '.js' + p5;
                    }
                }
                return match;
            })
            fs.writeFileSync(filepath, content, 'utf8');
        }
    });
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
    sourcemap: true,
    target: 'node20', // Target modern Node.js
    platform: 'node', // Build for Node.js environment
  };

  const nodeBuiltins = [
    'http',
    'https',
    'url',
    'fs',
    'os',
    'path',
    'buffer',
  ];
    // Define a plugin to run after each build
    const addJsExtensionPlugin = {
        name: 'add-js-extension',
        setup(build) {
            build.onEnd(result => {
                if (result.errors.length === 0 && build.initialOptions.format === 'esm' && build.initialOptions.outdir) {
                    console.log('Adding .js extensions to ESM imports after build...');
                    addJsExtensionToImports(build.initialOptions.outdir);
                }
            });
        },
    };
  switch (target) {
    case 'esm':
      console.log('Starting ESM build...');
      await performBuild({
        ...baseOptions,
        bundle: false, // Explicitly false for library build
        entryPoints: entryPoints,
        outdir: path.resolve(__dirname, 'dist', 'esm'),
        format: 'esm',
        resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        mainFields: ['module', 'main'],
        plugins: [esbuildPluginTsc({tsconfigPath:'tsconfig.esm.json'}), addJsExtensionPlugin],
        // tsconfig: 'tsconfig.esm.json',
      }, watch);
      console.log('ESM build complete.');
      break;
    case 'cjs':
      console.log('Starting CJS build...');
      await performBuild({
        ...baseOptions,
        bundle: false, // Explicitly false for library build
        entryPoints: entryPoints,
        outdir: path.resolve(__dirname, 'dist', 'cjs'),
        format: 'cjs',
        plugins: [esbuildPluginTsc({tsconfigPath:'tsconfig.cjs.json'})],
        // tsconfig: 'tsconfig.cjs.json',
      }, watch);
      console.log('CJS build complete.');
      break;
    case 'umd-bundle':
      console.log('Starting UMD bundle build...');
      await performBuild({
        ...baseOptions,
        bundle: true, // Explicitly true for self-contained bundle
        // external: [ // Externalize peer dependencies and Node.js built-ins
        //   'reflect-metadata',
        //   '@dooboostore/core',
        //   '@dooboostore/core-node',
        //   '@dooboostore/core-web',
        //   '@dooboostore/dom-render',
        //   '@dooboostore/simple-boot',
        //   'fast-json-patch',
        //   'mime-types',
        //   'node-gzip',
        //   ...nodeBuiltins, // Spread Node.js built-ins
        // ],
        entryPoints: [path.resolve(srcDir, 'bundle-entry.ts')],
        outfile: path.resolve(__dirname, 'dist', 'umd-bundle', 'dooboostore-simple-boot-http-server.umd.js'),
        format: 'iife',
        globalName: 'dooboostoreSimpleBootHttpServer',
        plugins: [esbuildPluginTsc({tsconfigPath:'tsconfig.umd.json'})],
        // tsconfig: 'tsconfig.umd.json',
      }, watch);
      console.log('UMD bundle build complete.');
      break;
    case 'esm-bundle':
      console.log('Starting ESM bundle build...');
      await performBuild({
        ...baseOptions,
        bundle: true, // Explicitly true for self-contained bundle
        // external: [ // Externalize peer dependencies and Node.js built-ins
        //   'reflect-metadata',
        //   '@dooboostore/core',
        //   '@dooboostore/core-node',
        //   '@dooboostore/core-web',
        //   '@dooboostore/dom-render',
        //   '@dooboostore/simple-boot',
        //   'fast-json-patch',
        //   'mime-types',
        //   'node-gzip',
        //   ...nodeBuiltins, // Spread Node.js built-ins
        // ],
        entryPoints: [path.resolve(srcDir, 'bundle-entry.ts')],
        outfile: path.resolve(__dirname, 'dist', 'esm-bundle', 'dooboostore-simple-boot-http-server.esm.js'),
        format: 'esm',
        plugins: [esbuildPluginTsc({tsconfigPath:'tsconfig.esm.json'})],
        // tsconfig: 'tsconfig.esm.json',
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