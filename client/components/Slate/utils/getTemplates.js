import { Iterable, Map, List, fromJS } from "immutable";

function isTemplateNode(node) {
  if (Map.isMap(node)) {
    return node.get("type") === "template";
  } else {
    return false;
  }
}

function hasChildren(node) {
  if (Map.isMap(node)) {
    const children = node.get("nodes");
    return List.isList(children);
  } else {
    return false;
  }
}

function isChildren(node) {
  return List.isList(node) && node.size > 0;
}

function isDocument(node) {
  if (Map.isMap(node)) {
    return !!node.get("docuemnt");
  } else {
    return false;
  }
}

// no depent on slate's value model ver.
function getTemplatesTraverse(preValue, path = List(), result = []) {
  const slateValue = Iterable.isIterable(preValue)
    ? preValue
    : fromJS(preValue);
  if (isDocument(slateValue)) {
    return getTemplatesTraverse(
      slateValue.getIn(["document", "nodes"]),
      path.concat(List(["document", "nodes"]))
    );
  } else if (isTemplateNode(slateValue)) {
    if (hasChildren(slateValue)) {
      throw new Error("template not support children.");
    } else {
      const template = slateValue.getIn(["data", "template"]);
      if (!template) {
        throw new Error("should have template data");
      }
      const payload = Map({ template, nodePath: path, node: slateValue });
      result.push(payload);
      return payload;
    }
  } else if (hasChildren(slateValue)) {
    const children = slateValue.get("nodes");
    return getTemplatesTraverse(children, path.concat("nodes"));
  } else if (isChildren(slateValue)) {
    return slateValue.map((v, index) => {
      return getTemplatesTraverse(v, path.concat(index));
    });
  } else {
    return List();
  }
}

export default function getTemplates(slateValue) {
  const result = [];
  getTemplatesTraverse(slateValue, List(), result);
  return List(result);
}
