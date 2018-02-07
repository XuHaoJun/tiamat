const webpack = require("webpack");
const fs = require("fs");
const path = require("path");
const ExternalsPlugin = require("webpack2-externals-plugin");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

module.exports = {
  entry: {
    server: ["./server/server.js"]
  },

  output: {
    path: `${__dirname}/build/`,
    filename: "server.bundle.js"
  },

  target: "node",

  node: {
    __filename: true,
    __dirname: true
  },

  resolve: {
    extensions: [".js", ".jsx"],
    modules: ["client", "node_modules"]
  },

  module: {
    loaders: [
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: "file-loader?name=fonts/[name].[ext]"
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ["react", "es2015", "stage-0"],
          plugins: [
            [
              "babel-plugin-webpack-loaders",
              {
                config: "./webpack.config.babel.js",
                verbose: false
              }
            ],
            ["extensible-destructuring", { mode: "optout", impl: "immutable" }]
          ]
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
    new LodashModuleReplacementPlugin({ shorthands: true, collections: true }),
    new ExternalsPlugin({
      type: "commonjs",
      include: path.join(__dirname, "./node_modules/")
    })
  ]
};
