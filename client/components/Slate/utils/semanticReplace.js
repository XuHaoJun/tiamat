import { fromJS } from "immutable";
import memoize from "fast-memoize";
import createFastMemoizeDefaultOptions from "../../../util/createFastMemoizeDefaultOptions";
import { Range } from "slate";
import Debug from "debug";

const debug = Debug("app:editor:semanticReplace");

export const exampleSemanticRules = fromJS([
  {
    name: "背刺",
    href: "",
    data: {
      rootWikiId: "59169e05e36ec344308fafbb",
      wikiId: "5916ad94e36ec344308fafc0"
    },
    getHref: (rule, node) => {
      const data = rule.get("data");
      const wikiId = data.get("wikiId");
      return `/wikis/${wikiId}`;
    }
  }
]);

function semanticReplace(value, semanticRules) {
  debug("start", value, semanticRules);
  const change = value.change();
  const { document } = value;
  const startNode = document;
  if (!semanticRules || semanticRules.count() === 0) {
    return change;
  }
  const calcedParentKeys = [];
  startNode.filterDescendants(node => {
    if (node.kind !== "text") {
      return;
    }
    let parent = startNode.getParent(node.key);
    const calced = calcedParentKeys.lastIndexOf(parent.key) > -1;
    if (calced || !parent || (parent && parent.type === "link")) {
      return;
    }
    semanticRules.forEach(rule => {
      const name = rule.get("name");
      const getHref = rule.get("getHref");
      const href = rule.get("href") ? rule.get("href") : getHref(rule, node);
      const nameLength = name.length;
      const re = new RegExp(name, "gm");
      let found = false;
      let match = re.exec(parent.text);
      found = match !== null;
      if (found) {
        calcedParentKeys.push(parent.key);
        let selection;
        let seleProps;
        const inlineLinkProps = {
          type: "link",
          data: {
            href
          }
        };
        while (match !== null) {
          let anchorKey = node.key;
          let focusKey = anchorKey;
          let anchorOffset = match.index;
          let focusOffset = anchorOffset + nameLength;
          parent = change.value.document.getDescendant(parent.key);
          const textComponent = parent.getTextAtOffset(focusOffset);
          anchorKey = textComponent.key;
          focusKey = anchorKey;
          const tmpReg = new RegExp(name, "gm");
          const tmpMatch = tmpReg.exec(textComponent.text);
          if (tmpMatch) {
            anchorOffset = tmpMatch.index;
            focusOffset = anchorOffset + nameLength;
            seleProps = {
              anchorKey,
              anchorOffset,
              focusKey,
              focusOffset
            };
            selection = Range.create(seleProps);
            change.wrapInlineAtRange(selection, inlineLinkProps);
          }
          const nextMatch = re.exec(parent.text);
          match = nextMatch;
        }
      }
    });
  });
  debug("end", change);
  return change;
}

export const semanticReplaceWithoutMemorize = semanticReplace;

export default memoize(semanticReplace, createFastMemoizeDefaultOptions(2));
