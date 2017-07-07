var path = require('path');
var webpack = require('webpack');
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');
var ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');
var SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
var cssnext = require('postcss-cssnext');
var postcssFocus = require('postcss-focus');
var postcssReporter = require('postcss-reporter');
var cssnano = require('cssnano');
var WebpackBundleSizeAnalyzerPlugin = require('webpack-bundle-size-analyzer').WebpackBundleSizeAnalyzerPlugin;
var ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

module.exports = {
  devtool: 'hidden-source-map',

  entry: {
    app: ['./client/index.js'],
    vendor: ['react', 'react-dom', 'immutable', 'slate', 'intl', 'moment']
  },

  output: {
    path: __dirname + '/dist/',
    filename: '[name].[chunkhash].js',
    publicPath: '/'
  },

  resolve: {
    extensions: [
      '.js', '.jsx'
    ],
    modules: [
      path.resolve('./client'),
      'node_modules'
    ]
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        include: [
          /node_modules/, /plugin\.css/
        ],
        use: [
          {
            loader: 'style-loader'
          }, {
            loader: 'css-loader',
            options: {
              localIdentName: '[local]',
              modules: true,
              importLoaders: 1,
              sourceMap: true
            }
          }
        ]
      }, {
        test: /\.css$/,
        exclude: [
          /node_modules/, /plugin\.css$/
        ],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                localIdentName: '[hash:base64]',
                modules: true,
                importLoaders: 1
              }
            }, {
              loader: 'postcss-loader',
              options: {
                plugins: () => [
                  postcssFocus(),
                  cssnext({
                    browsers: ['last 2 versions', 'IE > 10']
                  }),
                  postcssReporter({clearMessages: true})
                ]
              }
            }
          ]
        })
      }, {
        test: /\.jsx*$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }, {
        test: /\.(jpe?g|gif|png|svg)$/i,
        loader: 'url-loader',
        options: {
          limit: 10000
        }
      }, {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        DEBUG: JSON.stringify(process.env.DEBUG || "app:production:*"),
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new LodashModuleReplacementPlugin({'shorthands': true, 'collections': true}),
    new webpack
      .optimize
      .CommonsChunkPlugin({
        name: 'vendor',
        filename: 'vendor.js'
      }),
    new ExtractTextPlugin({filename: 'app.[chunkhash].css', allChunks: true, disable: false}),
    new ManifestPlugin({basePath: '/'}),
    new ChunkManifestPlugin({filename: "chunk-manifest.json", manifestVariable: "webpackManifest"}),
    new webpack
      .optimize
      .UglifyJsPlugin({
        compressor: {
          unused: true,
          dead_code: true, // big one--strip code that will never execute
          warnings: false, // good for prod apps so users can't peek behind curtain
          drop_debugger: true,
          conditionals: true,
          evaluate: true,
          drop_console: true, // strips console statements
          sequences: true,
          booleans: true
        },
        comments: false,
        sourceMap: false,
        mangle: true,
        minimize: true
      }),
    new webpack
      .optimize
      .AggressiveMergingPlugin(),
    new webpack
      .optimize
      .ModuleConcatenationPlugin(),
    new WebpackBundleSizeAnalyzerPlugin('./plain-report.txt'),
    new ScriptExtHtmlWebpackPlugin({module: /\.js$/}),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /(zh-tw|en)/),
    new SWPrecacheWebpackPlugin({
      cacheId: 'tiamat',
      filename: 'precache-service-worker.js',
      staticFileGlobs: ['dist/**/*.{js,css}'],
      dontCacheBustUrlsMatching: /^(?!.*(vendor\.js)).*\.(js|css)$/,
      stripPrefixMulti: {
        'dist/': '',
        'assets/': ''
      },
      runtimeCaching: [
        {
          urlPattern: /^https?:\/\/(.+)\/api/,
          handler: 'networkFirst'
        }, {
          urlPattern: /^https?:\/\/(.+)\/(?!.*(api|\.)).*$/,
          handler: 'cacheFirst'
        }
      ],
      verbose: true
    })
  ]
};
