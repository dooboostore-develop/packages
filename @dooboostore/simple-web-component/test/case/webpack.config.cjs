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
    clean: true
  },
  devServer: {
    hot: true,
    open: true,
    port: 3005, // Different port for this test case
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,
    historyApiFallback: true,
    watchFiles: [path.resolve(__dirname, 'src/index.html')]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html'
    })
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
      '@dooboostore/core': path.resolve(__dirname, '../../../core/src'),
      '@dooboostore/core-node': path.resolve(__dirname, '../../../core-node/src'),
      '@dooboostore/core-web': path.resolve(__dirname, '../../../core-web/src'),
      '@dooboostore/simple-web-component': path.resolve(__dirname, '../../src')
    },
    modules: ['node_modules', path.resolve(__dirname, '..'), path.resolve(__dirname, '../..'), path.resolve(__dirname, '../../..')]
  },
  optimization: {
    minimize: false
  }
};
