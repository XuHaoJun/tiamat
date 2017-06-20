import qs from 'qs';

export default function getWikisHref(_rootWikiGroupTree = 'all', prefix = '') {
  const rootWikiGroupTree = _rootWikiGroupTree === null
    ? 'null'
    : _rootWikiGroupTree;
  if (rootWikiGroupTree) {
    const rootWikiGroupTreeJSON = rootWikiGroupTree.toJSON
      ? rootWikiGroupTree.toJSON()
      : rootWikiGroupTree;
    const query = qs.stringify({rootWikiGroupTree: rootWikiGroupTreeJSON});
    return `${prefix}/wikis?${query}`;
  }
  return '';
}
