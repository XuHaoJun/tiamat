import {
  ADD_TEMPLATE,
  ADD_TEMPLATES,
  ADD_TEMPLATE_CACHES,
  CLEAR_TEMPLATE_CACHES,
} from './TemplateActions';
import { is, List, Set, Map, fromJS } from 'immutable';
import getModuleId from './utils/getModuleId';
import { globalCaches } from './utils/compile';

// Initial State
const initialState = fromJS({
  data: Set(),
  caches: globalCaches,
});

const TemplateReducer = (state = initialState, action) => {
  switch (action.type) {
    case CLEAR_TEMPLATE_CACHES:
      globalCaches.clear();
      return state.set('caches', globalCaches);
    case ADD_TEMPLATE_CACHES:
      // TODO
      // limit caches size
      const { caches } = action;
      const currentCaches = state.get('caches');
      if (is(caches, currentCaches)) {
        return state;
      } else {
        const nextCaches = currentCaches.merge(caches);
        return state.set('caches', nextCaches);
      }
    case ADD_TEMPLATE:
    case ADD_TEMPLATES:
      if (!action.template && !action.templates) {
        return state;
      }
      const newTemplates = action.template
        ? Set([fromJS(action.template)])
        : Set(fromJS(action.templates));
      const nextTemplates = state
        .get('data')
        .union(newTemplates)
        .groupBy(ele => ele.get('_id'))
        .map(ele => ele.maxBy(v => new Date(v.get('updatedAt')).getTime()))
        .toSet();
      return state.set('data', nextTemplates);
    default:
      const list2set = ['data'];
      for (const field of list2set) {
        if (List.isList(state.get(field))) {
          return state.set(field, state.get(field).toSet());
        }
      }
      return state;
  }
};

export const getTemplates = state => state.template.get('data');

export const getCaches = state => {
  return state.template.get('caches');
};

export const getModule = (state, template) => {
  return state.template.get('caches').get(getModuleId(template));
};

export default TemplateReducer;
