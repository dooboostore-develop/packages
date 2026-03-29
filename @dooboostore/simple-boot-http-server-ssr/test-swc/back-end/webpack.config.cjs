const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  target: 'node',
  mode: 'development',
  devtool: 'source-map',
  entry: path.resolve(__dirname, 'index.ts'),
  output: {
    path: path.resolve(__dirname, '../dist-back-end'),
    filename: 'index.cjs',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, './tsconfig.json'),
            transpileOnly: true
          }
        },

        exclude: /node_modules\/(?!@dooboostore)/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, '../tsconfig.json')
      })
    ],
    alias: {
      '@swc-src': path.resolve(__dirname, '../src'),
      '@dooboostore/simple-boot': path.resolve(__dirname, '../../../simple-boot/src'),
      '@dooboostore/simple-boot-http-server': path.resolve(__dirname, '../../../simple-boot-http-server/src'),
      '@dooboostore/simple-boot-http-server-ssr': path.resolve(__dirname, '../../src'),
      '@dooboostore/core': path.resolve(__dirname, '../../../core/src'),
      '@dooboostore/dom-parser': path.resolve(__dirname, '../../../dom-parser/src'),
      '@dooboostore/simple-web-component': path.resolve(__dirname, '../../../simple-web-component/src')
    }
  },
  externals: {
    canvas: 'commonjs canvas',
    'utf-8-validate': 'commonjs utf-8-validate',
    bufferutil: 'commonjs bufferutil'
  },
  optimization: {
    minimize: false
  },
  node: {
    __dirname: true
  }
};
