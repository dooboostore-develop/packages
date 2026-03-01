const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  target: 'node',
  mode: 'development',
  devtool: 'eval-source-map',
  entry: path.resolve(__dirname, 'manealTest.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'manealTest.js',
    clean: false
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.json'),
            transpileOnly: true,
            compilerOptions: {
              sourceMap: true
            }
          }
        },
        exclude: /node_modules\/(?!@dooboostore)/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@dooboostore/core': path.resolve(__dirname, '../../src'),
    },
    modules: [
      'node_modules',
      path.resolve(__dirname, '..'),
      path.resolve(__dirname, '../..'),
      path.resolve(__dirname, '../../..')
    ]
  },
  optimization: {
    minimize: false
  },
  node: {
    __dirname: true
  }
};
