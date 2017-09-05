const path = require('path')

const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const distPath = path.resolve(__dirname, 'dist')

module.exports = {
  entry: {
    'bm-evergreen-updater-legacy': ['whatwg-fetch', './src/evergreen-updater.js'],
    'bm-evergreen-updater-legacy.min': ['whatwg-fetch', './src/evergreen-updater.js'],
    'bm-evergreen-updater': ['./src/evergreen-updater.js'],
    'bm-evergreen-updater.min': ['./src/evergreen-updater.js']
  },
  output: {
    path: distPath,
    filename: '[name].js',
    library: 'bmEvergreen',
    libraryTarget: 'umd'
  },
  plugins: [
    new CleanWebpackPlugin([distPath]),
    new webpack.optimize.UglifyJsPlugin({
      parallel: {
        cache: true,
        workers: 2
      },
      include: /\.min\./,
      uglifyOptions: {
        ie8: false,
        output: {
          comments: false
        },
        compress: true
      }
    }),
  ],
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['es2015', 'env']
        }
      }
    }]
  }
}
