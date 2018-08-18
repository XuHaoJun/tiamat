import callApi from '../../util/apiCaller';
import { addError } from '../Error/ErrorActions';

// Export Constants
export const ADD_ROOT_WIKI = 'ADD_ROOT_WIKI';

// Export Actions
export function addRootWiki(rootWiki) {
  return { type: ADD_ROOT_WIKI, rootWiki };
}

export function fetchRootWikiById(_id) {
  return dispatch => {
    return callApi(`rootWikis/${_id}`).then(res => {
      dispatch(addRootWiki(res.rootWiki));
    });
  };
}

export function addRootWikiRequest(rootWiki, reqConfig) {
  return dispatch => {
    return callApi('rootWikis', 'post', { rootWiki }, reqConfig)
      .then(res => {
        dispatch(addRootWiki(res.rootWiki));
        return res.rootWiki;
      })
      .catch(err => {
        return Promise.resolve(dispatch(addError(err.response.data))).then(() => {
          return Promise.reject(err);
        });
      });
  };
}
