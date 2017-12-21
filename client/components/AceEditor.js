import React from "react";
import Loadable from "react-loadable";

const Loading = () => <div>Loading...</div>;

const AceEditor = Loadable({
  loader: () => {
    if (typeof window === "undefined") {
      return Promise.resolve(Loading);
    } else {
      const braceP = import(/* webpackChunkName: "brace" */ "brace");
      return braceP
        .then(() => {
          const braceJsonModeP = import(/* webpackChunkName: "brace/mode/json" */ "brace/mode/json");
          const braceJsxModeP = import(/* webpackChunkName: "brace/mode/jsx" */ "brace/mode/jsx");
          const braceThemeP = import(/* webpackChunkName: "brace/theme/github" */ "brace/theme/github");
          return Promise.all([braceJsonModeP, braceJsxModeP, braceThemeP]);
        })
        .then(() => {
          return import(/* webpackChunkName: "react-ace" */ "react-ace");
        });
    }
  },
  loading: Loading
});

export default AceEditor;
