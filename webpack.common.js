const webpack = require('webpack');
const path = require('path');

module.exports = {
  context: __dirname,
  entry: ['babel-polyfill', __dirname + '/src/ui/index.jsx'],
  resolve: {
    extensions: [".jsx", ".js"]
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader'
      }
    }, {
      test: /\.html$/,
      use: [{
        loader: 'html-loader',
        options: { minimize: true }
      }]
    }, {
      test: /\.(css|sass|scss)$/,
      use: [{
        loader: "style-loader" // creates style nodes from JS strings
      }, {
        loader: "css-loader" // translates CSS into CommonJS
      }, {
        loader: "sass-loader" // compiles Sass to CSS
      }]
    }]
  },
  externals: {
    litemol: "LiteMol"
  }
};
