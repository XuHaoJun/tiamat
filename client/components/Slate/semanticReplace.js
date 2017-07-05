import { fromJS } from "immutable";
import { Selection } from "slate";

export const defaultSemanticRules = fromJS([
  {
    payloads: [
      {
        name: "背刺",
        href: "",
        data: {
          rootWikiId: "59169e05e36ec344308fafbb",
          wikiId: "5916ad94e36ec344308fafc0"
        }
      }
    ],
    getHref: (payload, node) => {
      const data = payload.get("data");
      const rootWikiId = data.get("rootWikiId");
      const wikiId = data.get("wikiId");
      return `/rootWikis/${rootWikiId}/wikis/${wikiId}`;
    }
  }
]);

function semanticReplaceHelper(
  state,
  semanticRules = defaultSemanticRules,
  startNodeKey = ""
) {
  let transform = state.transform();
  const { document } = state;
  let startNode = document;
  if (!startNodeKey) {
    startNode = document.getChild(startNodeKey);
  }
  if (semanticRules.count() === 0) {
    return state;
  }
  startNode.filterDescendants(node => {
    if (node.kind !== "text") {
      return;
    }
    semanticRules.forEach(rule => {
      const payloads = rule.get("payloads");
      const getHref = rule.get("getHref");
      payloads.forEach(payload => {
        const name = payload.get("name");
        const re = new RegExp(name, "gm");
        let found = false;
        const parent = startNode.getParent(node.key);
        let match = re.exec(node.text);
        found = match && parent && parent.type !== "link";
        if (found) {
          const href = payload.get("href")
            ? payload.get("href")
            : getHref(payload, node);
          let selection;
          let inlineLinkProps;
          let seleProps;
          let depth = 0;
          while (match !== null) {
            if (depth > 0) {
              transform = semanticReplaceHelper(
                transform.state,
                semanticRules,
                parent.key
              ).transform();
              return;
            }
            seleProps = {
              anchorKey: node.key,
              anchorOffset: match.index,
              focusKey: node.key,
              focusOffset: match.index + match[0].length
            };
            selection = Selection.create(seleProps);
            inlineLinkProps = {
              type: "link",
              data: {
                href
              }
            };
            transform.wrapInlineAtRange(selection, inlineLinkProps);
            match = re.exec(node.text);
            depth += 1;
          }
        }
      });
    });
  });
  return transform.apply();
}

function semanticReplace(state, semanticRules = defaultSemanticRules) {
  const { document } = state;
  return semanticReplaceHelper(state, semanticRules, document);
}

export default semanticReplace;
