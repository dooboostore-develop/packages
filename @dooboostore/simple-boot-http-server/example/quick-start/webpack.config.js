const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');

module.exports = {
  target: 'node',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: 'eval-source-map',
  entry: path.resolve(__dirname, 'src/index.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    clean: true
  },
  plugins: [
    new NodemonPlugin({
      script: path.resolve(__dirname, 'dist/index.js'),
      watch: path.resolve(__dirname, 'dist'),
      nodeArgs: ['--inspect']
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
              sourceMap: true,
              emitDecoratorMetadata: true,
              experimentalDecorators: true,
              module: "commonjs"
            }
          }
        },
        exclude: /node_modules\/(?!@dooboostore)/
      },
      {
        test: /\.html$/,
        use: 'raw-loader'
      },
      {
        test: /\.css$/,
        use: 'raw-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.html', '.css'],
    plugins: [new TsconfigPathsPlugin({
      configFile: path.resolve(__dirname, './tsconfig.json')
    })],
    alias: {
      '@dooboostore/simple-boot-http-server': path.resolve(__dirname, '../../src'),
      '@dooboostore/simple-boot': path.resolve(__dirname, '../../../simple-boot/src'),
      '@dooboostore/core': path.resolve(__dirname, '../../../core/src'),
      '@dooboostore/core-node': path.resolve(__dirname, '../../../core-node/src')
    },
    modules: [
      'node_modules',
      path.resolve(__dirname, '..'),
      path.resolve(__dirname, '../..'),
      path.resolve(__dirname, '../../..')
    ]
  },
  externals: {
    'canvas': 'commonjs canvas',
    'utf-8-validate': 'commonjs utf-8-validate',
    'bufferutil': 'commonjs bufferutil',
    'jsdom': 'commonjs jsdom'
  },
  optimization: {
    minimize: false
  },
  node: {
    __dirname: true
  }
};