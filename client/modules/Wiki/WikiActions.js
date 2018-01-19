import qs from "qs";
import callApi from "../../util/apiCaller";
import { defaultRequestCatchHandler } from "../Error/ErrorActions";

// Export Constants
export const ADD_WIKI = "ADD_WIKI";
export const ADD_WIKIS = "ADD_WIKIS";
export const SET_UI_WIKI_FORM = "SET_UI_WIKI_FORM";

// Export Actions
export function addWiki(wiki) {
  return { type: ADD_WIKI, wiki };
}

export function addWikis(wikis) {
  return { type: ADD_WIKIS, wikis };
}

export function setUIWikiForm(form) {
  return { type: SET_UI_WIKI_FORM, form };
}

export function fetchWiki(id, rootWikiId = null) {
  return dispatch => {
    const uri = rootWikiId
      ? `rootWikis/${rootWikiId}/wikis/${encodeURIComponent(id)}`
      : `wikis/${id}`;
    return callApi(uri)
      .then(res => {
        dispatch(addWiki(res.wiki));
        return res.wiki;
      })
      .catch(err => defaultRequestCatchHandler(dispatch, err));
  };
}

export function fetchWikiByRouterProps(routerProps) {
  const { wikiId, wikiName, rootWikiId } = routerProps.params;
  if (rootWikiId) {
    return fetchWiki(wikiName, rootWikiId);
  } else {
    return fetchWiki(wikiId);
  }
}

export function fetchWikis(
  rootWikiId,
  { page = 1, limit = 10, sort = "-updatedAt", rootWikiGroupTree = "all" } = {},
  reqConfig = {}
) {
  rootWikiGroupTree = rootWikiGroupTree.toJSON
    ? rootWikiGroupTree.toJSON()
    : rootWikiGroupTree;
  const query = qs.stringify({ page, limit, sort, rootWikiGroupTree });
  const url = `rootWikis/${rootWikiId}/wikis?${query}`;
  return dispatch => {
    return callApi(url, "get", null, reqConfig)
      .then(res => {
        dispatch(addWikis(res.wikis));
        return res.wikis;
      })
      .catch(err => defaultRequestCatchHandler(dispatch, err));
  };
}

export function addWikiRequest(wiki) {
  return dispatch => {
    return callApi("wikis", "post", { wiki })
      .then(res => {
        dispatch(addWiki(res.wiki));
        return res.wiki;
      })
      .catch(err => defaultRequestCatchHandler(dispatch, err));
  };
}
