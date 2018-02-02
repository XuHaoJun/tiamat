import { Router } from "express";
import React from "react";
import Helmet from "react-helmet";
import { setKeyGenerator } from "slate";
import serializeJavascript from "serialize-javascript";
import moment from "moment";
import { renderToNodeStream, renderToString } from "react-dom/server";
import { matchRoutes } from "react-router-config";

import { createGenerateClassName } from "material-ui-next/styles";
import { SheetsRegistry } from "react-jss/lib/jss";

import ClientApp from "../client/App";
import clientRoutes from "../client/routes";
import { clearTemplateCaches } from "../client/modules/Template/TemplateActions";
import { setUserAgent } from "../client/modules/UserAgent/UserAgentActions";
import { setOauth2Client } from "../client/modules/Oauth2Client/Oauth2ClientActions";
import googleAnalyticsConfig from "./configs/googleAnalytics";
import { configureStore } from "../client/store";
import { calculateResponsiveStateByUserAgent } from "../client/modules/Browser/BrowserActions";
import { fetchComponentData } from "./util/fetchData";
import appConfig from "./configs";
import Oauth2Client from "./models/oauth2Client";

export function renderHead(...other) {
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
        <link href="https://fonts.googleapis.com/css?family=Roboto:300,300i,400,400i,500,500i,700,700i" rel="stylesheet">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet">
        ${
          process.env.NODE_ENV === "production" && assetsManifest["/app.css"]
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
        ${other.join()}
      </head>
  `;
}

function safeStringify(state) {
  // use serializeJavascript for prevent XSS attack, don't remove it.
  const safeInitState = serializeJavascript(state, {
    isJSON: true
  });
  return safeInitState;
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
  const initialStateString =
    typeof initialState === "string"
      ? initialState
      : safeStringify(initialState);
  return `
        <script>
          window.__INITIAL_STATE__ = ${initialStateString};
          ${
            process.env.NODE_ENV === "production"
              ? `//<![CDATA[
          window.webpackManifest = ${safeStringify(chunkManifest)};
          //]]>`
              : ""
          }
        </script>
        <script src='${
          process.env.NODE_ENV === "production"
            ? assetsManifest["/vendor.js"]
            : "/vendor.js"
        }'></script>
        <script src='${
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
export async function renderClientRoute(req, res, next) {
  const store = configureStore();

  // get userAgent from server side.
  const userAgent = req.headers["user-agent"];
  store.dispatch(setUserAgent(userAgent));

  // get oauth2Client for current render client.
  const oauth2Client = await Oauth2Client.getAppClient();
  store.dispatch(setOauth2Client(oauth2Client, "app"));

  // guess browser size by userAgent.
  store.dispatch(calculateResponsiveStateByUserAgent(userAgent));

  const { clientID: facebookClientID } = appConfig.oauth2.facebook;
  if (facebookClientID) {
    store.dispatch(setOauth2Client({ facebookClientID }, "facebook"));
  }

  const branch = matchRoutes(clientRoutes, req.path);
  // Compone.getInitialAction for fetch and update store data.
  await Promise.all(
    branch.map(routerProps => {
      const { route, match } = routerProps;
      const { component } = route;
      // inject query for location
      // because react-router-config not parse query by default
      // so take req.query.
      const location = {
        pathname: match.path,
        // may be use req.query convert to search string?
        search: req._parsedOriginalUrl.search,
        query: req.query
      };
      routerProps.location = location; // eslint-disable-line
      return fetchComponentData({
        store,
        component,
        routerProps
      });
    })
  );

  try {
    // FIXME
    // slate editor keyGenerator may be have race condition if use renderToNodeStream
    let n = 0;
    setKeyGenerator(() => {
      n += 1;
      return `${n}`;
    });
    // TODO
    // locale by request lang.
    moment.locale(store.getState().intl.locale);
    // TODO
    // refactor it.
    if (appConfig.react.domOutput === "stream") {
      res.set("Content-Type", "text/html").status(200);
      res.write("<!doctype html><html>");
      res.write(renderHead());
      res.write("<body>");
      res.write('<div id="root">');
      const sheetsRegistry = new SheetsRegistry();
      const generateClassName = createGenerateClassName();
      const stream = renderToNodeStream(
        <ClientApp
          store={store}
          location={req.url}
          JssProviderProps={{ sheetsRegistry, generateClassName }}
        />
      );
      stream.on("error", error => {
        console.warn(error);
      });
      stream.pipe(res, { end: false });
      stream.on("end", () => {
        res.write("</div>");
        const css = sheetsRegistry.toString();
        res.write(`<style id="jss-server-side">${css}</style>`);
        // don't send template caches.
        store.dispatch(clearTemplateCaches());
        // send state
        const stateString = safeStringify(store.getState());
        res.write(renderScripts(stateString));
        res.write("</body></html>");
        res.end();
      });
    } else {
      res.set("Content-Type", "text/html").status(200);
      res.write("<!doctype html><html>");
      res.write(renderHead());
      res.write("<body>");
      const sheetsRegistry = new SheetsRegistry();
      const generateClassName = createGenerateClassName();
      const body = renderToString(
        <ClientApp
          store={store}
          location={req.url}
          JssProviderProps={{ sheetsRegistry, generateClassName }}
        />
      );
      const css = sheetsRegistry.toString();
      res.write(`<style id="jss-server-side">${css}</style>`);
      res.write('<div id="root">');
      res.write(body);
      res.write("</div>");
      // don't send template caches.
      store.dispatch(clearTemplateCaches());
      // send state
      const stateString = safeStringify(store.getState());
      res.write(renderScripts(stateString));
      res.write("</body></html>");
      res.end();
    }
    return Promise.resolve(null);
  } catch (_err) {
    next(_err);
    return Promise.resolve(null);
  }
}

const router = new Router();

router.get("*", renderClientRoute);

export default router;
