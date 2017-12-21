import getModuleId from "./getModuleId";
import { fetchTemplate } from "../TemplateActions";
import { fromJS, Map } from "immutable";

function __require(__rootWiki, __caches, preModuleId) {
  if (preModuleId.substring(0, 2) === "~/") {
    const matches = /^~\/(.+)/.exec(preModuleId);
    const name = matches[1];
    const moduleId = getModuleId({ rootWiki: __rootWiki, name });
    const m = __caches.get(moduleId);
    if (!m) {
      throw new Error("Not found module");
    } else {
      return m;
    }
  } else {
    throw new Error("Unknown import path");
  }
}

function __interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function evalWithContext(__code, __context, __rootWiki, __caches) {
  const exports = {};
  const { React } = __context; // eslint-disable-line
  const require = __require.bind(null, __rootWiki, __caches); // eslint-disable-line
  const _interopRequireDefault = __interopRequireDefault; // eslint-disable-line
  const __module = eval(__code); // eslint-disable-line
  return __module;
}

// TODO
// use load instead of dispatch.
async function compile(
  template,
  {
    caches,
    dispatch,
    maxDepth,
    enableEvalModule,
    forceBabel,
    enableValidate
  } = {
    caches: Map(),
    dispatch: null,
    maxDepth: 20,
    enableEvalModule: true,
    forceBabel: true,
    enableValidate: true
  },
  { depth } = { depth: 0 }
) {
  if (!dispatch) {
    throw new Error("compile require dispatch");
  }
  if (depth > maxDepth) {
    throw new Error(`compile reached maxDepth: ${maxDepth}`);
  }
  const mutCaches = caches.asMutable();
  const { name, code } = template;
  if (!name) {
    throw new Error("template require name.");
  } else if (!code) {
    throw new Error("template require code.");
  }
  const moduleId = getModuleId(template);
  const esprimaP = import(/* webpackChunkName: "esprima" */ "esprima");
  const estraverseP = import(/* webpackChunkName: "estraverse-fb" */ "estraverse-fb");
  const [esprima, estraverse] = await Promise.all([esprimaP, estraverseP]);
  const ast = esprima.parseScript(code, {
    jsx: true,
    tokens: true,
    tolerant: true,
    sourceType: "module"
  });
  const { tokens } = ast;
  // TODO
  // split code to getImportModuelNames and validate.
  const importModuelNames = [];
  // const globalVariables = ast.body.map((node) => {
  //   if (node.type === "VariableDeclaration") {
  //   }
  // });
  estraverse.traverse(ast, {
    enter(node) {
      switch (node.type) {
        case "ImportDeclaration":
          importModuelNames.push(node.source.value);
          break;
        default:
      }
    }
  });
  const childrenIds = importModuelNames.map(mname => {
    if (mname.substring(0, 2) === "~/") {
      const { rootWiki } = template;
      const matches = /^~\/(.+)/.exec(name);
      const localName = matches[1] || "";
      return `/rootWikis/${rootWiki}/${localName}`;
    } else {
      throw new Error("Unknown import path");
    }
  });
  // load
  const templateRequests = childrenIds.map(id => {
    const cachedModule = mutCaches.get(id);
    if (cachedModule) {
      return cachedModule;
    } else {
      return dispatch(fetchTemplate(id)).then(_jsonTemplate => {
        return fromJS(_jsonTemplate);
      });
    }
  });
  // TODO
  // try catch request error.
  const importTemplates = await Promise.all(templateRequests);
  const children = await Promise.all(
    importTemplates.map(importTemplate => {
      return compile(
        importTemplate,
        { caches: mutCaches, dispatch, maxDepth },
        { depth: depth + 1 }
      );
    })
  )
    .then(results => {
      // update cache.
      results.forEach(r => {
        const resultId = r.get("id");
        if (resultId) {
          const oldModule = mutCaches.get(r.id);
          if (oldModule) {
            const oldCreatedAt = oldModule.get("createdAt");
            const currentCreatedAt = r.get("createdAt");
            if (currentCreatedAt > oldCreatedAt) {
              mutCaches.set(resultId, r);
            }
          }
        }
      });
      return results;
    })
    .then(results => {
      return results.reduce((localChildren, r) => {
        const id = r.get("id");
        if (id) {
          return localChildren.set(id, r);
        } else {
          return localChildren;
        }
      }, Map());
    });
  const { es5Code } = template;
  let output;
  if (es5Code && !forceBabel) {
    output = es5Code;
  } else {
    const Babel = await import(/* webpackChunkName: "babel-standalone" */ "babel-standalone");
    output = Babel.transform(code, { presets: ["es2015", "react"] }).code;
  }
  const React = await import("react");
  let module;
  if (enableEvalModule) {
    module = evalWithContext.call(
      null,
      output,
      { React },
      template.get("rootWiki"),
      mutCaches
    );
  }
  return fromJS({
    module,
    caches: mutCaches.asImmutable(),
    createdAt: Date.now(),
    id: moduleId,
    children,
    code,
    es5Code: output
  });
}

export default compile;
