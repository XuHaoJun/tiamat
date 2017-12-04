import React from "react";
import PropTypes from "prop-types";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import Loadable from "react-loadable";

import { Tabs, Tab } from "material-ui/Tabs";
import EnhancedSwipeableViews from "../../../components/EnhancedSwipableViews";

const Loading = () => <div>Loading...</div>;

const AceEditor = Loadable({
  loader: () => {
    if (typeof window === "undefined") {
      return Promise.resolve(Loading);
    } else {
      const braceP = import(/* webpackChunkName: "brace" */ "brace");
      return braceP
        .then(() => {
          const braceModeP = import(/* webpackChunkName: "brace/mode/json" */ "brace/mode/json");
          const braceThemeP = import(/* webpackChunkName: "brace/theme/github" */ "brace/theme/github");
          return Promise.all([braceModeP, braceThemeP]);
        })
        .then(() => {
          return import(/* webpackChunkName: "react-ace" */ "react-ace");
        });
    }
  },
  loading: Loading
});

class WikiDataFormForm extends React.Component {
  static propTypes = {
    enablePreviewTabs: PropTypes.bool
  };

  static defaultProps = {
    enablePreviewTabs: false
  };

  state = {
    schemaValue: "test"
  };

  handleSchemaChange = schemaValue => {
    console.log("schemaValue", schemaValue);
    this.setState({ schemaValue });
  };

  renderForm = () => {
    const testJSON = {
      test: "1"
    };
    return (
      <div>
        <h1>Schema</h1>
        <AceEditor
          mode="json"
          theme="github"
          name="wikiDataFormForm"
          tabSize={2}
          highlightActiveLine={true}
          showLineNumbers={true}
          onChange={this.handleSchemaChange}
          enableLiveAutocompletion={true}
          showGutter={true}
          value={this.state.schemaValue}
          editorProps={{ $blockScrolling: true }}
        />
        <h1>UI Schema</h1>
        <AceEditor
          mode="json"
          theme="github"
          name="wikiDataFormForm2"
          tabSize={2}
          highlightActiveLine={true}
          showLineNumbers={true}
          enableLiveAutocompletion={true}
          showGutter={true}
          defaultValue={JSON.stringify(testJSON, null, 2)}
        />
      </div>
    );
  };

  render() {
    const { enablePreviewTabs } = this.props;
    if (enablePreviewTabs) {
      return <div>尚未完成</div>;
    } else {
      return this.renderForm();
    }
  }
}

export default WikiDataFormForm;
