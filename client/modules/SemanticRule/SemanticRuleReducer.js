import { fromJS, Set, List } from 'immutable';
import defaultSameIdElesMax from '../../util/defaultSameIdElesMax';
import { ADD_SEMANTIC_RULES } from './SemanticRuleActions';

// Initial State
const initialState = fromJS({ data: Set() });

const SemanticRuleReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_SEMANTIC_RULES: {
      if (!action.semanticRules) {
        return state;
      }
      const newSemanticRules = fromJS(action.semanticRules).toSet();
      const data = state
        .get('data')
        .union(newSemanticRules)
        .groupBy(ele => ele.get('_id'))
        .map(eles => defaultSameIdElesMax(eles))
        .toSet();
      return state.set('data', data);
    }
    default: {
      if (List.isList(state.get('data'))) {
        return state.set('data', state.get('data').toSet());
      }
      return state;
    }
  }
};

/* Selectors */

export const getSemanticRules = state => {
  return state.semanticRules.get('data');
};

export const getSemanticRulesByType = (state, type) => {
  return getSemanticRules(state).filter(ele => ele.get('type') === type);
};

export const getSemanticRulesByRootWikiId = (state, rootWikiId) => {
  return getSemanticRules(state).filter(ele => ele.get('rootWikiId') === rootWikiId);
};

// Export Reducer
export default SemanticRuleReducer;
