import callApi from '../../util/apiCaller';
import qs from 'qs';
import {addError} from '../Error/ErrorActions';

// Export Constants
export const ADD_SEMANTIC_RULES = 'ADD_SEMANTIC_RULES';

// Export Actions
export function addSemanticRules(semanticRules) {
  return {type: ADD_SEMANTIC_RULES, semanticRules};
}

// export const defaultScope = [{type: 'wiki', rootWikiId: '?'}];

export function fetchSemanticRules(scope = '') {
  const query = qs.stringify({scope});
  return (dispatch) => {
    return callApi(`semanticRules?${query}`).then((res) => {
      dispatch(addSemanticRules(res.semanticRules));
      return res.semanticRules;
    }).catch((err) => {
      return Promise
        .resolve(dispatch(addError(err.response.data)))
        .then(() => {
          return Promise.reject(err);
        });
    });
  };
}
