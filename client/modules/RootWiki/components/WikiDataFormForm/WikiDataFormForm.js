import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { Container, Col, Row } from "react-grid-system";
import { Tabs, Tab } from "material-ui/Tabs";

import exampleData from "../../../Wiki/components/WikiDataForm/HearthStoneSchema.json";
import WikiDataForm from "../../../Wiki/components/WikiDataForm";
import EnhancedSwipeableViews from "../../../../components/EnhancedSwipableViews";
import validate from "./validate";
import AceEditorOri from "../../../../components/AceEditor";

const AceEditor = props => {
  const defaultProps = {
    mode: "json",
    theme: "github",
    tabSize: 2,
    highlightActiveLine: true,
    showLineNumbers: true,
    enableLiveAutocompletion: true,
    showGutter: true
  };
  const finalProps = Object.assign(defaultProps, props);
  return <AceEditorOri {...finalProps} />;
};

class WikiDataFormForm extends React.PureComponent {
  static propTypes = {
    enablePreview: PropTypes.bool,
    previewShowKind: PropTypes.oneOf(["grid", "tabs"]),
    defaultWikiDataForm: PropTypes.object,
    onRequestSubmit: PropTypes.func
  };

  static defaultProps = {
    enablePreview: true,
    previewShowKind: "grid",
    defaultWikiDataForm: undefined,
    onRequestSubmit: undefined
  };

  constructor(props) {
    super(props);
    this.state = {
      name: "",
      jsonSchemaValue: JSON.stringify(exampleData.schema, null, 2),
      uiSchemaValue: JSON.stringify(exampleData.uiSchema, null, 2)
    };
    const { defaultWikiDataForm } = props;
    if (defaultWikiDataForm) {
      const { name, jsonSchema, uiSchema } = defaultWikiDataForm;
      this.state.name = name;
      this.state.jsonSchemaValue = JSON.stringify(jsonSchema, null, 2);
      this.state.uiSchemaValue = JSON.stringify(uiSchema, null, 2);
    }
  }

  getForm = () => {
    try {
      const { name, jsonSchemaValue, uiSchemaValue } = this.state;
      const jsonSchema = JSON.parse(jsonSchemaValue);
      const uiSchema = JSON.parse(uiSchemaValue);
      const wikiDataForm = {
        name,
        jsonSchema,
        uiSchema
      };
      return wikiDataForm;
    } catch (error) {
      if (error instanceof SyntaxError) {
        return null;
      } else {
        throw error;
      }
    }
  };

  validate = validate;

  submit = () => {
    const form = this.getForm();
    const valid = this.validate(form);
    if (valid) {
      if (this.props.onRequestSubmit) {
        this.props.onRequestSubmit(form, this.validate);
      }
    }
  };

  handleSchemaChange = jsonSchemaValue => {
    this.setState({ jsonSchemaValue });
  };

  handleUISchemaChange = uiSchemaValue => {
    this.setState({ uiSchemaValue });
  };

  renderPreview = () => {
    let wikiDataForm = this.getForm();
    if (wikiDataForm) {
      this.previousWikiDataForm = wikiDataForm;
    } else {
      if (this.previousWikiDataForm) {
        wikiDataForm = this.previousWikiDataForm;
      }
    }
    return <WikiDataForm wikiDataForm={wikiDataForm} />;
  };

  renderForm = () => {
    const { jsonSchemaValue, uiSchemaValue } = this.state;
    return (
      <div>
        <h1>Schema</h1>
        <AceEditor
          mode="json"
          name="WikiDataFormForm-schema"
          onChange={this.handleSchemaChange}
          value={jsonSchemaValue}
        />
        <h1>UI Schema</h1>
        <AceEditor
          mode="json"
          name="WikiDataFormForm-uiSchema"
          onChange={this.handleUISchemaChange}
          value={uiSchemaValue}
        />
      </div>
    );
  };

  render() {
    const { enablePreview, previewShowKind } = this.props;
    if (enablePreview) {
      if (previewShowKind === "grid") {
        return (
          <div>
            <Container fluid={true}>
              <Row>
                <Col sm={12} md={6}>
                  {this.renderForm()}
                </Col>
                <Col sm={12} md={6}>
                  {this.renderPreview()}
                </Col>
              </Row>
            </Container>
          </div>
        );
      } else if (previewShowKind === "tabs") {
        return (
          <div>
            {this.renderForm()}
            {this.renderPreview()}
          </div>
        );
        // TODO
        // implement tabs
        // return (
        //   <div>
        //     <Tabs>
        //       <Tab label="表單" />
        //       <Tab label="預覽" />
        //     </Tabs>
        //     <EnhancedSwipeableViews>
        //       {this.renderForm()}
        //       {this.renderPreview()}
        //     </EnhancedSwipeableViews>
        //   </div>
        // );
      } else {
        return <div>Not support previewShowKind: {previewShowKind}</div>;
      }
    } else {
      return this.renderForm();
    }
  }
}

export const WikiDataFormFormWithoutConnect = WikiDataFormForm;

export default connect(
  (state, props) => {
    let { previewShowKind } = props;
    if (!previewShowKind) {
      const { browser } = state;
      if (browser.lessThan.medium) {
        previewShowKind = "tabs";
      } else {
        previewShowKind = "grid";
      }
    }
    return { previewShowKind };
  },
  null,
  null,
  { withRef: true }
)(WikiDataFormForm);
