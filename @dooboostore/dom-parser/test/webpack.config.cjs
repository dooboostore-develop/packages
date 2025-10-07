const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  target: 'node',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: 'source-map',
  entry: path.resolve(__dirname, 'src/index.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    clean: true,
    library: {
      type: 'commonjs2'
    }
  },
  // devServer not needed for Node.js library testing
  plugins: [
    // HTML plugin not needed for Node.js DOM parsing library
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
      // HTML loader not needed for Node.js library
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
    alias: {
      // '@dooboostore/simple-boot': path.resolve(__dirname, '../../../../@dooboostore/simple-boot/src'),
      // '@dooboostore/simple-boot-http-server': path.resolve(__dirname, '../../../../@dooboostore/simple-boot-http-server/src'),
      // '@dooboostore/simple-boot-http-server-ssr': path.resolve(__dirname, '../../../../@dooboostore/simple-boot-http-server-ssr/src'),
      // '@dooboostore/simple-boot-front': path.resolve(__dirname, '../../../@dooboostore/simple-boot-front/src'),
      '@dooboostore/core': path.resolve(__dirname, '../../../../@dooboostore/core/src'),
      '@dooboostore/core-node': path.resolve(__dirname, '../../../../@dooboostore/core-node/src'),
      '@dooboostore/core-web': path.resolve(__dirname, '../../../../@dooboostore/core-web/src'),
      '@dooboostore/dom-parser': path.resolve(__dirname, '../src')

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
  externals: {
    // Ignore canvas for linkedom since it's optional and causes webpack issues
    'canvas': 'commonjs canvas',
    // Ignore optional JSDOM dependencies
    'bufferutil': 'commonjs bufferutil',
    'utf-8-validate': 'commonjs utf-8-validate'
  }
};
