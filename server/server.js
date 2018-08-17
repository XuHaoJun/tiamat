import mongoose from "mongoose";
import Express from "express";
import qs from "qs";
import compression from "compression";
import morgan from "morgan";
import bodyParser from "body-parser";
import path from "path";
import http from "http";
import socketIO from "socket.io";
import Debug from "debug";
import Loadable from "react-loadable";

import Oauth2Client from "./models/oauth2Client";
import syncElasticsearch from "./util/syncElasticsearch";
import apiRoutes from "./apiRoutes";
import renderClientRoute from "./renderClientRoute";

// Initialize the Express App
const app = new Express();
app.set("query parser", str => {
  return qs.parse(str, { depth: 6 });
});

// Run Webpack dev server in development mode
if (process.env.NODE_ENV === "development") {
  // Webpack Requirements
  const webpack = require("webpack"); // eslint-disable-line
  const webpackDevConfig = require("../webpack.config.dev"); // eslint-disable-line
  const compiler = webpack(webpackDevConfig);

  const webpackDevMiddleware = require("webpack-dev-middleware"); // eslint-disable-line
  app.use(
    webpackDevMiddleware(compiler, {
      logLevel: "silent",
      publicPath: webpackDevConfig.output.publicPath
    })
  );

  const webpackHotMiddleware = require("webpack-hot-middleware"); // eslint-disable-line
  app.use(webpackHotMiddleware(compiler));
}

import dummyData from "./dummyData";
import appConfig from "./configs";
import passportConfig from "./configs/passport";

import passport from "passport";

passportConfig();

mongoose.Promise = Promise;

// MongoDB Connection
mongoose.connection.on("error", error => {
  if (error) {
    console.error("Please make sure Mongodb is installed and running!"); // eslint-disable-line no-console
    throw error;
  }
});

mongoose.connection.on("connected", () => {
  // feed some dummy data in DB.
  dummyData();
  syncElasticsearch();
  Oauth2Client.getAppClient();
});

mongoose.connect(appConfig.mongoDB.url, {
  useNewUrlParser: true
});

process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    process.exit(0);
  });
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(compression());
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));
if (process.env.NODE_ENV === "production") {
  app.use(
    Express.static(path.resolve(__dirname, "../dist"), { maxAge: "10d" })
  );
}
app.use(
  Express.static(path.resolve(__dirname, "../assets"), { maxAge: "10d" })
);
app.use(passport.initialize());

// closure handle hot reload route.
const _apiRoutes =
  process.env.NODE_ENV === "production"
    ? apiRoutes
    : (...args) => apiRoutes.handle(...args);

app.use("/api", _apiRoutes);

const _renderClientRoute =
  process.env.NODE_ENV === "production"
    ? renderClientRoute
    : (...args) => renderClientRoute.handle(...args);

app.use(_renderClientRoute);

const server = http.Server(app);

const io = socketIO(server);

app.set("io", io);

io.on("connection", socket => {
  const debug = Debug("app:socketIO");
  // TODO
  // auth by accessToken
  const accessToken = socket.handshake.query.access_token;
  if (accessToken) {
    debug("Client accessToken", accessToken);
  }
  debug("Client connected", socket.id);
  socket.on("disconnect", () => debug("Client disconnected", socket.id));
});

app.enable("trust proxy");

app.set("forceSSLOptions", {
  enable301Redirects: true,
  trustXFPHeader: true
});

// start app
Loadable.preloadAll().then(() => {
  const { port } = appConfig.server;
  server.listen(port, error => {
    const debug = Debug("app:server");
    if (!error) {
      debug(`Tiamat is running on port: ${port}! Build something amazing!`);
    }
  });
});

const hmrDebug = Debug("app:serverHMR");
if (module.hot) {
  module.hot.accept(
    ["./apiRoutes", "../client/App", "./renderClientRoute"],
    () => {
      hmrDebug(`🔁  Server-side HMR Reloading`);
    }
  );
  hmrDebug(`✅  Server-side HMR Enabled!`);
} else {
  hmrDebug("❌  Server-side HMR Not Supported.");
}

export default app;
