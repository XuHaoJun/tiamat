import _compile from './utils/compile';
import callApi from '../../util/apiCaller';
import { defaultRequestErrorHandler } from '../Error/ErrorActions';

export const ADD_TEMPLATE = 'ADD_TEMPLATE';
export const ADD_TEMPLATES = 'ADD_TEMPLATES';
export const ADD_TEMPLATE_CACHES = 'ADD_TEMPLATE_CACHES';
export const CLEAR_TEMPLATE_CACHES = 'CLEAR_TEMPLATE_CACHES';

export function addTemplate(template, dispatch) {
  return { type: ADD_TEMPLATE, template, dispatch };
}

export function addTemplateCaches(caches) {
  return { type: ADD_TEMPLATE_CACHES, caches };
}

export function clearTemplateCaches() {
  return { type: CLEAR_TEMPLATE_CACHES };
}

export function compile(template, { caches }) {
  return dispatch => {
    return _compile(template, { dispatch, caches }).then(m => {
      if (caches) {
        dispatch(addTemplateCaches(caches));
      }
      return m;
    });
  };
}

export function fetchTemplate(moduleId, reqConfig) {
  return dispatch => {
    return callApi(`templates${moduleId}`, 'get', null, reqConfig)
      .then(res => {
        dispatch(addTemplate(res.template));
        return res.template;
      })
      .catch(err => defaultRequestErrorHandler(dispatch, err));
  };
}
