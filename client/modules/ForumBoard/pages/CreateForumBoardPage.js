import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import { setHeaderTitle, updateSendButtonProps } from '../../MyApp/MyAppActions';
import CreateForumBoardForm from '../components/CreateForumBoardForm';
import { addForumBoardRequest } from '../ForumBoardActions';
import { push } from 'react-router-redux';

class CreateForumBoardPage extends React.PureComponent {
  static defaultProps = {
    title: '建立看板',
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
          onClick: null,
        })
      );
    }
  };

  sendForm = () => {
    if (this.formComponent) {
      const form = this.formComponent.getForm();
      if (!form) {
        return;
      }
      this.props.dispatch(dispatch => {
        return Promise.resolve(dispatch(updateSendButtonProps({ loading: true })))
          .then(() => dispatch(addForumBoardRequest(form)))
          .then(forumBoardJSON => {
            dispatch(updateSendButtonProps({ loading: false }));
            return forumBoardJSON;
          })
          .then(forumBoardJSON => {
            this.props.dispatch(push(`/forumBoards/${forumBoardJSON._id}/rootDiscussions`));
          })
          .catch(() => dispatch(updateSendButtonProps({ loading: false })));
      });
    }
  };

  render() {
    const { title } = this.props;
    const metaDescription = title;
    const meta = [
      {
        name: 'description',
        content: metaDescription,
      },
    ];
    return (
      <React.Fragment>
        <Helmet title={title} meta={meta} />
        <div style={{ marginTop: 50 }}>
          <CreateForumBoardForm ref={this.setFormRef} />
        </div>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state, routerProps) {
  const { browser } = state;
  return { browser };
}

export default connect(mapStateToProps)(CreateForumBoardPage);
