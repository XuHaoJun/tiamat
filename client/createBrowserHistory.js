import createHistory from "history/createBrowserHistory";
import ReactGA from "react-ga";
import qs from "qs";

function logPageView(location) {
  if (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "production" &&
    process.env.CLIENT
  ) {
    ReactGA.set({ page: location.pathname });
    ReactGA.pageview(location.pathname);
  }
}

export function injectQuery(h) {
  const { location } = h;
  if (!location.query) {
    const { search } = location;
    let query;
    if (typeof search === "string" && search[0] === "?" && search.length > 1) {
      query = qs.parse(search.substr(1), { depth: 5 });
    } else {
      query = {};
    }
    location.query = query;
  }
}

function createBrowserHistory() {
  const history = process.browser ? createHistory() : null;
  if (history) {
    history.listen(location => {
      logPageView(location);
    });
  }
  return history;
}

const defaultBrowserHistory = createBrowserHistory();

export { createBrowserHistory as default, defaultBrowserHistory };
