const path = require('path');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
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
    plugins: [new TsconfigPathsPlugin()],
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
    port: 3002,
    hot: true,
    open: true,
    historyApiFallback: true
  }
};
