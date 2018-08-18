import createBrowserHistoryOri from 'history/createBrowserHistory';
import createMemoryHistoryOri from 'history/createMemoryHistory';
import qs from 'qs';

async function logPageView(location) {
  const ReactGA = await import(/* webpackChunkName: "react-ga" */ 'react-ga');
  ReactGA.set({ page: location.pathname });
  ReactGA.pageview(location.pathname);
}

function injectQuery(location) {
  if (!location.query) {
    const { search } = location;
    let query;
    if (typeof search === 'string' && search[0] === '?' && search.length > 1) {
      query = qs.parse(search.substr(1), { depth: 5 });
    } else {
      query = {};
    }
    location.query = query; // eslint-disable-line
  }
}

function handleChangeLocation(location) {
  injectQuery(location);
  if (process.browser && process.env.NODE_ENV === 'production') {
    logPageView(location);
  }
}

function inject(history) {
  injectQuery(history.location);
  const unlisten = history.listen(handleChangeLocation);
  return unlisten;
}

const defaultOptions = {
  type: 'auto',
  browserHistoryOptions: {},
  memoryHistoryOptions: {
    initialEntries: ['/'],
  },
};

function createHistory(opts = defaultOptions) {
  const options = { ...defaultOptions, ...opts };
  const { type, browserHistoryOptions, memoryHistoryOptions } = options;
  let history;
  if (type === 'auto') {
    history = process.browser
      ? createBrowserHistoryOri(browserHistoryOptions)
      : createMemoryHistoryOri(memoryHistoryOptions);
  } else if (type === 'memory') {
    history = createMemoryHistoryOri(memoryHistoryOptions);
  } else if (type === 'browser') {
    history = createBrowserHistoryOri(browserHistoryOptions);
  } else {
    history = createMemoryHistoryOri(memoryHistoryOptions);
  }
  inject(history);
  return history;
}

function createMemoryHistory(options = {}) {
  return createHistory({ type: 'memory', memoryHistoryOptions: options });
}

export { createHistory as default, createMemoryHistory };
