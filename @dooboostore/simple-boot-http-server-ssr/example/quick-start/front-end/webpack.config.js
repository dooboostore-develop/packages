const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: 'source-map',
  entry: path.resolve(__dirname, './index.ts'),
  output: {
    path: path.resolve(__dirname, '../dist-front-end'),
    filename: 'bundle.js',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.js', '.html'],
    plugins: [new TsconfigPathsPlugin({
      configFile: path.resolve(__dirname, './tsconfig.json')
    })],
    alias: {
      '@front-end': path.resolve(__dirname),
      '@src': path.resolve(__dirname, '../src')
    }
  },
  module: {
    rules: [
      {
        test: /\.worker\.ts$/, // Worker 파일専용 규칙
        use: [
          {
            loader: 'worker-loader',
            options: {
              filename: '[name].worker.js' // 출력 파일 이름
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
            configFile: path.resolve(__dirname, './tsconfig.json'),
            transpileOnly: true,
            compilerOptions: {
              sourceMap: true
            }
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        use: 'raw-loader'
      },
      {
        test: /\.css$/,
        use: ['raw-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './index.html'),
      scriptLoading: 'defer'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './assets'),
          to: 'assets'
        },
        // {
        //   from: path.resolve(__dirname, './robots.txt'),
        //   to: '.'
        // }
      ]
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, '../dist-front-end')
    },
    compress: true,
    port: 9000
  }
}; 