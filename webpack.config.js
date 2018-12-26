module.exports = {
  output: {
    library: 'animateCSSGrid',
    libraryTarget: 'umd',
  },
  devtool: 'source-map',
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
