const webpack = require('webpack');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const cssnext = require('postcss-cssnext');
const postcssFocus = require('postcss-focus');
const postcssReporter = require('postcss-reporter');

module.exports = {
  devtool: 'cheap-module-eval-source-map',

  entry: {
    app: [
      'eventsource-polyfill',
      'webpack-hot-middleware/client',
      'webpack/hot/only-dev-server',
      'react-hot-loader/patch',
      './client/index.js',
    ],
    vendor: ['react', 'react-dom'],
  },

  output: {
    path: '/',
    filename: 'app.js',
    publicPath: 'http://localhost:8000/',
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    modules: ['client', 'node_modules'],
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        include: [/node_modules/, /plugin\.css/],
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              localIdentName: '[local]',
              modules: true,
              importLoaders: 1,
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.gz$/,
        enforce: 'pre',
        use: 'gzip-loader',
      },
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader?name=fonts/[name].[ext]',
      },
      {
        test: /\.css$/,
        exclude: [/node_modules/, /plugin\.css$/],
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              localIdentName: '[name]__[local]__[hash:base64:5]',
              modules: true,
              importLoaders: 1,
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                postcssFocus(),
                cssnext({
                  browsers: ['last 2 versions', 'IE > 10'],
                }),
                postcssReporter({
                  clearMessages: true,
                }),
              ],
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/, /webpack\.config\.?.*\.js/],
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                useBuiltIns: 'usage',
                modules: false,
                loose: true,
                targets: {
                  chrome: 52,
                  browsers: ['last 2 versions', 'safari 7'],
                },
              },
            ],
          ],
        },
      },
      {
        test: /\.(jpe?g|gif|png|svg)$/i,
        loader: 'url-loader',
        options: {
          limit: 10000,
        },
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },

  plugins: [
    new LodashModuleReplacementPlugin({
      shorthands: true,
      collections: true,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
      filename: 'vendor.js',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        CLIENT: JSON.stringify(true),
        DEBUG: JSON.stringify(process.env.DEBUG || 'app:*'),
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
};
