const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')

const ROOT_PATH = path.resolve(__dirname)
const PRODUCTION = process.env.NODE_ENV === 'production'

const filterFalsy = arr => arr.filter(e => e)

const createPlugins = () =>
  filterFalsy([
    PRODUCTION &&
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          drop_console: false
        },
        mangle: {
          screw_ie8: true,
          except: ['webpackJsonp'],
          keep_fnames: true
        },
        sourceMap: false
      }),

    new HtmlWebpackPlugin({
      title: 'Lounasjuna',
      template: path.join(ROOT_PATH, './popup/src/template/popup.ejs'),
      filename: 'popup.html',
      scriptName: 'popup.js',
      cssName: 'popup.css',
      chunks: ['popup']
    }),

    new CopyWebpackPlugin([
      {
        from: path.join(ROOT_PATH, 'manifest.json'),
        to: path.join(ROOT_PATH, 'build/manifest.json')
      },
      {
        from: path.join(ROOT_PATH, 'content/src/styles/content.css'),
        to: path.join(ROOT_PATH, 'build/content.css')
      },
      {
        from: path.join(ROOT_PATH, 'popup/icons/lounasjuna_32.png'),
        to: path.join(ROOT_PATH, 'build/lounasjuna_32.png')
      }
    ]),

    PRODUCTION && new ExtractTextPlugin('popup.css'),

    PRODUCTION &&
      new StyleExtHtmlWebpackPlugin({
        file: 'popup.css',
        minify: true
      }),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),

    PRODUCTION &&
      new ZipPlugin({
        path: path.join(ROOT_PATH, 'dist'),
        filename: 'lounasjuna.zip'
      })
  ])

const getCSSRule = () => {
  return PRODUCTION
    ? ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: 'css-loader',
      filename: 'popup.css'
    })
    : ['style-loader', 'css-loader']
}

const config = {
  watchOptions: {
    aggregateTimeout: 300,
    ignored: /node_modules/
  },

  entry: {
    'babel-polyfill': 'babel-polyfill',
    popup: path.resolve('./popup/src/scripts/index.js'),
    content: path.resolve('./content/src/scripts/index.js'),
    background: path.resolve('./background/src/index.js')
  },

  output: {
    filename: '[name].js',
    path: path.join(ROOT_PATH, 'build')
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader?presets[]=react,presets[]=env,presets[]=stage-0',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: getCSSRule()
      },
      {
        test: /\.less$/,
        use:  ['style-loader', 'css-loader', 'less-loader']
      }
    ]
  },

  plugins: createPlugins()
}

module.exports = config
