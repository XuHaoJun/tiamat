import React from "react";
import PropTypes from "prop-types";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import { Set } from "immutable";
import _ from "lodash";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";

import Editor, { emptyContent } from "../../../../components/Slate/Editor";

class DiscussionForm extends React.Component {
  static propTypes = {
    forumBoardId: PropTypes.string,
    forumBoardGroup: PropTypes.string,
    forumBoard: PropTypes.object,
    parentDiscussionId: PropTypes.string,
    initForm: PropTypes.object,
    semanticRules: PropTypes.object,
    onChange: PropTypes.func,
    isRoot: PropTypes.bool
  };

  static defaultProps = {
    forumBoardId: "",
    forumBoardGroup: "",
    parentDiscussionId: "",
    forumBoard: undefined,
    initForm: undefined,
    semanticRules: Set(),
    isRoot: false,
    onChange: () => {}
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.state = {
      title: "",
      forumBoardGroup: props.forumBoard
        ? props.forumBoard.get("groups").get(0)
        : "",
      content: emptyContent
    };
    if (props.forumBoardGroup) {
      this.state.forumBoardGroup = props.forumBoardGroup;
    }
    const { initForm } = props;
    const nextState = this.initByForm(initForm);
    this.state = Object.assign(this.state, nextState);
  }

  componentWillReceiveProps(nextProps) {
    const { initForm } = nextProps;
    const nextState = this.initByForm(initForm);
    if (Object.keys(nextState) > 0) {
      this.setState(nextState);
    }
  }

  getForm = () => {
    const { forumBoardId, isRoot, parentDiscussionId } = this.props;
    const { title, forumBoardGroup } = this.state;
    const content = this.editor ? this.editor.getJSONContent() : null;
    let form;
    if (isRoot) {
      form = {
        title,
        forumBoard: forumBoardId,
        content,
        isRoot,
        forumBoardGroup
      };
    } else {
      form = {
        parentDiscussion: parentDiscussionId,
        content,
        isRoot
      };
    }
    return form;
  };

  setEditorRef = ele => {
    this.editor = ele ? ele.getWrappedInstance() : ele;
  };

  initByForm = form => {
    let nextState = {};
    if (form) {
      const { title, content, forumBoardGroup } = form;
      nextState = _.omitBy({ title, content, forumBoardGroup }, _.isEmpty);
    }
    return nextState;
  };

  handleTitleOnChange = event => {
    this.setState({ title: event.target.value });
    if (this.props.onChange) {
      this.props.onChange();
    }
  };

  handleGroupChange = (event, index, forumBoardGroup) => {
    this.setState({ forumBoardGroup });
    if (this.props.onChange) {
      this.props.onChange();
    }
  };

  handleChangeContent = change => {
    if (this.props.onChange) {
      this.props.onChange();
    }
    if (this.props.onChangeContent) {
      this.props.onChangeContent(change);
    }
  };

  render() {
    const styles = {
      editorContainer: {
        marginTop: 20
      }
    };
    const { semanticRules, forumBoard, isRoot } = this.props;
    const { title, content, forumBoardGroup } = this.state;
    return (
      <div>
        {isRoot ? (
          <TextField
            id="titleTextField"
            style={{
              marginLeft: 24
            }}
            label="標題"
            value={title}
            onChange={this.handleTitleOnChange}
          />
        ) : null}
        <div>
          {forumBoard && isRoot ? (
            <React.Fragment>
              <Button
                onClick={event => {
                  this.setState({ anchorEl: event.currentTarget });
                }}
              >
                {forumBoardGroup}
                <ArrowDropDown />
              </Button>
              <Menu
                anchorEl={this.state.anchorEl}
                open={Boolean(this.state.anchorEl)}
                onClose={() => {
                  this.setState({ anchorEl: null });
                }}
              >
                {forumBoard.get("groups").map(group => {
                  const selected = group === forumBoardGroup;
                  return (
                    <MenuItem
                      onClick={() => {
                        this.setState({
                          anchorEl: null,
                          forumBoardGroup: group
                        });
                      }}
                      key={group}
                      selected={selected}
                    >
                      {group}
                    </MenuItem>
                  );
                })}
              </Menu>
            </React.Fragment>
          ) : null}
        </div>
        <div style={styles.editorContainer}>
          <Editor
            ref={this.setEditorRef}
            semanticRules={semanticRules}
            rawContent={content}
            onChangeContent={this.handleChangeContent}
          />
        </div>
      </div>
    );
  }
}

export default DiscussionForm;
