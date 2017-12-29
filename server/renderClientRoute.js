import { Router } from "express";
import React from "react";
import Helmet from "react-helmet";
import { setKeyGenerator } from "slate";
import serializeJavascript from "serialize-javascript";
import { renderToNodeStream } from "react-dom/server";
import { match, RouterContext } from "react-router";
import moment from "moment";
import { Provider } from "react-redux";
import IntlWrapper from "../client/modules/Intl/IntlWrapper";
import clientRoutes from "../client/routes";
import { setUserAgent } from "../client/modules/UserAgent/UserAgentActions";
import { setOauth2Client } from "../client/modules/Oauth2Client/Oauth2ClientActions";
import googleAnalyticsConfig from "./configs/googleAnalytics";
import { configureStore } from "../client/store";
import { calculateResponsiveStateByUserAgent } from "../client/modules/Browser/BrowserActions";
import { fetchComponentData } from "./util/fetchData";
import appConfig from "./configs";
import Oauth2Client from "./models/oauth2Client";

export function renderHead() {
  const head = Helmet.rewind();
  // Import Manifests
  const assetsManifest =
    process.env.webpackAssets && JSON.parse(process.env.webpackAssets);
  if (process.env.NODE_ENV === "production" && !assetsManifest) {
    throw new Error("assetsManifest is required.");
  }
  return `
      <head>
        ${head.base.toString()}
        ${head.title.toString()}
        ${head.meta.toString()}
        ${head.link.toString()}
        ${head.script.toString()}
        <link href="/appManifest.json" rel="manifest">
        <link async href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet">
        ${
          process.env.NODE_ENV === "production"
            ? `<link rel='stylesheet' href='${assetsManifest["/app.css"]}' />`
            : ""
        }
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
        <meta name="mobile-web-app-capable" content="yes">
        <meta charset="utf-8" />
        <link rel="stylesheet" type="text/css" href="/main.css">
        ${
          process.env.NODE_ENV === "production" &&
          googleAnalyticsConfig["google-site-verification"]
            ? `<meta name='google-site-verification' content='${
                googleAnalyticsConfig["google-site-verification"]
              }'/>`
            : ""
        }
        <script>
          (function() {
            if (${process.env.NODE_ENV === "production"}) {
              if (location && location.protocol === 'https:') {
                if (navigator && 'serviceWorker' in navigator) {
                  navigator
                    .serviceWorker
                    .register('/precache-service-worker.js');
                }
              } else if (location && location.protocol === 'http:') {
                var localHostnameRegexp = new RegExp(${"'(^127.)|(^192.168.)|(^10.)|(^172.1[6-9].)|(^172.2[0-9].)|(^172.3[0-1].)|(^::1$)|(^[fF][cCdD])'"});
                var isLocal = location.hostname === 'localhost' || localHostnameRegexp.test(location.hostname);
                if (!isLocal) {
                  location.href = location
                    .href
                    .replace(/^http:/, 'https:');
                }
              }
            }
          })();
        </script>
      </head>
  `;
}

export function renderScripts(initialState) {
  // Import Manifests
  const assetsManifest =
    process.env.webpackAssets && JSON.parse(process.env.webpackAssets);
  if (process.env.NODE_ENV === "production" && !assetsManifest) {
    throw new Error("assetsManifest is required.");
  }
  const chunkManifest =
    process.env.webpackChunkAssets &&
    JSON.parse(process.env.webpackChunkAssets);
  if (process.env.NODE_ENV === "production" && !chunkManifest) {
    throw new Error("chunkManifest is required.");
  }
  // use serializeJavascript for prevent XSS attack, don't remove it.
  const rawInitState = serializeJavascript(initialState, {
    isJSON: true
  });
  return `
        <script>
          window.__INITIAL_STATE__ = ${rawInitState};
          ${
            process.env.NODE_ENV === "production"
              ? `//<![CDATA[
          window.webpackManifest = ${JSON.stringify(chunkManifest)};
          //]]>`
              : ""
          }
        </script>
        <script src='${
          process.env.NODE_ENV === "production"
            ? assetsManifest["/vendor.js"]
            : "/vendor.js"
        }'></script>
        <script defer src='${
          process.env.NODE_ENV === "production"
            ? assetsManifest["/app.js"]
            : "/app.js"
        }'></script>
        `;
}

// Render Initial HTML
export function renderFullPage(html, initialState) {
  const head = renderHead();
  const scripts = renderScripts(initialState);
  return `
    <!doctype html>
    <html>
      ${head}
      <body>
        <div id="root">${
          process.env.NODE_ENV === "production" ? html : `<div>${html}</div>`
        }</div>
        ${scripts}
      </body>
    </html>
  `;
}

export function renderError(err) {
  const softTab = "&#32;&#32;&#32;&#32;";
  const errTrace =
    process.env.NODE_ENV !== "production"
      ? `:<br><br><pre style="color:red">${softTab}${err.stack.replace(
          /\n/g,
          `<br>${softTab}`
        )}</pre>`
      : "";
  return renderFullPage(`Server Error${errTrace}`, {});
}

// Server Side Rendering based on routes matched by React-router.
export function renderClientRoute(req, res, next) {
  match(
    {
      routes: clientRoutes,
      location: req.url
    },
    async (err, redirectLocation, renderProps) => {
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

      const store = configureStore();

      // get userAgent from server side.
      const userAgent = req.headers["user-agent"];
      store.dispatch(setUserAgent(userAgent));
      // get oauth2Client for current render client.
      const oauth2Client = await Oauth2Client.getAppClient();
      store.dispatch(setOauth2Client(oauth2Client, "app"));
      // guess browser size by userAgent.
      store.dispatch(calculateResponsiveStateByUserAgent(userAgent));

      if (appConfig.oauth2.facebook.clientID) {
        const { clientID } = appConfig.oauth2.facebook;
        store.dispatch(setOauth2Client({ clientID }, "facebook"));
      }
      return fetchComponentData(
        store,
        renderProps.components,
        renderProps.params,
        renderProps.location.query,
        renderProps.routes,
        renderProps
      )
        .then(() => {
          res.set("Content-Type", "text/html").status(200);
          res.write("<!doctype html><html>");
          res.write(renderHead());
          res.write("<body>");
          res.write('<div id="root">');
          let n = 0;
          setKeyGenerator(() => {
            n += 1;
            return `${n}`;
          });
          // TODO
          // locale by request langa.
          moment.locale(store.getState().intl.locale);
          const stream = renderToNodeStream(
            <Provider store={store}>
              <IntlWrapper>
                <RouterContext {...renderProps} />
              </IntlWrapper>
            </Provider>
          );
          stream.on("error", error => {
            console.warn(error);
          });
          stream.pipe(res, { end: false });
          stream.on("end", () => {
            res.write("</div>");
            const finalState = store.getState();
            res.write(renderScripts(finalState));
            res.write("</body></html>");
            res.end();
          });
        })
        .catch(error => {
          next(error);
        });
    }
  );
}

const router = new Router();

router.get("*", renderClientRoute);

export default router;
