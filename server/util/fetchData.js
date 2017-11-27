/*
Utility function to fetch required data for component to render in server side.
This was inspired from https://github.com/caljrimmer/isomorphic-redux-app/blob/73e6e7d43ccd41e2eb557a70be79cebc494ee54b/src/common/api/fetchComponentDataBeforeRender.js
*/
import { sequence } from "./promiseUtils";

export function fetchComponentData(
  store,
  _components,
  params,
  query,
  routes,
  routerProps
) {
  const ps = _components.map(c => {
    if (c.load) {
      return c.load();
    } else if (c.preload) {
      return c.preload().then(m => m.default);
    }
    return c;
  });
  return Promise.all(ps)
    .then(components => {
      const needs = components.reduce((prev, current) => {
        return (current.need || [])
          .concat(
            (current.WrappedComponent &&
            current.WrappedComponent.need !== current.need
              ? current.WrappedComponent.need
              : []) || []
          )
          .concat(prev);
      }, []);
      return needs;
    })
    .then(needs => {
      return sequence(needs, need =>
        store.dispatch(
          need(params, store.getState(), query, routes, routerProps)
        )
      );
    });
}

export default fetchComponentData;
