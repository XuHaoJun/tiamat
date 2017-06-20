import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {fetchDiscussion, fetchDiscussions} from '../DiscussionActions';
import {getDiscussion} from '../DiscussionReducer';
import {fetchForumBoardById} from '../../ForumBoard/ForumBoardActions';
import {getForumBoardById} from '../../ForumBoard/ForumBoardReducer';
import {setHeaderTitle} from '../../MyApp/MyAppActions';
import {fetchSemanticRules} from '../../SemanticRule/SemanticRuleActions';
import DiscussionDetail from '../components/DiscussionDetail';

class DiscussionDetailPage extends React.Component {
  static defaultProps = {
    title: '文章'
  };

  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      title: props.title
    };
  }

  componentWillMount() {
    const title = this.state.title;
    this
      .props
      .dispatch(setHeaderTitle(title));
  }

  componentDidMount() {
    this.fetchData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.title !== nextProps.title) {
      this.setState({title: nextProps.title});
      nextProps.dispatch(setHeaderTitle(nextProps.title));
    }
    if (this.props.parentDiscussionId !== nextProps.parentDiscussionId) {
      this.fetchData(nextProps);
    }
  }

  onSemanticToggle = (newSemanticReplaceMode) => {
    const {forumBoardId, parentDiscussionId, semanticReplaceMode} = this.props;
    const {router} = this.context;
    if (semanticReplaceMode !== newSemanticReplaceMode) {
      if (newSemanticReplaceMode) {
        router.replace(`/forumBoards/${forumBoardId}/rootDiscussions/${parentDiscussionId}?semanticReplaceMode=true`);
      } else {
        router.replace(`/forumBoards/${forumBoardId}/rootDiscussions/${parentDiscussionId}`);
      }
    }
  }

  fetchData = (currentProps) => {
    const {forumBoardId, parentDiscussionId, dispatch} = currentProps;
    dispatch(fetchDiscussion(parentDiscussionId));
    dispatch(fetchDiscussions(forumBoardId, parentDiscussionId));
    dispatch(fetchForumBoardById(forumBoardId));
    const {forumBoard} = currentProps;
    const rootWikiId = forumBoard
      ? forumBoard.get('rootWiki')
      : '';
    if (rootWikiId) {
      const scope = [
        {
          type: 'wiki',
          rootWikiId
        }
      ];
      dispatch(fetchSemanticRules(scope));
    }
  }

  render() {
    const {forumBoardId, forumBoard, parentDiscussionId, semanticReplaceMode} = this.props;
    const forumBoardName = forumBoard
      ? forumBoard.get('name')
      : '';
    const helmetTitle = `${this.state.title} - ${forumBoardName}`;
    return (
      <div>
        <Helmet title={helmetTitle}/>
        <DiscussionDetail
          semanticReplaceMode={semanticReplaceMode}
          forumBoardId={forumBoardId}
          parentDiscussionId={parentDiscussionId}
          onSemanticToggle={this.onSemanticToggle}/>
      </div>
    );
  }
}

DiscussionDetailPage.need = [].concat((params) => {
  const {parentDiscussionId} = params;
  return fetchDiscussion(parentDiscussionId);
}).concat((params) => {
  const {forumBoardId, parentDiscussionId} = params;
  return fetchDiscussions(forumBoardId, parentDiscussionId);
}).concat((params) => {
  const {forumBoardId} = params;
  return fetchForumBoardById(forumBoardId);
});

function mapStateToProps(store, props) {
  const {forumBoardId, parentDiscussionId} = props.params;
  let {semanticReplaceMode} = props.location.query;
  semanticReplaceMode = semanticReplaceMode === 'true';
  const parentDiscussion = getDiscussion(store, parentDiscussionId);
  const forumBoard = getForumBoardById(store, forumBoardId);
  const title = parentDiscussion
    ? parentDiscussion.get('title')
    : undefined;
  return {title, forumBoardId, forumBoard, parentDiscussionId, semanticReplaceMode};
}

export default connect(mapStateToProps)(DiscussionDetailPage);
