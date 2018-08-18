import axios from 'axios';
import Debug from 'debug';

import { port } from '../../server/configs/server';

const debug = Debug('app:apiCaller');

export const API_URL =
  !process.browser || process.env.NODE_ENV === 'test'
    ? process.env.BASE_URL || `http://localhost:${process.env.PORT || port}/api`
    : '/api';

// in server-side call this skip error for no crush when not handle rejection.
const handleError = !process.browser
  ? error => {
      debug('error', error);
      return error;
    }
  : undefined;

export default function callApi(endpoint, method = 'get', data = null, config = {}) {
  const reqConfig = {
    url: `${API_URL}/${endpoint}`,
    headers: {
      'content-type': 'application/json',
    },
    method,
    data,
    ...config,
  };
  debug('start fetch', reqConfig.url);
  return axios(reqConfig)
    .then(response => {
      return response.data;
    })
    .then(response => response, handleError);
}
