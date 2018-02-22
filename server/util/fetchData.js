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
          return need;
        } else if (typeof need === "function") {
          return [need];
        } else if (typeof need === "object") {
          return Object.values(need).map(_need => {
            return _need;
          });
        }
      }
    }
    return [];
  }
}

export function fetchComponentData(
  { component, store, dispatch, routerProps },
  { promiseAggregation } = { promiseAggregation: pipe }
) {
  const _oriComponents = [component];
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
    .then(needs =>
      needs.filter((value, index, self) => self.indexOf(value) === index)
    )
    .then(needs => {
      return promiseAggregation(needs, callback => {
        const _dispatch = dispatch || (store ? store.dispatch : null);
        const action = callback({
          dispatch,
          routerProps,
          state: store ? store.getState() : {}
        });
        return _dispatch(action);
      });
    });
}

export default fetchComponentData;
