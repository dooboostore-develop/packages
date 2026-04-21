const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            experimentalWatchApi: true
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@dooboostore/simple-boot': path.resolve(__dirname, '../../../simple-boot/src'),
      '@dooboostore/simple-boot-http-server': path.resolve(__dirname, '../../../simple-boot-http-server/src'),
      '@dooboostore/simple-boot-http-server-ssr': path.resolve(__dirname, '../../../simple-boot-http-server-ssr/src'),
      '@dooboostore/core': path.resolve(__dirname, '../../../core/src'),
      '@dooboostore/core-web': path.resolve(__dirname, '../../../core-web/src'),
      '@dooboostore/dom-parser': path.resolve(__dirname, '../../../dom-parser/src'),
      '@dooboostore/simple-web-component': path.resolve(__dirname, '../../../simple-web-component/src')
    }
  },
  devServer: {
    port: 3006,
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'src')
    }
  },
  devtool: 'source-map'
};
