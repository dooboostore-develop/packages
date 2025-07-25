const path = require('path');

module.exports = {
  entry: './index.ts',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist', 'dist'),
    filename: 'bundle.js',
    library: {
      type: 'module',
    },
  },
  experiments: {
    outputModule: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              noEmit: false,
            },
          },
        },
        exclude: /node_modules\/(?!@dooboostore)/,
      },
    ],
  },
};
