import memoize from "fast-memoize";
import createFastMemoizeDefaultOptions from "./createFastMemoizeDefaultOptions";

export function date2Time(dateString) {
  return new Date(dateString).getTime();
}

export default memoize(date2Time, createFastMemoizeDefaultOptions(3000));
