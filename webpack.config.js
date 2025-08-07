const path = require('path');

module.exports = {
  entry: './src/burger.ts', // ваш основной TypeScript файл
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // папка для итогового файла
  },
  mode: 'development', // или 'production' для финальной версии
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader', // используйте ts-loader для TypeScript
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'], // расширения для Webpack
  },
};