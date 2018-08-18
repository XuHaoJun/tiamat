import car from 'lodash/first';
import cdr from 'lodash/tail';

export function pathToRootWikiGroupTreeIter(path = [], depth = 0) {
  if (path.length === 1) {
    const name = car(path);
    return { name };
  } else if (path.length > 1) {
    const name = car(path);
    const children = [pathToRootWikiGroupTreeIter(cdr(path), depth + 1)];
    return { name, children };
  } else {
    return null;
  }
}

export default function pathToRootWikiGroupTree2(path = []) {
  return [pathToRootWikiGroupTreeIter(path, 0)];
}

export function pathToRootWikiGroupTree(path, pathEndIsLeaf = true, result = {}, depth = 0) {
  if (depth >= 3) {
    // throw error ?
  }
  if (path.length === 1) {
    const k = [car(path)];
    if (pathEndIsLeaf) {
      return k;
    } else {
      return { [k]: '1' };
    }
  } else if (path.length > 1) {
    const k = car(path);
    return Object.assign(result, {
      [k]: pathToRootWikiGroupTree(cdr(path), pathEndIsLeaf, {}, depth + 1),
    });
  } else {
    return result;
  }
}
