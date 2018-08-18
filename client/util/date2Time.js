import memoize from 'fast-memoize';
import createFastMemoizeDefaultOptions from './createFastMemoizeDefaultOptions';

function isDate(str) {
  return Object.prototype.toString.call(new Date(str)) === '[object Date]';
}

export function date2Time(date) {
  if (isDate(date)) {
    return date.getTime();
  } else {
    return new Date(date).getTime();
  }
}

export default memoize(date2Time, createFastMemoizeDefaultOptions(10));
