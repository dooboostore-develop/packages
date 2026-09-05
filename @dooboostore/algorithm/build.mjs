import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import esbuildPluginTsc from 'esbuild-plugin-tsc';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

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
      } catch (e) {
        // ignore stat errors
      }
    });
  } catch (e) {
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

const entryPoints = tsFiles.reduce((acc, file) => {
  const entryName = path.relative(srcDir, file).replace(/\.ts$/, '');
  acc[entryName] = file;
  return acc;
}, {});

const declarationGeneratorPlugin = {
  name: 'declaration-generator',
  setup(build) {
    build.onEnd(result => {
      if (result.errors.length === 0) {
        console.log('Build successful, generating declarations...');
        try {
          execSync('pnpm exec tsc -p tsconfig.json --noEmit false --emitDeclarationOnly', { stdio: 'inherit' });
        } catch (e) {
          console.error('Declaration generation failed:', e);
        }
      }
    });
  }
};

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
    target: 'es2020',
    platform: 'browser',
    loader: {
      '.html': 'text',
      '.css': 'text'
    }
  };

  const addJsExtensionPlugin = {
    name: 'add-js-extension',
    setup(build) {
      build.onEnd(result => {
        if (result.errors.length === 0 && build.initialOptions.format === 'esm' && build.initialOptions.outdir) {
          console.log('Adding .js extensions to ESM imports after build...');
          addJsExtensionToImports(build.initialOptions.outdir);
        }
      });
    }
  };
  switch (target) {
    case 'esm':
      console.log('Starting ESM build...');
      await performBuild(
        {
          ...baseOptions,
          bundle: false,
          entryPoints: entryPoints,
          outdir: path.resolve(__dirname, 'dist', 'esm'),
          format: 'esm',
          resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          mainFields: ['module', 'main'],
          plugins: [esbuildPluginTsc({ tsconfigPath: 'tsconfig.esm.json' }), addJsExtensionPlugin, declarationGeneratorPlugin]
        },
        watch
      );
      console.log('ESM build complete.');
      break;
    case 'cjs':
      console.log('Starting CJS build...');
      await performBuild(
        {
          ...baseOptions,
          bundle: false,
          entryPoints: entryPoints,
          outdir: path.resolve(__dirname, 'dist', 'cjs'),
          format: 'cjs',
          plugins: [esbuildPluginTsc({ tsconfigPath: 'tsconfig.cjs.json' }), declarationGeneratorPlugin]
        },
        watch
      );
      // Create package.json in dist/cjs to mark it as CommonJS
      const cjsPackageJson = {
        name: '@dooboostore/simple-web-component-library-cjs-internal',
        private: true,
        type: 'commonjs'
      };
      fs.writeFileSync(path.resolve(__dirname, 'dist', 'cjs', 'package.json'), JSON.stringify(cjsPackageJson, null, 2));
      console.log('CJS build complete.');
      break;
    case 'all':
      if (!watch) {
        fs.rmSync(path.resolve(__dirname, 'dist'), { recursive: true, force: true });
      }
      await buildTarget('esm', watch);
      await buildTarget('cjs', watch);
      break;
    default:
      console.error('Invalid build target specified.');
      process.exit(1);
  }
}

const args = process.argv.slice(2);
const target = args[0] || 'all';
const watch = args.includes('--watch');

buildTarget(target, watch).catch(error => {
  console.error('Build process failed:', error);
  process.exit(1);
});
