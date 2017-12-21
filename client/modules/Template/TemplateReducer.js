import {
  ADD_TEMPLATE,
  ADD_TEMPLATES,
  ADD_TEMPLATE_CACHES
} from "./TemplateActions";
import { Map, is, List, Set, fromJS } from "immutable";
import getModuleId from "./utils/getModuleId";

// Initial State
const initialState = fromJS({
  data: Set(),
  caches: Map()
});

const TemplateReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TEMPLATE_CACHES:
      const { caches } = action;
      const currentCaches = state.get("caches");
      if (is(caches, currentCaches)) {
        return state;
      } else {
        const nextCaches = currentCaches.merge(caches);
        return state.set("caches", nextCaches);
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
        .get("data")
        .union(newTemplates)
        .groupBy(ele => ele.get("_id"))
        .map(ele => ele.maxBy(v => new Date(v.get("updatedAt")).getTime()))
        .toSet();
      return state.set("data", nextTemplates);
    default:
      const list2set = ["data"];
      for (const field of list2set) {
        if (List.isList(state.get(field))) {
          return state.set(field, state.get(field).toSet());
        }
      }
      return state;
  }
};

export const getTemplates = state => state.template.get("data");

export const getCaches = state => {
  return state.template.get("caches");
};

export const getModule = (state, rootWiki, name) => {
  return state.template.get("caches").get(getModuleId(rootWiki, name));
};

export default TemplateReducer;
