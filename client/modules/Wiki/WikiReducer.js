import { fromJS, Set, List } from "immutable";
import defaultSameIdElesMax from "../../util/defaultSameIdElesMax";
import { ADD_WIKI, ADD_WIKIS, SET_UI_WIKI_FORM } from "./WikiActions";

// Initial State
const initialState = fromJS({
  ui: {
    form: {
      type: "",
      content: null
    }
  },
  data: Set()
});

const WikiReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_WIKI:
    case ADD_WIKIS:
      if (!action.wiki && !action.wikis) {
        return state;
      }
      const newWikis = action.wikis
        ? fromJS(action.wikis).toSet()
        : Set([fromJS(action.wiki)]);
      const data = state
        .get("data")
        .union(newWikis)
        .groupBy(ele => ele.get("_id"))
        .map(sameIdEles => defaultSameIdElesMax(sameIdEles))
        .toSet();
      return state.set("data", data);
    case SET_UI_WIKI_FORM:
      return state.setIn(["ui", "form"], fromJS(action.form));
    default:
      if (List.isList(state.get("data"))) {
        return state.set("data", state.get("data").toSet());
      }
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
