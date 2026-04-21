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
    }
  },
  devServer: {
    port: process.env.PORT || 3007,
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'src')
    }
  },
  devtool: 'source-map'
};
