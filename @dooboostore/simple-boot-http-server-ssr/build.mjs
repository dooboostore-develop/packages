import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import esbuildPluginTsc from 'esbuild-plugin-tsc';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Function to find all files with a specific extension in a directory
function findFiles(dir, extension) {
  let filelist = [];
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filepath = path.join(dir, file);
      try {
        if (fs.statSync(filepath).isDirectory()) {
          if (file !== 'node_modules') {
            filelist = filelist.concat(findFiles(filepath, extension));
          }
        } else if (filepath.endsWith(extension)) {
          filelist.push(filepath);
        }
      }
      catch (e) {
        // ignore stat errors
      }
    });
  }
  catch (e) {
    // ignore readdir errors
  }
  return filelist;
}

// DEPRECATED: These functions are replaced by generateExportsInPackageJson()
// which auto-generates package.json exports from built types
// function generateModuleDeclarations() { ... }
// function addSubmoduleReferences() { ... }

function generateExportsInPackageJson() {
    console.log('Generating exports in package.json...');
    const typesDir = path.resolve(__dirname, 'dist/types');
    const packageJsonPath = path.resolve(__dirname, 'package.json');

    if (!fs.existsSync(typesDir)) {
        console.warn(`Warning: '${typesDir}' not found. Skipping exports generation.`);
        return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dtsFiles = findFiles(typesDir, '.d.ts')
        .filter(file => !file.includes('bundle-entry'))
        .map(file => path.relative(typesDir, file).replace(/\.d\.ts$/, '').replace(/\\/g, '/'));

    const exports = {
        ".": {
            "types": "./dist/types/index.d.ts",
            "node": "./dist/cjs/index.js",
            "require": "./dist/cjs/index.js",
            "import": "./dist/esm/index.js"
        }
    };

    const exportPaths = new Set();
    dtsFiles.forEach(file => {
        if (file !== 'index' && file !== 'types') {
            let exportPath = file;
            if (exportPath.endsWith('/index')) {
                exportPath = exportPath.slice(0, -6);
            }
            exportPaths.add(exportPath);
        }
    });

    Array.from(exportPaths).sort().forEach(modulePath => {
        const exportKey = `./${modulePath}`;
        const typePath = `./dist/types/${modulePath}${fs.existsSync(path.resolve(typesDir, modulePath, 'index.d.ts')) ? '/index.d.ts' : '.d.ts'}`;
        const esmPath = `./dist/esm/${modulePath}${fs.existsSync(path.resolve(__dirname, 'dist/esm', modulePath, 'index.js')) ? '/index.js' : '.js'}`;
        const cjsPath = `./dist/cjs/${modulePath}${fs.existsSync(path.resolve(__dirname, 'dist/cjs', modulePath, 'index.js')) ? '/index.js' : '.js'}`;
        
        exports[exportKey] = {
            "types": typePath,
            "node": cjsPath,
            "require": cjsPath,
            "import": esmPath
        };
    });

    exports["./*"] = {
        "types": "./dist/types/*.d.ts",
        "require": "./dist/cjs/*.js",
        "import": "./dist/esm/*.js"
    };

    packageJson.exports = exports;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
    
    console.log(`✅ Generated ${Object.keys(exports).length} exports in package.json`);
    console.log(`   Including ${Object.keys(exports).length - 2} explicit module paths`);
}

const declarationGeneratorPlugin = {
    name: 'declaration-generator',
    setup(build) {
        build.onEnd(result => {
            if (result.errors.length === 0) {
                console.log('Build successful, generating declarations...');
                try {
                    execSync('pnpm exec tsc -p tsconfig.json --emitDeclarationOnly', { stdio: 'inherit' });
                    generateExportsInPackageJson();
                } catch (e) {
                    console.error('Declaration generation failed:', e);
                }
            }
        });
    }
};

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
        if (!p3.endsWith('.js') && !p3.endsWith('.json') && !p3.endsWith('.mjs') && !p3.endsWith('.cjs')) {
          const absoluteImportPath = path.resolve(path.dirname(filepath), p3);
          if (fs.existsSync(absoluteImportPath) && fs.statSync(absoluteImportPath).isDirectory()) {
            return p1 + p2 + p3 + '/index.js' + p5;
          } else {
            return p1 + p2 + p3 + '.js' + p5;
          }
        }
        return match;
      });
      fs.writeFileSync(filepath, content, 'utf8');
    }
  });
}

const srcDir = path.resolve(__dirname, 'src');
const tsFiles = findFiles(srcDir, '.ts');

// Build all TypeScript files including bundle-entry (needed by other packages)
// Note: bundle-entry will NOT be included in exports (filtered in generateExportsInPackageJson)
const entryPoints = tsFiles
  .reduce((acc, file) => {
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
    if (options.format === 'esm' && options.outdir) {
      console.log('Adding .js extensions to ESM imports...');
      addJsExtensionToImports(options.outdir);
    }
  }
}

async function buildTarget(target, watch = false) {
  const baseOptions = {
    bundle: false,
    sourcemap: true,
    target: 'node20', // Target modern Node.js
    platform: 'node', // Build for Node.js environment
    // external: [
    //   'reflect-metadata',
    //   '@dooboostore/core',
    //   '@dooboostore/core-node',
    //   '@dooboostore/core-web',
    //   '@dooboostore/dom-render',
    //   '@dooboostore/simple-boot',
    //   '@dooboostore/simple-boot-front',
    //   '@dooboostore/simple-boot-http-server',
    //   'jsdom', // Add jsdom to externals
    //   'bufferutil', // Add bufferutil to externals
    //   'utf-8-validate', // Add utf-8-validate to externals
    //   'canvas', // Add canvas to externals
    //   'http', // Node.js built-in
    //   'https', // Node.js built-in
    //   'url', // Node.js built-in
    //   'fs', // Node.js built-in
    //   'os', // Node.js built-in
    //   'path', // Node.js built-in
    //   'buffer', // Node.js built-in
    // ], // Externalize dependencies
  };

  const externals = [
        'jsdom', // Add jsdom to externals
        'bufferutil', // Add bufferutil to externals
        'utf-8-validate', // Add utf-8-validate to externals
        'canvas', // Add canvas to externals
        'http', // Node.js built-in
        'https', // Node.js built-in
        'url', // Node.js built-in
        'fs', // Node.js built-in
        'os', // Node.js built-in
        'path', // Node.js built-in
        'buffer', // Node.js built-in
  ]
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
         bundle: false,
        entryPoints: entryPoints,
        outdir: path.resolve(__dirname, 'dist', 'esm'),
        format: 'esm',
        resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        mainFields: ['module', 'main'],
        plugins: [esbuildPluginTsc({tsconfigPath:'tsconfig.esm.json'}), addJsExtensionPlugin, declarationGeneratorPlugin],
      }, watch);
      console.log('ESM build complete.');
      break;
    case 'cjs':
      console.log('Starting CJS build...');
      await performBuild({
        ...baseOptions,
         bundle: false,
        entryPoints: entryPoints,
        outdir: path.resolve(__dirname, 'dist', 'cjs'),
        format: 'cjs',
        plugins: [esbuildPluginTsc({tsconfigPath:'tsconfig.cjs.json'}),declarationGeneratorPlugin],
      }, watch);
      // Create package.json in dist/cjs to mark it as CommonJS
      const cjsPackageJson = { 
        name: '@dooboostore/simple-boot-http-server-ssr-cjs-internal',
        private: true,
        type: 'commonjs' 
      };
      fs.writeFileSync(
        path.resolve(__dirname, 'dist', 'cjs', 'package.json'),
        JSON.stringify(cjsPackageJson, null, 2)
      );
      console.log('CJS build complete.');
      break;
    case 'umd-bundle':
      console.log('Starting UMD bundle build (browser-only, no type declarations)...');
      await performBuild({
        ...baseOptions,
          bundle:true,
        entryPoints: [path.resolve(srcDir, 'bundle-entry.ts')],
        outfile: path.resolve(__dirname, 'dist', 'umd-bundle', 'dooboostore-simple-boot-http-server-ssr.umd.js'),
        format: 'iife',
        globalName: 'dooboostoreSimpleBootHttpServerSsr',
        plugins: [esbuildPluginTsc({tsconfigPath:'tsconfig.umd.json'})],
          external: externals
      }, watch);
      console.log('UMD bundle build complete.');
      break;
    case 'esm-bundle':
      console.log('Starting ESM bundle build (browser-only, no type declarations)...');
      await performBuild({
        ...baseOptions,
          bundle:true,
        entryPoints: [path.resolve(srcDir, 'bundle-entry.ts')],
        outfile: path.resolve(__dirname, 'dist', 'esm-bundle', 'dooboostore-simple-boot-http-server-ssr.esm.js'),
        format: 'esm',
        plugins: [esbuildPluginTsc({tsconfigPath:'tsconfig.esm.json'})],
          external: externals
      }, watch);
      console.log('ESM bundle build complete.');
      break;
    case 'all':
      if (!watch) {
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