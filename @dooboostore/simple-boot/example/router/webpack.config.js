const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');

module.exports = {
  target: 'node',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: 'source-map',
  entry: path.resolve(__dirname, 'src/index.ts'), // Modified entry
  output: {
    path: path.resolve(__dirname, 'dist'), // Modified output path
    filename: 'index.js',
    clean: true
  },
  plugins: [
    new NodemonPlugin({
      script: path.resolve(__dirname, 'dist/index.js'), // Modified script path
      watch: path.resolve(__dirname, 'dist'), // Modified watch path
      nodeArgs: ['--inspect']
    })
  ],
  module: {
    rules: [
      {
        test: /\.worker\.ts$/,
        use: [
          {
            loader: 'worker-loader',
            options: {
              filename: '[name].worker.js'
            }
          },
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, './tsconfig.json'),
              transpileOnly: true,
              compilerOptions: {
                sourceMap: true
              }
            }
          }
        ],
        exclude: /node_modules/
      },
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
    alias: { // Added aliases
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
