import { fromJS, Set, List } from "immutable";
import defaultSameIdElesMax from "../../util/defaultSameIdElesMax";
import { ADD_ROOT_WIKI } from "./RootWikiActions";

// Initial State
const initialState = fromJS({
  ui: {
    form: {
      name: "",
      content: null
    }
  },
  data: Set(),
  wikiNames: {}
});

const RootWikiReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_ROOT_WIKI:
      if (!action.rootWiki) {
        return state;
      }
      const newRootWikis = Set([fromJS(action.rootWiki)]);
      const data = state
        .get("data")
        .union(newRootWikis)
        .groupBy(ele => ele.get("_id"))
        .map(sameIdEles => defaultSameIdElesMax(sameIdEles))
        .toSet();
      return state.set("data", data);
    default:
      if (List.isList(state.get("data"))) {
        return state.set("data", state.get("data").toSet());
      }
      return state;
  }
};

/* Selectors */

// Get all posts
export const getUI = state => state.rootWikis.get("ui");

export const getRootWiki = (state, _id) =>
  state.rootWikis.get("data").find(v => v.get("_id") === _id);

export const getRootWikiById = getRootWiki;

// Export Reducer
export default RootWikiReducer;
