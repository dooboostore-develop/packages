const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              experimentalDecorators: true,
              emitDecoratorMetadata: true
            }
          }
        },
        exclude: /node_modules/
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
    alias: {

    },
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
      template: './src/index.html',
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