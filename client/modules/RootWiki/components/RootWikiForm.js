import React from 'react';
import PropTypes from 'prop-types';
import Editor from '../../../components/Slate';

class RootWikiForm extends React.PureComponent {
  static propTypes = {
    forumBoardId: PropTypes.string
  };

  static defaultProps = {
    forumBoardId: ''
  };

  getForm = () => {
    const {forumBoardId} = this.props;
    const content = this.editor
      ? this
        .editor
        .getJSONContent()
      : null;
    if (!content) {
      return null;
    }
    return {forumBoardId, content};
  }

  setEditorRef = (ele) => {
    this.editor = ele ? ele.getWrappedInstance() : ele;
  }

  render() {
    return (
      <div>
        <Editor ref={this.setEditorRef} onChangeContent={this.props.onChangeContent}/>
      </div>
    );
  }
}

export default RootWikiForm;
