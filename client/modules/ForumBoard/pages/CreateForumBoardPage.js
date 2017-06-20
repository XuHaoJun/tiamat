import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import getDefaultContainerStyles from '../../MyApp/styles/defaultContainerStyles';
import {setHeaderTitle, updateSendButtonProps} from '../../MyApp/MyAppActions';
import CreateForumBoardForm from '../components/CreateForumBoardForm';
import {addForumBoardRequest} from '../ForumBoardActions';

export function getStyles(browser) {
  const containerStyle = getDefaultContainerStyles(browser);
  return {container: containerStyle.container};
}

class CreateForumBoardPage extends React.PureComponent {
  static defaultProps = {
    title: '建立看板'
  };

  static contextTypes = {
    router: PropTypes.object
  };

  componentWillMount() {
    const {title} = this.props;
    this
      .props
      .dispatch(setHeaderTitle(title));
  }

  setFormRef = (formComponent) => {
    if (formComponent) {
      this.formComponent = formComponent;
      const onTouchTap = this.sendForm;
      this
        .props
        .dispatch(updateSendButtonProps({onTouchTap}));
    } else {
      this
        .props
        .dispatch(updateSendButtonProps({
          onTouchTap: () => {}
        }));
    }
  }

  sendForm = () => {
    if (this.formComponent) {
      const form = this
        .formComponent
        .getForm();
      if (!form) {
        return;
      }
      this
        .props
        .dispatch((dispatch) => {
          return Promise
            .resolve(dispatch(updateSendButtonProps({loading: true})))
            .then(() => dispatch(addForumBoardRequest(form)))
            .then((forumBoardJSON) => {
              dispatch(updateSendButtonProps({loading: false}));
              return forumBoardJSON;
            })
            .then((forumBoardJSON) => {
              this
                .context
                .router
                .push(`/forumBoards/${forumBoardJSON._id}/rootDiscussions`);
            })
            .catch(() => dispatch(updateSendButtonProps({loading: false})));
        });
    }
  }

  render() {
    const {title} = this.props;
    const metaDescription = title;
    const meta = [
      {
        name: 'description',
        content: metaDescription
      }
    ];
    const styles = getStyles(this.props.browser);
    return (
      <div>
        <Helmet title={title} meta={meta}/>
        <div style={styles.container}>
          <CreateForumBoardForm ref={this.setFormRef}/>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  const browser = state.browser;
  return {browser};
}

export default connect(mapStateToProps)(CreateForumBoardPage);
