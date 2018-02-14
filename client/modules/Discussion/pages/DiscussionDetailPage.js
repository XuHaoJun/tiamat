import React from "react";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import { hot } from "react-hot-loader";
import compose from "recompose/compose";

import { withStyles } from "material-ui-next/styles";
import slideHeightStyles from "../../MyApp/styles/slideHeight";

import DiscussionDetail from "../components/DiscussionDetail";

import { replace } from "react-router-redux";
import { getDiscussionById } from "../DiscussionReducer";
import { fetchForumBoardById } from "../../ForumBoard/ForumBoardActions";
import { setHeaderTitle } from "../../MyApp/MyAppActions";
import { fetchSemanticRules } from "../../SemanticRule/SemanticRuleActions";
import { getForumBoardById } from "../../ForumBoard/ForumBoardReducer";
import { fetchDiscussionById, fetchDiscussions } from "../DiscussionActions";

function styles(theme) {
  const heightStyle = slideHeightStyles(theme);
  return {
    root: {
      ...heightStyle.slideHeight,
      overflow: "auto"
    }
  };
}

class DiscussionDetailPage extends React.Component {
  static getInitialAction({ routerProps }, { tryMore } = { tryMore: false }) {
    const { parentDiscussionId } = routerProps.match.params;
    return async (dispatch, getState) => {
      const _setHeaderTitle = () => {
        const parentDiscussion = getDiscussionById(
          getState(),
          parentDiscussionId
        );
        const title = parentDiscussion
          ? parentDiscussion.get("title")
          : "Loading...";
        return setHeaderTitle(title);
      };
      dispatch(_setHeaderTitle());
      await Promise.all(
        [
          fetchDiscussionById(parentDiscussionId),
          fetchDiscussions({ parentDiscussionId })
        ].map(dispatch)
      );
      dispatch(_setHeaderTitle());
      if (tryMore) {
        const parentDiscussion = getDiscussionById(
          getState(),
          parentDiscussionId
        );
        if (parentDiscussion) {
          const forumBoardId = parentDiscussion.get("forumBoard");
          if (forumBoardId) {
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
                await dispatch(fetchSemanticRules(scope));
              }
            }
          }
        }
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

  handleSemanticToggle = (event, nextSemanticReplaceMode) => {
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

  render() {
    const {
      forumBoardId,
      parentDiscussionId,
      semanticReplaceMode,
      classes
    } = this.props;
    const helmetTitle = this.getHelmetTitle();
    return (
      <React.Fragment>
        <Helmet title={helmetTitle} />
        <div className={classes.root}>
          <DiscussionDetail
            id="DiscussionDetailPage/DiscussionDetail"
            semanticReplaceMode={semanticReplaceMode}
            forumBoardId={forumBoardId}
            parentDiscussionId={parentDiscussionId}
            onSemanticToggle={this.handleSemanticToggle}
          />
        </div>
      </React.Fragment>
    );
  }
}

function mapStateToProps(store, routerProps) {
  const { parentDiscussionId } = routerProps.match.params;
  let { semanticReplaceMode } = routerProps.location.query;
  semanticReplaceMode = semanticReplaceMode === "true";
  const parentDiscussion = getDiscussionById(store, parentDiscussionId);
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
        { tryMore: process.browser }
      );
      return dispatch(action);
    },
    dispatch
  };
}

export default compose(
  withStyles(styles),
  hot(module),
  connect(mapStateToProps, mapDispatchToProps)
)(DiscussionDetailPage);
