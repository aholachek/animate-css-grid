var path = require('path');

module.exports = {
  // can be relative (???)
  entry: path.resolve(__dirname, 'index.js'),
  output: {
    filename: 'bundle.js',
    // has to be absolute (???)
    path: path.resolve(__dirname, 'demo'),
  },

  module: {
    rules: [
      {
        test: /\.js$|\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
