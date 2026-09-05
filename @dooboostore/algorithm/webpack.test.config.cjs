// 테스트 번들 — 프로덕션과 동일한 ts-loader/모듈 해석으로 묶어 node --test로 실행.
const path = require('path');

module.exports = {
  mode: 'development',
  target: 'node',
  entry: {
    'engine.test': './test/engine.test.ts',
  },
  output: {
    filename: '[name].cjs',
    path: path.resolve(__dirname, 'dist-test'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  devtool: false,
};
