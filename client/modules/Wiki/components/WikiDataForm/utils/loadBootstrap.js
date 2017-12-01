function loadBootstrap() {
  if (typeof window !== "undefined") {
    const ps = [];
    if (!window.jQuery) {
      const p = import(/* webpackChunkName: "jquery" */ "jquery").then(
        jquery => {
          window.jQuery = jquery;
        }
      );
      ps.push(p);
    }
    if (!window.Popper) {
      const p = import(/* webpackChunkName: "popper.js" */ "popper.js").then(
        popper => {
          window.Popper = popper.default;
        }
      );
      ps.push(p);
    }
    return Promise.all(ps)
      .then(() => {
        return Promise.all([
          import(/* webpackChunkName: "bootstrap" */ "bootstrap"),
          import(/* webpackChunkName: "bootstrap.min.css" */ "bootstrap/dist/css/bootstrap.min.css")
        ]);
      })
      .then(result => {
        const [bootstrap, bootstrapMinCss] = result;
        return { bootstrap, bootstrapMinCss };
      });
  }
  return Promise.resolve(null);
}

export default loadBootstrap;
