const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './index.ts',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: false,
            compilerOptions: {
              experimentalDecorators: true,
              emitDecoratorMetadata: true
            }
          }
        },
        exclude: /node_modules\/(?!@dooboostore)/
      },
      {
        test: /\.html$/,
        oneOf: [
          {
            exclude: /index\.html$/,
            type: 'asset/source'
          },
          {
            use: 'html-loader'
          }
        ]
      },
      {
        test: /\.css$/,
        type: 'asset/source'
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    // alias: {
    //   // --- Monorepo Workspace Alias ---
    //   // This project is part of a monorepo. When a file inside this package (e.g., an example)
    //   // imports from its own package name ('@dooboostore/simple-boot-front'), webpack's default
    //   // resolution can lead to issues by mixing source files (.ts) with pre-built files (.js from dist)
    //   // from the package's entry point.
    //   // These aliases force webpack to always resolve workspace packages to their source code ('src')
    //   // directory, ensuring a consistent dependency graph built entirely from source.
    //   '@dooboostore/simple-boot-front': path.resolve(__dirname, '../../src'),
    //   '@dooboostore/simple-boot': path.resolve(__dirname, '../../../simple-boot/src'),
    //   '@dooboostore/dom-render': path.resolve(__dirname, '../../../dom-render/src'),
    //   '@dooboostore/core': path.resolve(__dirname, '../../../core/src')
    // },
    fallback: {
      "tslib": require.resolve('tslib')
    }
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  plugins: [
    new webpack.WatchIgnorePlugin({
      paths: [/\.js$/, /\.d\.ts$/]
    }),
    new webpack.ProvidePlugin({
      tslib: 'tslib'
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: true
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    port: 8081,
    hot: true
  }
}; 