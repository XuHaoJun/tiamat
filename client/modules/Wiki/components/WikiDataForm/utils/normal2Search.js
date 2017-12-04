import _cloneDeep from "lodash/cloneDeep";
import _set from "lodash/set";
import _unset from "lodash/unset";
import RecursiveIterator from "recursive-iterator";

function normal2Search(schema) {
  const result = _cloneDeep(schema);
  for (const { node, path } of new RecursiveIterator(schema)) {
    const { type } = node;
    const _enum = node.enum;
    if (type === "number" || type === "integer") {
      _set(result, path, {
        type: "object",
        title: node.title,
        properties: {
          min: {
            type,
            title: "min"
          },
          max: {
            type,
            title: "max"
          }
        }
      });
    } else if (type === "string" && !_enum) {
      _unset(result, path);
    }
  }
  return result;
}

export default normal2Search;
