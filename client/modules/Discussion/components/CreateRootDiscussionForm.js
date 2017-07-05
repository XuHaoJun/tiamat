import React from "react";
import PropTypes from "prop-types";
import TextField from "material-ui/TextField";
import DropDownMenu from "material-ui/DropDownMenu";
import MenuItem from "material-ui/MenuItem";
import Editor, { emptyContent } from "../../../components/Slate/Editor";
import { Set } from "immutable";
import { shouldComponentUpdate } from "react-immutable-render-mixin";

class CreateRootDiscussionForm extends React.Component {
  static propTypes = {
    forumBoardId: PropTypes.string,
    forumBoardGroup: PropTypes.string,
    forumBoard: PropTypes.object,
    initForm: PropTypes.object,
    semanticRules: PropTypes.object
  };

  static defaultProps = {
    forumBoardId: "",
    forumBoardGroup: "",
    forumBoard: null,
    initForm: null,
    semanticRules: Set()
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.state = {
      title: "",
      forumBoardGroup: props.forumBoard
        ? props.forumBoard.get("groups").get(0)
        : "",
      rawContent: emptyContent
    };
    if (props.forumBoardGroup) {
      this.state.forumBoardGroup = props.forumBoardGroup;
    }
    const { initForm } = props;
    if (initForm) {
      const title = initForm.get("title");
      if (title) {
        this.state.title = title;
      }
      if (props.initForm.get("content")) {
        this.state.rawContent = props.initForm.get("content");
      }
    }
  }

  getForm = () => {
    const { forumBoardId } = this.props;
    const { title, forumBoardGroup } = this.state;
    const isRoot = true;
    const content = this.editor ? this.editor.getJSONContent() : null;
    if (!content || !forumBoardId) {
      return null;
    }
    return {
      title,
      forumBoard: forumBoardId,
      content,
      isRoot,
      forumBoardGroup
    };
  };

  setEditorRef = ele => {
    this.editor = ele ? ele.getWrappedInstance() : ele;
  };

  titleOnChange = event => {
    this.setState({ title: event.target.value });
  };

  handleGroupChange = (event, index, forumBoardGroup) =>
    this.setState({ forumBoardGroup });

  render() {
    const editorStyleContainer = {
      marginTop: 20
    };
    const { semanticRules } = this.props;
    return (
      <div>
        <TextField
          style={{
            marginLeft: 24
          }}
          floatingLabelText="標題"
          value={this.state.title}
          onChange={this.titleOnChange}
        />
        <div>
          {this.props.forumBoard
            ? <DropDownMenu
                value={this.state.forumBoardGroup}
                onChange={this.handleGroupChange}
              >
                {this.props.forumBoard.get("groups").map(group => {
                  const key = group;
                  return (
                    <MenuItem key={key} value={group} primaryText={group} />
                  );
                })}
              </DropDownMenu>
            : null}
        </div>
        <div style={editorStyleContainer}>
          <Editor
            ref={this.setEditorRef}
            semanticRules={semanticRules}
            rawContent={this.state.rawContent}
            onChangeContent={this.props.onChangeContent}
          />
        </div>
      </div>
    );
  }
}

export default CreateRootDiscussionForm;
