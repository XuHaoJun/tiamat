import { fromJS, Set, is, Record } from "immutable";
import defaultSameIdElesMax from "../../util/defaultSameIdElesMax";
import { ADD_WIKI, ADD_WIKIS, SET_UI_WIKI_FORM } from "./WikiActions";

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
  updatedAt: null
};

export class Wiki extends Record(WIKI_RECORD_DEFAULT) {
  constructor(json = {}) {
    const record = super({
      ...json,
      content: fromJS(json.content),
      data: fromJS(json.data),
      rootWikiGroupTree: fromJS(json.rootWikiGroupTree),
      tags: new Set(json.tags),
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt)
    });
    return record;
  }
}

const WIKI_STATE_RECORD_DEFAULT = {
  ui: fromJS({
    form: {
      type: "",
      content: null
    }
  }),
  data: new Set()
};

export class WikiState extends Record(WIKI_STATE_RECORD_DEFAULT) {
  constructor({ ui, data = [] } = {}) {
    const record = super({
      ui: fromJS(ui),
      data: new Set(data.map(d => new Wiki(d)))
    });
    return record;
  }
}

// Initial State
const initialState = new WikiState();

const WikiReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_WIKI:
    case ADD_WIKIS:
      const newWikis = action.wikis
        ? new Set(action.wikis.map(d => new Wiki(d)))
        : new Set([new Wiki(action.wiki)]);
      const unionData = state.get("data").union(newWikis);
      const nextData = !is(unionData, state.data)
        ? unionData
            .groupBy(ele => ele.get("_id"))
            .map(sameIdEles => defaultSameIdElesMax(sameIdEles))
            .toSet()
        : unionData;
      return state.set("data", nextData);

    case SET_UI_WIKI_FORM:
      return state.setIn(["ui", "form"], fromJS(action.form));

    default:
      return state;
  }
};

/* Selectors */

// Get all posts
export const getUI = state => {
  return state.wikis.get("ui");
};

export const getWiki = (state, _id, rootWikiId = null) => {
  if (rootWikiId) {
    const name = _id;
    return state.wikis
      .get("data")
      .find(v => v.get("name") === name && v.get("rootWiki") === rootWikiId);
  } else {
    return state.wikis.get("data").find(v => v.get("_id") === _id);
  }
};

export function getWikiByRouterProps(state, routerProps) {
  const { wikiId, wikiName } = routerProps.match.params;
  const { rootWikiId } = routerProps.match.params;
  const wiki = rootWikiId
    ? getWiki(state, wikiName, rootWikiId)
    : getWiki(state, wikiId);
  return wiki;
}

export const getWikisByRootWikiId = (state, rootWikiId) => {
  return state.wikis.get("data").filter(v => v.get("rootWiki") === rootWikiId);
};

// Export Reducer
export default WikiReducer;
