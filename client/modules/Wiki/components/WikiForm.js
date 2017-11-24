import React from "react";
import PropTypes from "prop-types";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import TextField from "material-ui/TextField";
import Editor from "../../../components/Slate";
import RootWikiGroupTreePopover from "../../RootWiki/components/RootWikiGroupTreePopover";

export function getStyles() {
  const styles = {
    editorStyleContainer: {
      marginTop: 20
    },
    name: {
      margin: 5
    }
  };
  return styles;
}

class WikiForm extends React.Component {
  static propTypes = {
    rootWikiId: PropTypes.string.isRequired,
    name: PropTypes.string,
    content: PropTypes.object,
    rootWikiGroupTree: PropTypes.object,
    nameReadOnly: PropTypes.bool,
    editorEnableAutoFullScreen: PropTypes.bool
  };

  static defaultProps = {
    name: "",
    content: null,
    rootWikiGroupTree: null,
    nameReadOnly: false,
    editorEnableAutoFullScreen: true
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    const { name } = props;
    this.state = {
      name
    };
  }

  onNameChange = event => {
    const newName = event.target.value;
    const { name } = this.state;
    if (newName !== name) {
      this.setState({ name: newName });
    }
  };

  setEditorRef = ele => {
    this.editor = ele ? ele.getWrappedInstance() : ele;
  };

  getForm = () => {
    const { rootWikiId } = this.props;
    const { name } = this.state;
    const content = this.editor ? this.editor.getJSONContent() : null;
    if (!content) {
      return null;
    }
    return { name, rootWikiId, content };
  };

  render() {
    const { name, content, rootWikiGroupTree } = this.props;
    const {
      nameReadOnly,
      editorEnableAutoFullScreen,
      onChangeContent
    } = this.props;
    const styles = getStyles();
    return (
      <div>
        {nameReadOnly ? (
          <h1 style={styles.name}>{name}</h1>
        ) : (
          <TextField
            floatingLabelText="您的維基名稱"
            value={this.state.name}
            onChange={this.onNameChange}
          />
        )}
        <RootWikiGroupTreePopover rootWikiGroupTree={rootWikiGroupTree} />
        <div style={styles.editorStyleContainer}>
          <Editor
            ref={this.setEditorRef}
            readOnly={false}
            rawContent={content}
            onChangeContent={onChangeContent}
            enableAutoFullScreen={editorEnableAutoFullScreen}
          />
        </div>
      </div>
    );
  }
}

export default WikiForm;
