import axios from 'axios';
import Config from '../../server/configs/server';

export const API_URL = (typeof window === 'undefined' || process.env.NODE_ENV === 'test')
  ? process.env.BASE_URL || (`http://localhost:${process.env.PORT || Config.port}/api`)
  : '/api';

// in server-side call this skip error for no crush when not handle rejection.
const handleError = (typeof window === 'undefined' && typeof document === 'undefined')
  ? error => error
  : undefined;

export default function callApi(endpoint, method = 'get', data = null, config = {}) {
  const reqConfig = Object.assign({
    url: `${API_URL}/${endpoint}`,
    headers: {
      'content-type': 'application/json'
    },
    method,
    data
  }, config || {});
  return axios(reqConfig).then((response) => {
    const json = response.data;
    return json;
  }).then(response => response, handleError);
}
