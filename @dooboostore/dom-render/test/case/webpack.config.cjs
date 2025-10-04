const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  target: 'web',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: 'source-map',
  entry: path.resolve(__dirname, 'src/index.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  devServer: {
    hot: true,
    open: true,
    port: 3001,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    historyApiFallback: true,
    watchFiles: [path.resolve(__dirname, 'src/index.html')],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html',
    }),
  ],
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
      },
      {
        test: /\.html$/,
        use: 'html-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.html'],
    plugins: [new TsconfigPathsPlugin()],
    alias: {
      // '@dooboostore/simple-boot': path.resolve(__dirname, '../../../../@dooboostore/simple-boot/src'),
      // '@dooboostore/simple-boot-http-server': path.resolve(__dirname, '../../../../@dooboostore/simple-boot-http-server/src'),
      // '@dooboostore/simple-boot-http-server-ssr': path.resolve(__dirname, '../../../../@dooboostore/simple-boot-http-server-ssr/src'),
      // '@dooboostore/simple-boot-front': path.resolve(__dirname, '../../../@dooboostore/simple-boot-front/src'),
      '@dooboostore/core': path.resolve(__dirname, '../../../../@dooboostore/core/src'),
      '@dooboostore/core-node': path.resolve(__dirname, '../../../../@dooboostore/core-node/src'),
      '@dooboostore/core-web': path.resolve(__dirname, '../../../../@dooboostore/core-web/src'),
      '@dooboostore/dom-render': path.resolve(__dirname, '../../../../@dooboostore/dom-render/src')

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
  }
};
