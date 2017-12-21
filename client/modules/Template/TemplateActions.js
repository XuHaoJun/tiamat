import _compile from "./utils/compile";
import callApi from "../../util/apiCaller";
import { defaultRequestErrorHandler } from "../Error/ErrorActions";

export const ADD_TEMPLATE = "ADD_TEMPLATE";
export const ADD_TEMPLATES = "ADD_TEMPLATES";
export const ADD_TEMPLATE_CACHE = "ADD_TEMPLATE_CACHE";
export const ADD_TEMPLATE_CACHES = "ADD_TEMPLATE_CACHES";

export function addTemplate(template, dispatch) {
  return { type: ADD_TEMPLATE, template, dispatch };
}

export function addTemplateCaches(caches) {
  return { type: ADD_TEMPLATE_CACHES, caches };
}

export function compile(template, { caches }) {
  return dispatch => {
    return _compile(template, { dispatch, caches }).then(m => {
      dispatch(addTemplateCaches(m.caches));
      return m;
    });
  };
}

export function fetchTemplate(moduleId, reqConfig) {
  return dispatch => {
    return callApi(`templates${moduleId}`, "get", null, reqConfig)
      .then(res => {
        dispatch(addTemplate(res.template));
        return res.template;
      })
      .catch(err => defaultRequestErrorHandler(dispatch, err));
  };
}
