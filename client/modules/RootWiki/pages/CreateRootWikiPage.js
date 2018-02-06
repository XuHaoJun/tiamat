import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Helmet from "react-helmet";

import RootWikiForm from "../components/RootWikiForm";

import { replace } from "react-router-redux";
import {
  setHeaderTitle,
  updateSendButtonProps
} from "../../MyApp/MyAppActions";
import { addRootWikiRequest } from "../RootWikiActions";

class CreateRootWikiPage extends React.PureComponent {
  static defaultProps = {
    title: "建立主維基"
  };

  componentWillMount() {
    const { title } = this.props;
    this.props.dispatch(setHeaderTitle(title));
  }

  setFormRef = formComponent => {
    if (formComponent) {
      this.formComponent = formComponent;
      const onClick = this.sendForm;
      this.props.dispatch(updateSendButtonProps({ onClick }));
    } else {
      this.props.dispatch(
        updateSendButtonProps({
          onClick: null
        })
      );
    }
  };

  sendForm = () => {
    if (this.formComponent) {
      const form = this.formComponent.getForm();
      const { forumBoardId } = this.props;
      this.props.dispatch(dispatch => {
        return Promise.resolve(
          dispatch(updateSendButtonProps({ loading: true }))
        )
          .then(() => dispatch(addRootWikiRequest(form)))
          .then(rootWikiJSON => {
            dispatch(updateSendButtonProps({ loading: false }));
            return rootWikiJSON;
          })
          .then(rootWikiJSON => {
            this.props.dispatch(
              replace(
                `/forumBoards/${forumBoardId}/rootWikis/${rootWikiJSON._id}`
              )
            );
            return rootWikiJSON;
          })
          .catch(() => dispatch(updateSendButtonProps({ loading: false })));
      });
    }
  };

  // onChangeEditorContent = (editorState) => {}

  render() {
    const { title } = this.props;
    const metaDescription = title;
    const meta = [
      {
        name: "description",
        content: metaDescription
      }
    ];
    const { forumBoardId } = this.props;
    const style = {
      paddingTop: 30
    };
    return (
      <div>
        <Helmet title={title} meta={meta} />
        <div style={style}>
          <RootWikiForm
            ref={this.setFormRef}
            forumBoardId={forumBoardId}
            onChangeEditorContent={this.onChangeEditorContent}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, routerProps) {
  const { forumBoardId } = routerProps.match.params;
  return { forumBoardId };
}

export default connect(mapStateToProps)(CreateRootWikiPage);
