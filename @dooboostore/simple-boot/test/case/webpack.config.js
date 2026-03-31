const path = require('path');
const { spawn } = require('child_process');

module.exports = {
  mode: 'development',
  entry: './index.ts',
  target: 'node',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.json')
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        use: 'html-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@dooboostore/core': path.resolve(__dirname, '../../../core/src/index.ts'),
      '@dooboostore/core-node': path.resolve(__dirname, '../../../core-node/src/index.ts'),
      '@dooboostore/simple-boot': path.resolve(__dirname, '../../../simple-boot/src/index.ts'),
      '@dooboostore/simple-boot-http-server': path.resolve(__dirname, '../../../simple-boot-http-server/src/index.ts'),
      '@dooboostore/simple-boot-http-server-ssr': path.resolve(__dirname, '../../../simple-boot-http-server-ssr/src/index.ts'),
      '@dooboostore/simple-boot-front': path.resolve(__dirname, '../../../simple-boot-front/src/index.ts'),
      '@dooboostore/dom-render': path.resolve(__dirname, '../../../dom-render/src/index.ts')
    }
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    devtoolModuleFilenameTemplate: '[absolute-resource-path]'
  },
  plugins: [
    {
      apply: compiler => {
        let nodeProcess;
        // 모든 파일 방출이 끝난 후 딱 한 번 실행되는 done 훅 사용
        compiler.hooks.done.tap('RunBundlePlugin', stats => {
          if (nodeProcess) {
            nodeProcess.kill();
          }
          // 에러가 없을 때만 실행하도록 정화
          if (!stats.hasErrors()) {
            console.log('\n[Webpack] Compilation successful. Starting dist/bundle.js...');
            nodeProcess = spawn('node', ['--inspect', '--enable-source-maps', path.resolve(__dirname, 'dist/bundle.js')], {
              stdio: 'inherit',
              shell: true
            });
          }
        });
      }
    }
  ]
};
