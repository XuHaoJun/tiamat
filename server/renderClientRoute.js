/* eslint-disable react/no-danger */

import { Router } from 'express';
import React from 'react';
import Helmet from 'react-helmet';
import { KeyUtils as SlateKeyUtils } from 'slate';
import serializeJavascript from 'serialize-javascript';
import moment from 'moment';
import { renderToString, renderToStaticNodeStream } from 'react-dom/server';
import { matchRoutes } from 'react-router-config';

import { createGenerateClassName } from '@material-ui/core/styles';
import { SheetsRegistry } from 'react-jss';

import ClientApp from '../client/App';
import clientRoutes from '../client/routes';
import { createMemoryHistory } from '../client/modules/History/utils/createHistory';
import { setRawHistory } from '../client/modules/History/HistoryActions';
import { createInitialState as createHistoryInitialState } from '../client/modules/History/HistoryReducer';
import { setUserAgent } from '../client/modules/UserAgent/UserAgentActions';
import { setOauth2Client } from '../client/modules/Oauth2Client/Oauth2ClientActions';
import googleAnalyticsConfig from './configs/googleAnalytics';
import { configureStore } from '../client/store';
import { calculateResponsiveStateByUserAgent } from '../client/modules/Browser/BrowserActions';

import { fetchComponentData } from './util/fetchData';

import appConfig from './configs';

import Oauth2Client from './models/oauth2Client';

let _assetsManifestCache;
function getAssetsManifest() {
  if (!_assetsManifestCache) {
    _assetsManifestCache = process.env.webpackAssets && JSON.parse(process.env.webpackAssets);
  }
  return _assetsManifestCache;
}

let _chunkManifestCache;
function getChunkManifest() {
  if (!_chunkManifestCache) {
    _chunkManifestCache =
      process.env.webpackChunkAssets && JSON.parse(process.env.webpackChunkAssets);
  }
  return _chunkManifestCache;
}

const ServiceWorkerScript = () => {
  const body = `(function() {
    if (
      location &&
      location.protocol === "https:" &&
      navigator &&
      navigator.serviceWorker
    ) {
      navigator.serviceWorker.register("/precache-service-worker.js");
    }
  })();`;
  return <script dangerouslySetInnerHTML={{ __html: body }} />;
};

const ForceHttpsScript = () => {
  const body = `(function() {
    if (location && location.protocol === "http:") {
      var localHostnameRegexp = new RegExp(
        "(^127.)|(^192.168.)|(^10.)|(^172.1[6-9].)|(^172.2[0-9].)|(^172.3[0-1].)|(^::1$)|(^[fF][cCdD])"
      );
      var isLocal =
        location.hostname === "localhost" ||
        localHostnameRegexp.test(location.hostname);
      if (!isLocal) {
        location.href = location.href.replace(/^http:/, "https:");
      }
    }
  })();`;
  return <script dangerouslySetInnerHTML={{ __html: body }} />;
};

function safeStringify(json) {
  // use serializeJavascript for prevent XSS attack, don't remove it.
  const string = serializeJavascript(json, {
    isJSON: true,
  });
  return string;
}

const WebpackManifestScript = () => {
  const chunkManifest = getChunkManifest();
  const body = `//<![CDATA[
          window.webpackManifest = ${safeStringify(chunkManifest)};
          //]]>`;
  return <script dangerouslySetInnerHTML={{ __html: body }} />;
};

const ClientStateScript = ({ state }) => {
  const stateString = safeStringify(state);
  const body = `window.__INITIAL_STATE__ = ${stateString}`;
  return <script dangerouslySetInnerHTML={{ __html: body }} />;
};

const ClientInitialScripts = ({ state }) => {
  const assetsManifest = getAssetsManifest();
  const vendorSrc =
    process.env.NODE_ENV === 'production' ? assetsManifest['/vendor.js'] : '/vendor.js';
  const appSrc = process.env.NODE_ENV === 'production' ? assetsManifest['/app.js'] : '/app.js';
  return (
    <React.Fragment>
      <script src={vendorSrc} />
      <ClientStateScript state={state} />
      <script async src={appSrc} />
    </React.Fragment>
  );
};

async function createStoreByRequest(req) {
  // use req.url for initial history.
  const rawHistory = createMemoryHistory({
    initialEntries: [decodeURI(req.url)],
  });

  const store = configureStore({
    history: createHistoryInitialState({ rawHistory }),
  });

  store.dispatch(setRawHistory(rawHistory));

  // get userAgent from server side.
  const userAgent = req.headers['user-agent'];
  store.dispatch(setUserAgent(userAgent));

  // get oauth2Client for current render client.
  const oauth2Client = await Oauth2Client.getAppClient();
  store.dispatch(setOauth2Client(oauth2Client, 'app'));

  // guess browser size by userAgent.
  store.dispatch(calculateResponsiveStateByUserAgent(userAgent));

  const { clientID: facebookClientID } = appConfig.oauth2.facebook;
  if (facebookClientID) {
    store.dispatch(setOauth2Client({ facebookClientID }, 'facebook'));
  }

  const branch = matchRoutes(clientRoutes, decodeURI(req.path));
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
        query: req.query,
      };
      routerProps.location = location; // eslint-disable-line
      return fetchComponentData({
        store,
        component,
        routerProps,
      });
    })
  );

  return store;
}

const Head = ({ jssSheets, helmet }) => {
  const assetsManifest = getAssetsManifest();
  return (
    <head>
      <meta charSet="utf-8" />
      <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
      <link href="/appManifest.json" rel="manifest" />
      {helmet.title.toComponent()}
      {helmet.meta.toComponent()}
      {helmet.link.toComponent()}
      {process.env.NODE_ENV === 'production' && assetsManifest['/app.css'] ? (
        <link rel="stylesheet" href={assetsManifest['/app.css']} />
      ) : null}
      <style id="jss-server-side" dangerouslySetInnerHTML={{ __html: jssSheets }} />
      {process.env.NODE_ENV === 'production' &&
      googleAnalyticsConfig['google-site-verification'] ? (
        <meta
          name="google-site-verification"
          content={googleAnalyticsConfig['google-site-verification']}
        />
      ) : null}
      {process.env.NODE_ENV === 'production' ? (
        <React.Fragment>
          <ServiceWorkerScript />
          <ForceHttpsScript />
        </React.Fragment>
      ) : null}
      <WebpackManifestScript />
    </head>
  );
};

export async function renderClientRoute(req, res) {
  const store = await createStoreByRequest(req);

  // TODO
  // locale by request lang.
  moment.locale(store.getState().intl.locale);

  // TODO
  // Slate editor init.
  // fix if solve https://github.com/ianstormtaylor/slate/issues/1408.
  let n = 0;
  SlateKeyUtils.setGenerator(() => {
    n += 1;
    return `${n}`;
  });

  const sheetsRegistry = new SheetsRegistry();
  const generateClassName = createGenerateClassName();
  const clientAppEle = (
    <ClientApp store={store} JssProviderProps={{ registry: sheetsRegistry, generateClassName }} />
  );
  const clientAppHTML = renderToString(clientAppEle);

  const helmet = Helmet.renderStatic();
  const htmlAttrs = helmet.htmlAttributes.toComponent();
  const bodyAttrs = helmet.bodyAttributes.toComponent();

  // drop side-effect state.
  const { routing, history, template, ...pureState } = store.getState();

  const jssSheets = sheetsRegistry.toString();

  const htmlEle = (
    <html lang={req.lang} {...htmlAttrs}>
      <Head jssSheets={jssSheets} helmet={helmet} />
      <body {...bodyAttrs}>
        <div id="root" dangerouslySetInnerHTML={{ __html: clientAppHTML }} />
        <ClientInitialScripts state={pureState} />
      </body>
    </html>
  );
  const htmlStream = renderToStaticNodeStream(htmlEle);

  res.set('Content-Type', 'text/html').status(200);
  res.write('<!doctype html>');
  htmlStream.pipe(res);

  return new Promise((resolve, reject) => {
    htmlStream.on('end', () => {
      resolve();
    });
    htmlStream.on('error', err => {
      reject(err);
    });
  });
}

const router = new Router();

const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('*', asyncMiddleware(renderClientRoute));

export default router;
