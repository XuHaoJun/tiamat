import createHistory from "history/createBrowserHistory";
import qs from "qs";

function logPageView(location) {
  if (process.browser && process.env.NODE_ENV === "production") {
    import(/* webpackChunkName: "react-ga" */ "react-ga").then(module => {
      const ReactGA = module.default;
      ReactGA.set({ page: location.pathname });
      ReactGA.pageview(location.pathname);
    });
  }
}

export function injectQuery(location) {
  if (!location.query) {
    const { search } = location;
    let query;
    if (typeof search === "string" && search[0] === "?" && search.length > 1) {
      query = qs.parse(search.substr(1), { depth: 5 });
    } else {
      query = {};
    }
    location.query = query; // eslint-disable-line
  }
}

function createBrowserHistory() {
  const history = process.browser ? createHistory() : null;
  if (history) {
    injectQuery(history.location);
    history.listen(location => {
      injectQuery(location);
      logPageView(location);
    });
  }
  return history;
}

const defaultBrowserHistory = createBrowserHistory();

export { createBrowserHistory as default, defaultBrowserHistory };
