const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  target: 'node', // Set target to Node.js
  entry: './index.ts',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            // transpileOnly is set to true to speed up compilation
            // Type checking can be done in a separate process
            transpileOnly: true,
            compilerOptions: {
              experimentalDecorators: true,
              emitDecoratorMetadata: true
            }
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {

    }
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "resources", to: "resources" },
        { from: "index.html", to: "index.html" },
      ],
    }),
    new webpack.WatchIgnorePlugin({
      paths: [/\.js$/, /\.d\.ts$/]
    })
  ]
};