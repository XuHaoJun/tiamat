async function loadBootstrap() {
  if (typeof window !== 'undefined') {
    const ps = [];
    if (!window.jQuery) {
      const p = import(/* webpackChunkName: "jquery" */ 'jquery').then(jquery => {
        window.jQuery = jquery;
        window.$ = jquery;
      });
      ps.push(p);
    }
    if (!window.Popper) {
      const p = import(/* webpackChunkName: "popper.js" */ 'popper.js').then(popper => {
        window.Popper = popper.default;
      });
      ps.push(p);
    }
    await Promise.all(ps);
    await Promise.all([
      import(/* webpackChunkName: "bootstrap.min.js" */ 'bootstrap/dist/js/bootstrap.min.js'),
      import(/* webpackChunkName: "bootstrap.min.css" */ 'bootstrap/dist/css/bootstrap.min.css'),
    ]);
    await Promise.all([
      import(/* webpackChunkName: "material.min.js" */ 'bootstrap-material-design/dist/js/material.min.js'),
      import(/* webpackChunkName: "ripples.min.js" */ 'bootstrap-material-design/dist/js/ripples.min.js'),
      import(/* webpackChunkName: "bootstrap-material-design.min.css" */ 'bootstrap-material-design/dist/css/bootstrap-material-design.min.css'),
      import(/* webpackChunkName: "ripples.min.css" */ 'bootstrap-material-design/dist/css/ripples.min.css'),
    ]);
  }
  return Promise.resolve(null);
}

export default loadBootstrap;
