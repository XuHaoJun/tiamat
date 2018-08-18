import { fromJS, Set, is, Record } from 'immutable';
import defaultSameIdElesMax from '../../util/defaultSameIdElesMax';
import { ADD_WIKI, ADD_WIKIS, SET_UI_WIKI_FORM } from './WikiActions';

const WIKI_RECORD_DEFAULT = {
  _id: null,
  name: null,
  content: null,
  isNickName: false,
  rootWiki: null,
  wikiDataForm: null,
  data: null,
  rootWikiGroupTree: null,
  tags: new Set(),
  popularityCounter: 0,
  createdAt: null,
  updatedAt: null,
};

export class Wiki extends Record(WIKI_RECORD_DEFAULT) {
  static fromJS(obj = {}) {
    const record = new Wiki({
      ...obj,
      wikiDataForm: obj.wikiDataForm ? fromJS(obj.wikiDataForm) : null,
      content: obj.content ? fromJS(obj.content) : null,
      data: fromJS(obj.data),
      rootWikiGroupTree: fromJS(obj.rootWikiGroupTree),
      tags: Set(obj.tags),
      createdAt: new Date(obj.createdAt),
      updatedAt: new Date(obj.updatedAt),
    });
    return record;
  }
}

const WIKI_STATE_RECORD_DEFAULT = {
  ui: fromJS({
    form: {
      type: '',
      content: null,
    },
  }),
  data: Set(),
};

export class WikiState extends Record(WIKI_STATE_RECORD_DEFAULT) {
  static fromJS({ ui, data = [] } = {}) {
    const record = new WikiState({
      ui: fromJS(ui),
      data: Set(data.map(Wiki.fromJS)),
    });
    return record;
  }
}

// Initial State
const initialState = WikiState.fromJS();

const WikiReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_WIKI:
    case ADD_WIKIS:
      const newWikis = action.wikis
        ? Set(action.wikis.map(Wiki.fromJS))
        : Set([Wiki.fromJS(action.wiki)]);
      const unionData = state.data.union(newWikis);
      const nextData = !is(unionData, state.data)
        ? unionData
            .groupBy(x => x._id)
            .map(sameIdEles => defaultSameIdElesMax(sameIdEles))
            .toSet()
        : unionData;
      return state.set('data', nextData);

    case SET_UI_WIKI_FORM:
      return state.setIn(['ui', 'form'], fromJS(action.form));

    default:
      return state;
  }
};

export const getUI = state => {
  return state.wikis.ui;
};

export const getWikis = state => state.wikis.data;

export const getWiki = (state, _id, rootWikiId = null) => {
  if (rootWikiId) {
    const name = _id;
    return getWikis(state).find(x => x.name === name && x.rootWiki === rootWikiId);
  } else {
    return getWikis(state).find(x => x._id === _id);
  }
};

export function getWikiByRouterProps(state, routerProps) {
  const { wikiId, wikiName } = routerProps.match.params;
  const { rootWikiId } = routerProps.match.params;
  const wiki = rootWikiId ? getWiki(state, wikiName, rootWikiId) : getWiki(state, wikiId);
  return wiki;
}

export const getWikisByRootWikiId = (state, rootWikiId) => {
  return getWikis(state).filter(x => x.rootWiki === rootWikiId);
};

// Export Reducer
export default WikiReducer;
