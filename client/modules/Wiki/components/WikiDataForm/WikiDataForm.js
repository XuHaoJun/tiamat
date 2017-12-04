import React from "react";
import PropTypes from "prop-types";
import Form from "react-jsonschema-form";
import JSONTree from "react-json-tree";

import loadBootstrap from "./utils/loadBootstrap";

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

const uiSchema = {
  "ui:order": ["type", "mods", "*"]
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
  static propTypes = {
    wikiDataForm: PropTypes.object
  };

  static defaultProps = {
    wikiDataForm: {
      name: "流亡黯道-裝備",
      jsonSchema: schema,
      jsonUISchema: uiSchema
    }
  };

  componentDidMount() {
    loadBootstrap();
  }

  render() {
    const { wikiDataForm } = this.props;
    // if (wikiDataForm === undefined) {
    //   return <div>Loading...</div>;
    // }
    const { name, jsonSchema, jsonUISchema } = wikiDataForm;
    return (
      <div>
        <h1>尚未完成</h1>
        <Form
          schema={jsonSchema}
          uiSchema={jsonUISchema}
          onChange={log("changed")}
          onSubmit={log("submitted")}
          onError={log("errors")}
        />
        <h1>JSON Schema</h1>
        <JSONTree theme={theme} data={jsonSchema} invertTheme={true} />
        <h1>UI Schema</h1>
        <JSONTree theme={theme} data={jsonUISchema} invertTheme={true} />
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
