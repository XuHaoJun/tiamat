import React from "react";
import PropTypes from "prop-types";

import Editor from "../../../components/Slate";

// TODO
// validate form
class RootWikiForm extends React.Component {
  static propTypes = {
    actionType: PropTypes.oneOf(["create", "update"]),
    defaultRootWiki: PropTypes.object,
    forumBoardId: PropTypes.string
  };

  static defaultProps = {
    forumBoardId: "",
    actionType: "create",
    defaultRootWiki: undefined
  };

  getForm = () => {
    const { forumBoardId } = this.props;
    const content = this.editor ? this.editor.getJSONContent() : null;
    if (!content) {
      return null;
    }
    return { forumBoardId, content };
  };

  setEditorRef = ele => {
    if (ele && ele.getWrappedInstance) {
      this.editor = ele.getWrappedInstance();
    } else {
      this.editor = ele;
    }
  };

  render() {
    const { actionType } = this.props;
    let defaultValue;
    if (actionType === "update") {
      const { defaultRootWiki } = this.props;
      if (defaultRootWiki) {
        const { content } = defaultRootWiki;
        if (content) {
          defaultValue = content;
        }
      }
    }
    return (
      <div>
        <Editor
          ref={this.setEditorRef}
          onChangeContent={this.props.onChangeContent}
          defaultValue={defaultValue}
        />
      </div>
    );
  }
}

export default RootWikiForm;
