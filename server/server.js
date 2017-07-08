import Express from "express";
import compression from "compression";
import morgan from "morgan";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import path from "path";
import serializeJavascript from "serialize-javascript";
import http from "http";
import socketIO from "socket.io";
import Promise from "bluebird";
import Debug from "debug";
import IntlWrapper from "../client/modules/Intl/IntlWrapper";
import { setUserAgent } from "../client/modules/UserAgent/UserAgentActions";
import { setOauth2Client } from "../client/modules/Oauth2Client/Oauth2ClientActions";
import Oauth2Client from "./models/oauth2Client";
import googleAnalyticsConfig from "./configs/googleAnalytics";
import syncElasticsearch from "./util/syncElasticsearch";

// Webpack Requirements
import webpack from "webpack";
import webpackDevConfig from "../webpack.config.dev";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";

// Initialize the Express App
const app = new Express();

// Run Webpack dev server in development mode
if (process.env.NODE_ENV === "development") {
  const compiler = webpack(webpackDevConfig);
  app.use(
    webpackDevMiddleware(compiler, {
      noInfo: true,
      publicPath: webpackDevConfig.output.publicPath
    })
  );
  app.use(webpackHotMiddleware(compiler));
}

// React And Redux Setup
import { configureStore } from "../client/store";
import { Provider } from "react-redux";
import React from "react";
import { renderToString } from "react-dom/server";
import { match, RouterContext } from "react-router";
import Helmet from "react-helmet";
import injectTapEventPlugin from "react-tap-event-plugin";
import passport from "passport";

injectTapEventPlugin();

// Import required modules
import routes from "../client/routes";
import { fetchComponentData } from "./util/fetchData";
import apiRoutes from "./apiRoutes";

import dummyData from "./dummyData";
import appConfig from "./configs";
import passportConfig from "./configs/passport";

passportConfig();

// Set native promises as mongoose promise
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
  // set oauthClient
  setTimeout(() => {
    Oauth2Client.findOne(appConfig.oauth2Client).exec().then(oauth2Client => {
      app.set("oauth2Client", oauth2Client);
    });
  }, 1000);
});

mongoose.connect(appConfig.mongoDB.url, { auto_reconnect: true });

process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    process.exit(0);
  });
});

// Apply body Parser and server public assets and routes
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(compression());
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: false }));
app.use(Express.static(path.resolve(__dirname, "../dist")));
app.use(Express.static(path.resolve(__dirname, "../assets")));
app.use(passport.initialize());
const hotModuleDebug = Debug("app:hotModule");
if (module.hot) {
  module.hot.accept(["./apiRoutes", "../client/routes"], () => {
  hotModuleDebug("🔁  HMR Reloading `./app`..."); // eslint-disable-line
  });
  hotModuleDebug("✅  Server-side HMR Enabled!"); // eslint-disable-line
} else {
  hotModuleDebug("❌  Server-side HMR Not Supported."); // eslint-disable-line
}
app.use("/api", (req, res) => apiRoutes.handle(req, res));

// Render Initial HTML
const renderFullPage = (html, initialState) => {
  const head = Helmet.rewind();

  // Import Manifests
  const assetsManifest =
    process.env.webpackAssets && JSON.parse(process.env.webpackAssets);
  const chunkManifest =
    process.env.webpackChunkAssets &&
    JSON.parse(process.env.webpackChunkAssets);

  return `
    <!doctype html>
    <html>
      <head>
        ${head.base.toString()}
        ${head.title.toString()}
        ${head.meta.toString()}
        ${head.link.toString()}
        ${head.script.toString()}

        <link href="/appManifest.json" rel="manifest">
        <link async href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet">

        ${process.env.NODE_ENV === "production"
          ? `<link rel='stylesheet' href='${assetsManifest["/app.css"]}' />`
          : ""}
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
        <meta name="mobile-web-app-capable" content="yes">
        <meta charset="utf-8" />
        ${process.env.NODE_ENV === "production" &&
        googleAnalyticsConfig["google-site-verification"]
          ? `<meta name='google-site-verification' content='${googleAnalyticsConfig[
              "google-site-verification"
            ]}'/>`
          : ""}
        <script>
          (function() {
            if (${process.env.NODE_ENV === "production"}) {
              if (location && location.protocol === 'https:') {
                if (navigator && 'serviceWorker' in navigator) {
                  navigator
                    .serviceWorker
                    .register('/precache-service-worker.js');
                }
              } else if (location && location.protocol === 'http:' && !(location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
                location.href = location
                  .href
                  .replace(/^http:/, 'https:');
              }
            }
          })();
        </script>
      </head>
      <body>
        <div id="root">${process.env.NODE_ENV === "production"
          ? html
          : `<div>${html}</div>`}</div>
        <script>
          window.__INITIAL_STATE__ = ${serializeJavascript(initialState, {
            isJSON: true
          })};
          ${process.env.NODE_ENV === "production"
            ? `//<![CDATA[
          window.webpackManifest = ${JSON.stringify(chunkManifest)};
          //]]>`
            : ""}
        </script>
        <script src='${process.env.NODE_ENV === "production"
          ? assetsManifest["/vendor.js"]
          : "/vendor.js"}'></script>
        <script src='${process.env.NODE_ENV === "production"
          ? assetsManifest["/app.js"]
          : "/app.js"}'></script>
      </body>
    </html>
  `;
};

const renderError = err => {
  const softTab = "&#32;&#32;&#32;&#32;";
  const errTrace =
    process.env.NODE_ENV !== "production"
      ? `:<br><br><pre style="color:red">${softTab}${err.stack.replace(
          /\n/g,
          `<br>${softTab}`
        )}</pre>`
      : "";
  return renderFullPage(`Server Error${errTrace}`, {});
};

// Server Side Rendering based on routes matched by React-router.
app.use((req, res, next) => {
  match(
    {
      routes,
      location: req.url
    },
    (err, redirectLocation, renderProps) => {
      if (err) {
        return res.status(500).end(renderError(err));
      }

      if (redirectLocation) {
        return res.redirect(
          302,
          redirectLocation.pathname + redirectLocation.search
        );
      }

      if (!renderProps) {
        return next();
      }

      // get userAgent from server side.
      const userAgent = req.headers["user-agent"];
      // get oauth2Client for current render client.
      const oauth2Client = app.get("oauth2Client");
      // emulate browser size by userAgent.

      const store = configureStore();
      store.dispatch(setUserAgent(userAgent));
      store.dispatch(setOauth2Client(oauth2Client, "app"));
      if (appConfig.oauth2.facebook.clientID) {
        const clientID = appConfig.oauth2.facebook.clientID;
        store.dispatch(setOauth2Client({ clientID }, "facebook"));
      }

      return fetchComponentData(
        store,
        renderProps.components,
        renderProps.params,
        renderProps.location.query
      )
        .then(() => {
          const initialView = renderToString(
            <Provider store={store}>
              <IntlWrapper>
                <RouterContext {...renderProps} />
              </IntlWrapper>
            </Provider>
          );
          const finalState = store.getState();

          res
            .set("Content-Type", "text/html")
            .status(200)
            .end(renderFullPage(initialView, finalState));
        })
        .catch(error => next(error));
    }
  );
});

const server = http.Server(app);

const io = socketIO(server);

app.set("io", io);

io.on("connection", socket => {
  const debug = Debug("app:socketIO");
  debug("Client connected");
  socket.on("disconnect", () => debug("Client disconnected"));
});

// start app
server.listen(appConfig.server.port, error => {
  const debug = Debug("app:server");
  if (!error) {
    debug(
      `Tiamat is running on port: ${appConfig.server
        .port}! Build something amazing!`
    );
  }
});

export default app;
