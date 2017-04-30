const path = require('path')

module.exports = {
  entry: './content/src/scripts/index.js',

  output: {
    filename: 'content.js',
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
