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
      }
      // HTML loader not needed for Node.js library
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
    alias: {
      '@dooboostore/core': path.resolve(__dirname, '../../../../packages/@dooboostore/core/src'),
      '@dooboostore/core-node': path.resolve(__dirname, '../../../../packages/@dooboostore/core-node/src'),
      '@dooboostore/core-web': path.resolve(__dirname, '../../../../packages/@dooboostore/core-web/src'),
      '@dooboostore/simple-boot': path.resolve(__dirname, '../../../../packages/@dooboostore/simple-boot/src'),
      '@dooboostore/simple-web-component': path.resolve(__dirname, '../../../../packages/@dooboostore/simple-web-component/src'),
      '@dooboostore/dom-parser': path.resolve(__dirname, '../src')
    },
    modules: ['node_modules', path.resolve(__dirname, '..'), path.resolve(__dirname, '../..'), path.resolve(__dirname, '../../..')]
  },
  optimization: {
    minimize: false
  },
  externals: {
    // Prevent bundling of heavy DOM libraries in Node environment
    jsdom: 'commonjs jsdom',
    linkedom: 'commonjs linkedom',
    playwright: 'commonjs playwright',
    // Ignore optional JSDOM dependencies
    canvas: 'commonjs canvas',
    bufferutil: 'commonjs bufferutil',
    'utf-8-validate': 'commonjs utf-8-validate'
  }
};
