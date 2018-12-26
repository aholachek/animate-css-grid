module.exports = {
  output: {
    library: 'animateCSSGrid',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js|\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  resolve : {
    extensions : ['.ts', '.js']
  }
};
