const cssnext = require("postcss-cssnext");
const postcssFocus = require("postcss-focus");
const postcssReporter = require("postcss-reporter");
const nodeExternals = require("webpack-node-externals");

let cssModulesIdentName = "[name]__[local]__[hash:base64:5]";
if (process.env.NODE_ENV === "production") {
  cssModulesIdentName = "[hash:base64]";
}

module.exports = {
  output: {
    publicPath: "/",
    libraryTarget: "commonjs2"
  },

  externals: [nodeExternals({ whitelist: [/^webpack\/hot\/poll/] })],
  
  node: {
    __filename: true,
    __dirname: true
  },

  resolve: {
    extensions: [".js", ".jsx"],
    modules: ["client", "node_modules"]
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [/node_modules/, /plugin\.css/],
        use: [
          { loader: "style-loader" },
          {
            loader: "css-loader",
            options: {
              localIdentName: "[local]",
              modules: true,
              importLoaders: 1,
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.gz$/,
        enforce: "pre",
        use: "gzip-loader"
      },
      {
        test: /\.css$/,
        exclude: [/node_modules/, /plugin\.css$/],
        use: [
          { loader: "style-loader" },
          {
            loader: "css-loader",
            options: {
              localIdentName: cssModulesIdentName,
              modules: true,
              importLoaders: 1,
              sourceMap: true
            }
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [
                postcssFocus(),
                cssnext({
                  browsers: ["last 2 versions", "IE > 10"]
                }),
                postcssReporter({
                  clearMessages: true
                })
              ]
            }
          }
        ]
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$/i,
        loader: "url-loader",
        options: {
          limit: 10000
        }
      }
    ]
  }
};
