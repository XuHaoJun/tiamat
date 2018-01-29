/*
Utility function to fetch required data for component to render in server side.
This was inspired from https://github.com/caljrimmer/isomorphic-redux-app/blob/73e6e7d43ccd41e2eb557a70be79cebc494ee54b/src/common/api/fetchComponentDataBeforeRender.js
*/
import { sequence as pipe } from "./promiseUtils";

function defaultGetNeed(component) {
  if (!component) {
    return [];
  } else {
    const names = ["getInitialAction", "getInitialActions", "need"];
    for (const name of names) {
      const need = component[name];
      if (need) {
        if (Array.isArray(need)) {
          return need.map(_need => {
            return { name, callback: _need, component };
          });
        } else if (typeof need === "function") {
          return [{ name, callback: need, component }];
        } else if (typeof need === "object") {
          return Object.values(need).map(_need => {
            return { name, callback: _need, component };
          });
        }
      }
    }
    return [];
  }
}

export function fetchComponentData(
  {
    component,
    props,
    components,
    store,
    dispatch,
    location,

    params,
    query,
    routes,
    routerProps,
    serverRequest
  },
  { promiseAggregation } = { promiseAggregation: pipe }
) {
  const _oriComponents = Array.isArray(components) ? components : [component];
  const ps = _oriComponents.map(c => {
    if (c.load) {
      return c.load();
    } else if (c.preload) {
      return c.preload().then(m => m.default);
    }
    return c;
  });
  return Promise.all(ps)
    .then(_components => {
      const needs = _components.reduce((prev, current) => {
        return (defaultGetNeed(current) || [])
          .concat(
            (current.WrappedComponent &&
            defaultGetNeed(current.WrappedComponent) !== defaultGetNeed(current)
              ? defaultGetNeed(current.WrappedComponent)
              : []) || []
          )
          .concat(prev);
      }, []);
      return needs;
    })
    .then(needs => {
      return promiseAggregation(needs, payload => {
        const { name, callback } = payload;
        const _dispatch = dispatch || (store ? store.dispatch : null);
        if (name === "getInitialActions" || name === "getInitialAction") {
          const action = callback({
            params,
            dispatch,
            location,
            state: store ? store.getState() : {},
            query,
            routes,
            routerProps,
            req: serverRequest,
            props: props || payload.component.defaultProps || {}
          });
          return _dispatch(action);
        } else {
          return store.dispatch(
            callback(params, store.getState(), query, routes, routerProps)
          );
        }
      });
    });
}

export default fetchComponentData;
