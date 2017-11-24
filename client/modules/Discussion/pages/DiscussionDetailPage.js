import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import _ from "lodash";

import { fetchDiscussion, fetchDiscussions } from "../DiscussionActions";
import { getDiscussion } from "../DiscussionReducer";
import { fetchForumBoardById } from "../../ForumBoard/ForumBoardActions";
import { getForumBoardById } from "../../ForumBoard/ForumBoardReducer";
import { setHeaderTitle, setHeaderTitleThunk } from "../../MyApp/MyAppActions";
import { fetchSemanticRules } from "../../SemanticRule/SemanticRuleActions";
import DiscussionDetail from "../components/DiscussionDetail";

class DiscussionDetailPage extends React.Component {
  static defaultProps = {
    title: "文章"
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
    const { title } = this.state;
    this.props.dispatch(setHeaderTitle(title));
  }

  componentDidMount() {
    this.fetchData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.title !== nextProps.title) {
      this.setState({ title: nextProps.title });
      nextProps.dispatch(setHeaderTitle(nextProps.title));
    }
    if (this.props.parentDiscussionId !== nextProps.parentDiscussionId) {
      this.fetchData(nextProps);
    }
  }

  onSemanticToggle = newSemanticReplaceMode => {
    const { parentDiscussionId, semanticReplaceMode } = this.props;
    const { router } = this.context;
    if (semanticReplaceMode !== newSemanticReplaceMode) {
      if (newSemanticReplaceMode) {
        router.replace(
          `/rootDiscussions/${parentDiscussionId}?semanticReplaceMode=true`
        );
      } else {
        router.replace(`/rootDiscussions/${parentDiscussionId}`);
      }
    }
  };

  fetchData = currentProps => {
    const { parentDiscussion, parentDiscussionId, dispatch } = currentProps;
    dispatch(fetchDiscussion(parentDiscussionId));
    dispatch(fetchDiscussions({ parentDiscussionId }));
    let { forumBoardId } = currentProps;
    if (!forumBoardId) {
      forumBoardId = parentDiscussion
        ? parentDiscussion.get("forumBoard")
        : forumBoardId;
    }
    if (forumBoardId) {
      dispatch(fetchForumBoardById(forumBoardId));
    }
    const { forumBoard } = currentProps;
    const rootWikiId = forumBoard ? forumBoard.get("rootWiki") : "";
    if (rootWikiId) {
      const scope = [
        {
          type: "wiki",
          rootWikiId
        }
      ];
      dispatch(fetchSemanticRules(scope));
    }
  };

  render() {
    const {
      forumBoardId,
      forumBoard,
      parentDiscussionId,
      semanticReplaceMode
    } = this.props;
    const forumBoardName = forumBoard ? forumBoard.get("name") : "";
    const helmetTitle = `${this.state.title} - ${forumBoardName}`;
    return (
      <div>
        <Helmet title={helmetTitle} />
        <DiscussionDetail
          semanticReplaceMode={semanticReplaceMode}
          forumBoardId={forumBoardId}
          parentDiscussionId={parentDiscussionId}
          onSemanticToggle={this.onSemanticToggle}
        />
      </div>
    );
  }
}

const emptyThunkAction = () => {
  return Promise.resolve(null);
};

DiscussionDetailPage.need = []
  .concat(params => {
    const { parentDiscussionId, forumBoardId } = params;
    return dispatch => {
      const parentPromise = fetchDiscussion(parentDiscussionId)(dispatch);
      const childrenPromise = fetchDiscussions({ parentDiscussionId })(
        dispatch
      );
      let forumBoardPromise;
      if (forumBoardId) {
        forumBoardPromise = fetchForumBoardById(forumBoardId)(dispatch);
      }
      const ps = _.reject(
        [parentPromise, childrenPromise, forumBoardPromise],
        v => v === undefined
      );
      return Promise.all(ps);
    };
  })
  .concat((params, store) => {
    const { parentDiscussionId } = params;
    const parentDiscussion = getDiscussion(store, parentDiscussionId);
    if (parentDiscussion) {
      const forumBoardId = parentDiscussion.get("forumBoard");
      const forumBoard = getForumBoardById(store, forumBoardId);
      if (!forumBoard) {
        return fetchForumBoardById(forumBoardId);
      }
    }
    return emptyThunkAction;
  })
  .concat((params, store) => {
    const { parentDiscussionId } = params;
    const parentDiscussion = getDiscussion(store, parentDiscussionId);
    const title = parentDiscussion ? parentDiscussion.get("title") : undefined;
    return title ? setHeaderTitleThunk(title) : emptyThunkAction;
  });
// TODO
// optimize semanticReplace and then add to need for server-side.

function mapStateToProps(store, routerProps) {
  const { parentDiscussionId } = routerProps.params;
  let { semanticReplaceMode } = routerProps.location.query;
  semanticReplaceMode = semanticReplaceMode === "true";
  const parentDiscussion = getDiscussion(store, parentDiscussionId);
  let { forumBoardId } = routerProps.params;
  if (!forumBoardId) {
    forumBoardId = parentDiscussion
      ? parentDiscussion.get("forumBoard")
      : forumBoardId;
  }
  const forumBoard = getForumBoardById(store, forumBoardId);
  const title = parentDiscussion ? parentDiscussion.get("title") : undefined;
  return {
    title,
    forumBoardId,
    forumBoard,
    parentDiscussionId,
    semanticReplaceMode
  };
}

export default connect(mapStateToProps)(DiscussionDetailPage);
