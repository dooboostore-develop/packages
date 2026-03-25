const path = require('path');
const fs = require('fs');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const srcDir = path.resolve(__dirname, 'src');
const entries = {};
const htmlPlugins = [];

function scanDir(currentDir) {
  const files = fs.readdirSync(currentDir);
  files.forEach(file => {
    const fullPath = path.join(currentDir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.ts')) {
      const name = path.parse(file).name;
      // Use relative path from src to create unique entry name
      const relativePath = path.relative(srcDir, fullPath);
      const entryName = relativePath.replace('.ts', '').replace(/\\/g, '/');

      entries[entryName] = fullPath;

      const htmlFile = fullPath.replace('.ts', '.html');
      if (fs.existsSync(htmlFile)) {
        htmlPlugins.push(
          new HtmlWebpackPlugin({
            template: htmlFile,
            filename: `${entryName}.html`,
            chunks: [entryName]
          })
        );
      }
    }
  });
}

scanDir(srcDir);

module.exports = {
  target: 'web',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: 'source-map',
  entry: entries,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    clean: true
  },
  devServer: {
    hot: true,
    open: true,
    port: 3005,
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,
    historyApiFallback: true,
    watchFiles: [path.resolve(__dirname, 'src/**/*.html')]
  },
  plugins: [...htmlPlugins],
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
      '@dooboostore/simple-web-component': path.resolve(__dirname, '../../src'),
      '@dooboostore/simple-boot': path.resolve(__dirname, '../../../simple-boot/src')
    },
    modules: ['node_modules', path.resolve(__dirname, '..'), path.resolve(__dirname, '../..'), path.resolve(__dirname, '../../..')]
  },
  optimization: {
    minimize: false
  }
};
