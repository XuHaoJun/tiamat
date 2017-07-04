import React from 'react';
import {connect} from 'react-redux';
import {Set} from 'immutable';
import {getDiscussion, getDiscussions} from '../DiscussionReducer';
import {getForumBoardById} from '../../ForumBoard/ForumBoardReducer';
import {getSemanticRules} from '../../SemanticRule/SemanticRuleReducer';
import {shouldComponentUpdate} from 'react-immutable-render-mixin';
import Divider from 'material-ui/Divider';
import Editor from '../../../components/Slate/Editor';
import CenterCircularProgress from '../../../components/CenterCircularProgress';
import Avatar from 'material-ui/Avatar';
import GuestPersonIcon from 'material-ui/svg-icons/social/person';
import Toggle from 'material-ui/Toggle';
import moment from 'moment';
import memoize from 'fast-memoize';
import createFastMemoizeDefaultOptions from '../../../util/createFastMemoizeDefaultOptions';

class DiscussionDetail extends React.Component {
  static defaultProps = {
    forumBoardId: '',
    forumBoard: null,
    parentDiscussionId: '',
    parentDiscussion: null,
    childrenDiscussions: Set(),
    semanticReplaceMode: false,
    onSemanticToggle: null
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.state = {
      semanticReplaceMode: false,
      semanticReplaceToggled: false
    };
  }

  componentWillMount() {
    this.timeouts = [];
  }

  componentDidMount() {
    if (this.state.semanticReplaceMode !== this.props.semanticReplaceMode) {
      this.onSemanticToggle(null, null, 0);
    }
  }

  componentWillUnmount() {
    this
      .timeouts
      .forEach(timeout => clearTimeout(timeout));
    this.timeouts = [];
  }

  onSemanticToggle = (event, isInputChecked, time) => {
    const afterUpdate = () => {
      if (this.props.onSemanticToggle) {
        this
          .props
          .onSemanticToggle(this.state.semanticReplaceToggled);
      }
      this.semanticToggle(time);
    };
    this.setState({
      semanticReplaceToggled: !this.state.semanticReplaceToggled
    }, afterUpdate);
  }

  semanticToggle = (time = 160) => {
    if (typeof window === 'object') {
      // emulate after toggle transition.
      const timeout = setTimeout(() => {
        const {semanticReplaceMode} = this.state;
        this.setState({
          semanticReplaceMode: !semanticReplaceMode
        });
      },
        time
      );
      this
        .timeouts
        .push(timeout);
    }
  }

  render() {
    const {parentDiscussion, semanticRules} = this.props;
    const {semanticReplaceMode, semanticReplaceToggled} = this.state;
    if (!parentDiscussion) {
      return (<CenterCircularProgress/>);
    }
    const content = parentDiscussion.get('content');
    const title = parentDiscussion.get('title');
    const createdAt = moment(parentDiscussion.get('createdAt')).fromNow();
    const styles = {
      title: {
        padding: '5px 5px 0px 5px'
      },
      content: {
        padding: '15px'
      },
      simpleInfo: {
        margin: '0px 5px 0px 5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      },
      avatarContainer: {
        display: 'flex',
        alignItems: 'center'
      },
      smallFont: {
        color: '#999',
        fontSize: '13px'
      }
    };
    return (
      <div>
        <h1 style={styles.title}>{title}</h1>
        <div style={styles.simpleInfo}>
          <div>
            <div style={styles.avatarContainer}>
              <Avatar icon={(<GuestPersonIcon/>)}/>
              <span>Guest</span>
            </div>
          </div>
          <div>
            <Toggle label="關鍵詞超連結化" onToggle={this.onSemanticToggle} toggled={semanticReplaceToggled}/>
          </div>
          <div style={styles.smallFont}>{createdAt}</div>
        </div>
        <div style={styles.content}>
          <Editor
            rawContent={content}
            readOnly={true}
            semanticRules={semanticRules}
            semanticReplaceMode={semanticReplaceMode}/>
        </div>
        <Divider/>
      </div>
    );
  }
}

const getSemanticRulesHelper = (() => {
  let f = (rootWikiId, semanticRules) => {
    return semanticRules.filter(ele => ele.get('rootWikiId') === rootWikiId).sortBy(ele => ele.get('name').length);
  };
  if (typeof window === 'object') {
    f = memoize(f, createFastMemoizeDefaultOptions(3));
  }
  return f;
})();

const getChildrenDiscussionsHelper = (() => {
  let f = (parentDiscussionId, discussions) => {
    return discussions.filter(v => v.get('parentDiscussion') === parentDiscussionId).toSet();
  };
  if (typeof window === 'object') {
    f = memoize(f, createFastMemoizeDefaultOptions(3));
  }
  return f;
})();

function mapStateToProps(store, props) {
  const {parentDiscussionId, forumBoardId} = props;
  const forumBoard = getForumBoardById(store, forumBoardId);
  const parentDiscussion = getDiscussion(store, parentDiscussionId);
  const childrenDiscussions = getChildrenDiscussionsHelper(parentDiscussionId, getDiscussions(store));
  const rootWikiId = forumBoard.get('rootWiki');
  const semanticRules = rootWikiId
    ? getSemanticRulesHelper(rootWikiId, getSemanticRules(store))
    : Set();
  return {
    parentDiscussionId,
    forumBoardId,
    forumBoard,
    parentDiscussion,
    childrenDiscussions,
    semanticRules
  };
}

export default connect(mapStateToProps)(DiscussionDetail);
