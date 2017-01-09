const webpack = require('webpack')

const config = {
  cache: true,
  debug: true,
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      mangle: true,
      warnings: false,
    }),
  ],
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
