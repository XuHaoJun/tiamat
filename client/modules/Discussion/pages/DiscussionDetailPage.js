import React from "react";
import { connect } from "react-redux";
import Helmet from "react-helmet";

import { replace } from "react-router-redux";

import { fetchDiscussion, fetchDiscussions } from "../DiscussionActions";
import { getDiscussion } from "../DiscussionReducer";
import { fetchForumBoardById } from "../../ForumBoard/ForumBoardActions";
import { getForumBoardById } from "../../ForumBoard/ForumBoardReducer";
import { setHeaderTitle } from "../../MyApp/MyAppActions";
import { fetchSemanticRules } from "../../SemanticRule/SemanticRuleActions";
import DiscussionDetail from "../components/DiscussionDetail";

class DiscussionDetailPage extends React.Component {
  static getInitialAction({ routerProps }, { tryMore } = { tryMore: false }) {
    const { parentDiscussionId } = routerProps.match.params;
    return async (dispatch, getState) => {
      const _setHeaderTitle = () => {
        const parentDiscussion = getDiscussion(getState(), parentDiscussionId);
        const title = parentDiscussion
          ? parentDiscussion.get("title")
          : "Loading...";
        return setHeaderTitle(title);
      };
      dispatch(_setHeaderTitle());
      await Promise.all(
        [
          fetchDiscussion(parentDiscussionId),
          fetchDiscussions({ parentDiscussionId })
        ].map(dispatch)
      );
      dispatch(_setHeaderTitle());
      if (tryMore) {
        const parentDiscussion = getDiscussion(getState(), parentDiscussionId);
        if (parentDiscussion && parentDiscussion.get("forumBoard")) {
          const forumBoardId = parentDiscussion.get("forumBoard");
          await dispatch(fetchForumBoardById(forumBoardId));
          const forumBoard = getForumBoardById(getState(), forumBoardId);
          if (forumBoard) {
            const rootWikiId = forumBoard ? forumBoard.get("rootWiki") : "";
            if (rootWikiId) {
              const scope = [
                {
                  type: "wiki",
                  rootWikiId
                }
              ];
              return dispatch(fetchSemanticRules(scope));
            } else {
              return Promise.resolve(null);
            }
          } else {
            return Promise.resolve(null);
          }
        } else {
          return Promise.resolve(null);
        }
      } else {
        return Promise.resolve(null);
      }
    };
  }

  componentDidMount() {
    this.fetchComponentData();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.fetchComponentData(nextProps);
    }
  }

  onSemanticToggle = (event, nextSemanticReplaceMode) => {
    const { parentDiscussionId, semanticReplaceMode } = this.props;
    if (semanticReplaceMode !== nextSemanticReplaceMode) {
      if (nextSemanticReplaceMode) {
        this.props.dispatch(
          replace(
            `/rootDiscussions/${parentDiscussionId}?semanticReplaceMode=true`
          )
        );
      } else {
        this.props.dispatch(replace(`/rootDiscussions/${parentDiscussionId}`));
      }
    }
  };

  getHelmetTitle = (props = this.props) => {
    const { parentDiscussion, forumBoard } = props;
    if (parentDiscussion) {
      const title = parentDiscussion.get("title");
      if (forumBoard) {
        const name = forumBoard.get("name");
        return `${title} - ${name}`;
      } else {
        return title;
      }
    } else {
      return "Loading...";
    }
  };

  fetchComponentData = (props = this.props) => {
    if (props.fetchComponentData) {
      return props.fetchComponentData();
    } else {
      return null;
    }
  };

  render() {
    const {
      forumBoardId,
      parentDiscussionId,
      semanticReplaceMode
    } = this.props;
    const helmetTitle = this.getHelmetTitle();
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

function mapStateToProps(store, routerProps) {
  const { parentDiscussionId } = routerProps.match.params;
  let { semanticReplaceMode } = routerProps.location.query;
  semanticReplaceMode = semanticReplaceMode === "true";
  const parentDiscussion = getDiscussion(store, parentDiscussionId);
  let { forumBoardId } = routerProps.match.params;
  if (!forumBoardId) {
    forumBoardId = parentDiscussion
      ? parentDiscussion.get("forumBoard")
      : forumBoardId;
  }
  const forumBoard = getForumBoardById(store, forumBoardId);
  return {
    parentDiscussionId,
    parentDiscussion,
    forumBoardId,
    forumBoard,
    semanticReplaceMode
  };
}

function mapDispatchToProps(dispatch, routerProps) {
  return {
    fetchComponentData() {
      const action = DiscussionDetailPage.getInitialAction(
        { routerProps },
        { tryMore: true }
      );
      return dispatch(action);
    },
    dispatch
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  DiscussionDetailPage
);
