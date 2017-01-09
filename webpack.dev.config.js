const config = {
  cache: true,
  debug: true,
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['', '.js'],
    modulesDirectories: ['node_modules'],
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/,
      },
    ],
  },
}
module.exports = config
