const fs = require("fs");
const path = require("path");
const StartServerPlugin = require("start-server-webpack-plugin");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");

let cssModulesIdentName = "[name]__[local]__[hash:base64:5]";
if (process.env.NODE_ENV === "production") {
  cssModulesIdentName = "[hash:base64]";
}

module.exports = {
  devtool: "inline-sourcemap",

  entry: {
    server: ["babel-polyfill", "webpack/hot/poll?300", "./server/server.js"]
  },

  externals: [nodeExternals({ whitelist: [/^webpack\/hot\/poll/] })],

  resolve: {
    extensions: [".js", ".jsx"],
    modules: ["client", "node_modules"]
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            babelrc: false,
            cacheDirectory: true,
            presets: [
              [
                "es2015",
                {
                  modules: false
                }
              ],
              "react",
              "stage-0"
            ],
            plugins: [
              [
                "extensible-destructuring",
                { mode: "optout", impl: "immutable" }
              ],
              "react-hot-loader/babel",
              "react-loadable/babel"
            ]
          }
        }
      },
      {
        test: /\.gz$/,
        enforce: "pre",
        use: "gzip-loader"
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      },
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: "file-loader?name=fonts/[name].[ext]"
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "universal-style-loader"
          },
          {
            loader: "css-loader",
            options: {
              localIdentName: cssModulesIdentName
            }
          }
        ]
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|\.svg$/i,
        loader: "url-loader",
        options: {
          limit: 10000
        }
      }
    ]
  },

  node: {
    __filename: true,
    __dirname: true
  },

  output: {
    chunkFilename: "[id].[hash:5]-[chunkhash:7].js",
    devtoolModuleFilenameTemplate: "[absolute-resource-path]",
    filename: "[name].js",
    // libraryTarget: "commonjs2",
    path: `${__dirname}/build/server/`
  },

  plugins: [
    new StartServerPlugin({ name: "server.js" }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],

  target: "node"
};
