import React from "react";
import Form from "react-jsonschema-form";
import JSONTree from "react-json-tree";

import _cloneDeep from "lodash/cloneDeep";
import _set from "lodash/set";
import _unset from "lodash/unset";
import RecursiveIterator from "recursive-iterator";

import loadBootstrap from "./utils/loadBootstrap";

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

const schema = {
  title: "流亡黯道-裝備(基於 JSON Schema 產生)",
  definitions: {
    mod: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          title: "屬性",
          type: "string",
          enum: [
            "+n 全能力",
            "+n 力量",
            "+n 敏捷",
            "+n 智慧",
            "鋼鐵反射",
            "閃電傷害造成中毒"
          ],
          default: "+n 全能力"
        }
      },
      dependencies: {
        name: {
          oneOf: [
            {
              required: ["value"],
              properties: {
                name: {
                  enum: ["+n 全能力", "+n 力量", "+n 敏捷", "+n 智慧"]
                },
                value: {
                  type: "integer",
                  title: "數值",
                  default: 0
                }
              }
            }
          ]
        }
      }
    }
  },
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["武器", "單手劍", "爪"],
      default: "單手劍",
      title: "類型"
    },
    mods: {
      type: "array",
      items: {
        $ref: "#/definitions/mod"
      }
    }
  }
};

// normal2Search(schema);

const uiSchema = {
  // description: {
  //   "ui:widget": "textarea"
  // },
  // effect: {
  //   "ui:widget": "textarea"
  // },
  // "ui:order": [
  //   "type",
  //   "name",
  //   "rarity",
  //   "class",
  //   "cost",
  //   "*",
  //   "effect",
  //   "description"
  // ]
};

const log = type => console.log.bind(console, type);

const theme = {
  scheme: "monokai",
  author: "wimer hazenberg (http://www.monokai.nl)",
  base00: "#272822",
  base01: "#383830",
  base02: "#49483e",
  base03: "#75715e",
  base04: "#a59f85",
  base05: "#f8f8f2",
  base06: "#f5f4f1",
  base07: "#f9f8f5",
  base08: "#f92672",
  base09: "#fd971f",
  base0A: "#f4bf75",
  base0B: "#a6e22e",
  base0C: "#a1efe4",
  base0D: "#66d9ef",
  base0E: "#ae81ff",
  base0F: "#cc6633"
};

class WikiDataForm extends React.Component {
  componentDidMount() {
    loadBootstrap();
  }

  render() {
    return (
      <div>
        <h1>尚未完成</h1>
        <Form
          schema={schema}
          uiSchema={uiSchema}
          onChange={log("changed")}
          onSubmit={log("submitted")}
          onError={log("errors")}
        />
        <h1>JSON Schema</h1>
        <JSONTree theme={theme} data={schema} invertTheme={true} />
        <h1>UI Schema</h1>
        <JSONTree theme={theme} data={uiSchema} invertTheme={true} />
        <h1>etc</h1>
        <h2>
          <a href="https://mozilla-services.github.io/react-jsonschema-form/">
            JSON Schema form live playground!
          </a>
        </h2>
        <p>
          Powerd by
          <a href="https://github.com/mozilla-services/react-jsonschema-form">
            react-jsonschema-form
          </a>
        </p>
      </div>
    );
  }
}

export default WikiDataForm;
