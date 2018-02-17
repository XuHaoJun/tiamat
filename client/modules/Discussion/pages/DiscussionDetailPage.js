import React from "react";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import { hot } from "react-hot-loader";
import compose from "recompose/compose";
import qs from "qs";

import { withStyles } from "material-ui-next/styles";
import slideHeightStyles from "../../MyApp/styles/slideHeight";

import DiscussionDetail from "../components/DiscussionDetail";

import { replace } from "react-router-redux";
import { getDiscussionById } from "../DiscussionReducer";
import { fetchForumBoardById } from "../../ForumBoard/ForumBoardActions";
import { setHeaderTitle } from "../../MyApp/MyAppActions";
import { fetchSemanticRules } from "../../SemanticRule/SemanticRuleActions";
import { getForumBoardById } from "../../ForumBoard/ForumBoardReducer";
import {
  fetchDiscussionById,
  fetchDiscussions,
  fetchDiscussionByTest
} from "../DiscussionActions";

function styles(theme) {
  const heightStyle = slideHeightStyles(theme);
  return {
    root: {
      ...heightStyle.slideHeight,
      width: "100vw",
      maxWidth: "100vw"
    }
  };
}

class DiscussionDetailPage extends React.Component {
  static getInitialAction(
    { routerProps },
    { tryMore = false } = { tryMore: false }
  ) {
    const { parentDiscussionId } = routerProps.match.params;
    return async (dispatch, getState) => {
      const _setHeaderTitle = state => {
        const parentDiscussion = getDiscussionById(state, parentDiscussionId);
        const title = parentDiscussion
          ? parentDiscussion.get("title")
          : "Loading...";
        return setHeaderTitle(title);
      };
      dispatch(_setHeaderTitle(getState()));
      await Promise.all(
        [
          fetchDiscussionById(parentDiscussionId),
          fetchDiscussions({ parentDiscussionId })
        ].map(dispatch)
      );
      dispatch(_setHeaderTitle(getState()));
      if (tryMore) {
        const _tryForumBoardAndRootWiki = async state => {
          const parentDiscussion = getDiscussionById(state, parentDiscussionId);
          if (parentDiscussion) {
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
                await dispatch(fetchSemanticRules(scope));
              }
            }
          }
        };
        const _tryNextAndPrevParentDiscussion = async state => {
          const parentDiscussion = getDiscussionById(state, parentDiscussionId);
          if (parentDiscussion) {
            const updatedAt = parentDiscussion.get("updatedAt");
            const isRoot = parentDiscussion.get("isRoot");
            const forumBoardId = parentDiscussion.get("forumBoard");
            const nextParentTest = {
              _id: {
                $ne: parentDiscussionId
              },
              forumBoard: forumBoardId,
              isRoot,
              updatedAt: {
                $lte: updatedAt
              }
            };
            const prevParentTest = {
              ...nextParentTest,
              updatedAt: {
                $gte: updatedAt
              }
            };
            const select = { content: 0 };
            await Promise.all(
              [
                fetchDiscussionByTest(nextParentTest, {
                  select,
                  sort: {
                    updatedAt: -1
                  }
                }),
                fetchDiscussionByTest(prevParentTest, {
                  select,
                  sort: { updatedAt: 1 }
                })
              ].map(dispatch)
            );
          }
        };
        await Promise.all([
          _tryForumBoardAndRootWiki(getState()),
          _tryNextAndPrevParentDiscussion(getState())
        ]);
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
      const q = qs.stringify({
        ...this.props.query,
        semanticReplaceMode: nextSemanticReplaceMode ? true : undefined
      });
      this.props.dispatch(replace(`/discussions/${parentDiscussionId}?${q}`));
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
    query: routerProps.location.query,
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
