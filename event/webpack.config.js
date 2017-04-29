const path = require('path')

module.exports = {
  entry: './event/src/index.js',

  output: {
    filename: 'event.js',
    path: path.join(__dirname, '../', 'build'),
    publicPath: '/'
  },

  module: {
    rules: [
      {
        use: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/
      }
    ]
  }
}
