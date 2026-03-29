const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: path.resolve(__dirname, './index.ts'),
  output: {
    path: path.resolve(__dirname, '../dist-front-end'),
    filename: 'bundle.js',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.js', '.html', '.css'],
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
        exclude: /node_modules/
      },

      {
        test: /\.html$/,
        use: 'raw-loader'
      },
      {
        test: /\.css$/,
        use: ['raw-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './index.html'),
      scriptLoading: 'defer'
    })
  ]
};
