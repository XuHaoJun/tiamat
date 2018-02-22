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

export function fetchWiki(idOrName, rootWikiId = null) {
  return dispatch => {
    const uri = rootWikiId
      ? `rootWikis/${rootWikiId}/wikis/${encodeURIComponent(idOrName)}`
      : `wikis/${idOrName}`;
    return callApi(uri)
      .then(data => {
        dispatch(addWiki(data.wiki));
        return data.wiki;
      })
      .catch(err => defaultRequestCatchHandler(dispatch, err));
  };
}

export function fetchWikiByRouterProps(routerProps) {
  const { wikiId, wikiName, rootWikiId } = routerProps.match.params;
  if (rootWikiId) {
    return fetchWiki(wikiName, rootWikiId);
  } else {
    return fetchWiki(wikiId);
  }
}

export function fetchWikis(
  rootWikiId,
  {
    page = 1,
    limit = 10,
    sort = "-updatedAt",
    rootWikiGroupTree: rootWikiGroupTreeInput = "all"
  } = {},
  reqConfig = {}
) {
  const rootWikiGroupTree = rootWikiGroupTreeInput.toJSON
    ? rootWikiGroupTreeInput.toJSON()
    : rootWikiGroupTreeInput;
  const query = qs.stringify({ page, limit, sort, rootWikiGroupTree });
  const url = `rootWikis/${rootWikiId}/wikis?${query}`;
  return dispatch => {
    return callApi(url, "get", null, reqConfig)
      .then(data => {
        dispatch(addWikis(data.wikis));
        return data.wikis;
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
