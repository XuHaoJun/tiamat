const webpack = require("webpack");
const fs = require("fs");
const path = require("path");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: {
    server: [path.join(__dirname, "./server/server.js")]
  },

  output: {
    path: path.join(__dirname, "./build/"),
    filename: "server.bundle.js"
  },

  externals: [nodeExternals()],

  target: "node",

  node: {
    __filename: true,
    __dirname: true
  },

  resolve: {
    extensions: [".js", ".jsx"],
    modules: [
      path.join(__dirname, "./"),
      path.join(__dirname, "./server"),
      path.join(__dirname, "./client"),
      path.join(__dirname, "./node_modules")
    ]
  },

  module: {
    loaders: [
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: "file-loader?name=fonts/[name].[ext]"
      },
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/, /webpack\.config\.?.*\.js/],
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: false,
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    node: "current"
                  },
                  loose: true,
                  modules: false
                }
              ]
            ]
          }
        }
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
              localIdentName: "[local]"
            }
          }
        ]
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    new LodashModuleReplacementPlugin({ shorthands: true, collections: true })
  ]
};
