import getModuleId from './getModuleId';
import { fetchTemplate } from '../TemplateActions';
import { fromJS, Map, Set, List } from 'immutable';

function __require(__rootWiki, __caches, preModuleId) {
  if (preModuleId.substring(0, 2) === '~/') {
    const matches = /^~\/(.+)/.exec(preModuleId);
    const name = matches[1];
    const moduleId = getModuleId({ rootWiki: __rootWiki, name });
    const m = __caches.get(moduleId);
    if (!m) {
      throw new Error('Not found module');
    } else {
      return m;
    }
  } else {
    throw new Error('Unknown import path');
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

export const SKIP = '@@template:SKIP';

export const globalCaches = Map().asMutable();

// compile template to module.
// TODO
// 1. use load instead of dispatch.
// 2. add visted for prevent circle reference.
async function compile(
  template,
  {
    caches,
    dispatch,
    maxDepth,
    enableEvalModule,
    forceBabel,
    enableValidate,
    enableSaveChildren,
  } = {
    caches: globalCaches,
    dispatch: null,
    maxDepth: 20,
    enableEvalModule: true,
    forceBabel: true,
    enableValidate: true,
    enableSaveChildren: true,
  },
  { depth, visted } = {
    depth: 0,
    visted: Set(),
  }
) {
  if (!dispatch) {
    throw new Error('compile require dispatch');
  }
  if (depth > maxDepth) {
    throw new Error(`compile reached maxDepth: ${maxDepth}`);
  }
  const { name, code } = template;
  if (!name) {
    throw new Error('template require name.');
  } else if (!code) {
    throw new Error('template require code.');
  }
  const updatedAt = new Date(template.get('updatedAt')) || Date.now();
  const moduleId = getModuleId(template);
  const cachedModule = caches.get(moduleId);
  if (cachedModule) {
    if (updatedAt <= cachedModule.updatedAt) {
      return cachedModule;
    }
  }
  if (visted.includes(moduleId)) {
    return SKIP;
  }
  const mutCaches = caches.asMutable();
  const esprimaP = import(/* webpackChunkName: "esprima" */ 'esprima');
  const estraverseP = import(/* webpackChunkName: "estraverse-fb" */ 'estraverse-fb');
  const [esprima, estraverse] = await Promise.all([esprimaP, estraverseP]);
  const ast = esprima.parseScript(code, {
    jsx: true,
    tokens: true,
    tolerant: true,
    sourceType: 'module',
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
        case 'ImportDeclaration':
          importModuelNames.push(node.source.value);
          break;
        default:
      }
    },
  });
  // TODO
  // change data structure to
  // { targetKind: "rootWiki", rootWiki: rootWikiId, name: templateName }
  const childrenIds = importModuelNames.map(mname => {
    if (mname.substring(0, 2) === '~/') {
      const { rootWiki } = template;
      const matches = /^~\/(.+)/.exec(mname);
      const templateName = matches[1] || '';
      return `/rootWikis/${rootWiki}/${templateName}`;
    } else {
      throw new Error('Unknown import path');
    }
  });
  // load
  const templateRequests = childrenIds.map(id => {
    return dispatch(fetchTemplate(id)).then(_jsonTemplate => {
      return fromJS(_jsonTemplate);
    });
  });
  // TODO
  // try catch request error.
  const importTemplates = await Promise.all(templateRequests);
  const children = await Promise.all(
    importTemplates.map(importTemplate => {
      return compile(
        importTemplate,
        {
          caches: mutCaches,
          dispatch,
          maxDepth,
          enableEvalModule,
          forceBabel,
          enableValidate,
          enableSaveChildren,
        },
        { depth: depth + 1, visted: visted.add(moduleId) }
      );
    })
  )
    .then(modules => {
      return modules.filter(m => m !== SKIP);
    })
    .then(modules => {
      return modules.reduce((localChildren, r) => {
        const id = r.get('id');
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
    const Babel = await import(/* webpackChunkName: "babel-standalone" */ 'babel-standalone');
    output = Babel.transform(code, { presets: ['es2015', 'react'] }).code;
  }
  const React = await import('react');
  let instance;
  if (enableEvalModule) {
    instance = evalWithContext.call(null, output, { React }, template.get('rootWiki'), mutCaches);
  } else {
    instance = null;
  }
  const nextModule = Map({
    instance,
    caches: mutCaches,
    updatedAt,
    id: moduleId,
    children,
    code,
    es5Code: output,
    metaData: Map({
      template,
    }),
  });
  // TODO
  // move before eval
  const oldModule = mutCaches.get(moduleId);
  if (oldModule) {
    const oldUpdatedAt = oldModule.get('updatedAt');
    const nextUpdatedAt = nextModule.get('updatedAt');
    if (nextUpdatedAt > oldUpdatedAt) {
      mutCaches.set(moduleId, nextModule);
    } else {
      return oldModule;
    }
  }
  return nextModule;
}

export default compile;
