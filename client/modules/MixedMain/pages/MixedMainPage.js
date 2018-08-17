import React from "react";
import qs from "qs";
import { fromJS } from "immutable";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import { hot } from "react-hot-loader";

import compose from "recompose/compose";
import { withStyles } from "@material-ui/core/styles";
import slideHeightStyle from "../../MyApp/styles/slideHeight";

import MixedMainTabs, {
  ROOT_DISCUSSIONS_SLIDE,
  ROOT_WIKI_OR_WIKI_SLIDE
} from "../components/MixedMainTabs";

/* Actions and Selectors */
import { replace } from "react-router-redux";
import { fetchWikis } from "../../Wiki/WikiActions";
import { fetchRootWikiById } from "../../RootWiki/RootWikiActions";
import { getRootWiki } from "../../RootWiki/RootWikiReducer";

import { fetchForumBoardById } from "../../ForumBoard/ForumBoardActions";
import { getForumBoardById } from "../../ForumBoard/ForumBoardReducer";

import { DiscussionRemote } from "../../Discussion/DiscussionActions";

import { getCurrentAccessToken } from "../../User/UserReducer";

import { setHeaderTitle } from "../../MyApp/MyAppActions";
import { getDBisInitialized } from "../../MyApp/MyAppReducer";

export const styles = theme => {
  return {
    slideHeight: slideHeightStyle(theme, {
      withTab: true,
      withAppBar: true
    }).slideHeight,
    slideHeightWithoutAppBar: slideHeightStyle(theme, {
      withTab: true,
      withAppBar: false
    }).slideHeight
  };
};

function normalizeRouterProps(routerProps) {
  const {
    forumBoardGroup,
    rootWikiGroupTree: rootWikiGroupTreeInput
  } = routerProps.location.query;
  const rootWikiGroupTree = fromJS(rootWikiGroupTreeInput);
  const leafRoute = routerProps.route;
  const { targetKind } = leafRoute;
  const { forumBoardId, rootWikiId } = routerProps.match.params;
  const slideIndex =
    targetKind === "rootDiscussions"
      ? ROOT_DISCUSSIONS_SLIDE
      : ROOT_WIKI_OR_WIKI_SLIDE;
  return {
    forumBoardId,
    rootWikiId,
    forumBoardGroup,
    rootWikiGroupTree,
    targetKind,
    slideIndex
  };
}

class MixedMainPage extends React.Component {
  static getInitialAction(
    { routerProps: routerPropsInput },
    { tryMore } = { tryMore: false }
  ) {
    const routerProps = normalizeRouterProps(routerPropsInput);
    return async (dispatch, getState) => {
      const _setHeaderTitle = state => {
        const { forumBoardId, rootWikiId } = routerProps;
        const forumBoard = forumBoardId
          ? getForumBoardById(state, forumBoardId)
          : null;
        const rootWiki = rootWikiId ? getRootWiki(state, rootWikiId) : null;
        const fName = forumBoard ? forumBoard.get("name") : "";
        const rName = rootWiki ? rootWiki.get("name") : "";
        const title = fName || rName || "Loading...";
        return setHeaderTitle(title);
      };
      // set default title before fetch.
      dispatch(_setHeaderTitle(getState()));
      // fetch
      const { targetKind } = routerProps;
      await (() => {
        switch (targetKind) {
          case "rootDiscussions": {
            const { forumBoardId, forumBoardGroup } = routerProps;
            return Promise.all(
              [
                fetchForumBoardById(forumBoardId),
                DiscussionRemote.getRootDiscussions(forumBoardId, {
                  forumBoardGroup,
                  select: { content: 0 }
                })
              ].map(dispatch)
            );
          }
          case "wikis": {
            const { rootWikiId, rootWikiGroupTree } = routerProps;
            return Promise.all(
              [
                fetchRootWikiById(rootWikiId),
                fetchWikis(rootWikiId, { rootWikiGroupTree })
              ].map(dispatch)
            );
          }
          case "rootWiki": {
            const { rootWikiId } = routerProps;
            return dispatch(fetchRootWikiById(rootWikiId));
          }
          default: {
            return Promise.resolve(null);
          }
        }
      })();
      // update title after fetch.
      dispatch(_setHeaderTitle(getState()));
      // tryMore
      if (tryMore) {
        const { forumBoardId, rootWikiId } = routerProps;
        const forumBoard = forumBoardId
          ? getForumBoardById(getState(), forumBoardId)
          : null;
        const rootWiki = rootWikiId
          ? getRootWiki(getState(), rootWikiId)
          : null;
        if (forumBoard && forumBoard.get("rootWiki") && !rootWiki) {
          await dispatch(fetchRootWikiById(forumBoard.get("rootWiki")));
        }
        if (rootWiki && rootWiki.get("forumBoard") && !forumBoard) {
          await dispatch(fetchForumBoardById(rootWiki.get("forumBoard")));
        }
      }
    };
  }

  constructor(props) {
    super(props);
    this.oldProps = {
      [props.targetKind]: props
    };
    this.rootOrWikisSlideKind = "rootWiki";
    this.setRootOrWikisSlideKind(props.targetKind);
  }

  componentDidMount() {
    this.fetchComponentData();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.url !== nextProps.url && nextProps.dbIsInitialized) {
      this.fetchComponentData({ tryMore: false }, nextProps);
    }
    if (
      nextProps.forumBoardId !== this.props.forumBoardId ||
      nextProps.rootWikiId !== this.props.rootWikiId
    ) {
      this.oldProps = {};
    }
    this.oldProps[this.props.targetKind] = this.props;
    this.setRootOrWikisSlideKind(nextProps.targetKind);
  }

  setRootOrWikisSlideKind = targetKind => {
    if (targetKind === "wikis" || targetKind === "rootWiki") {
      this.rootOrWikisSlideKind = targetKind;
    }
  };

  fetchComponentData = (options = {}, props = this.props) => {
    if (props.fetchComponentData) {
      return props.fetchComponentData(options);
    } else {
      return Promise.resolve(null);
    }
  };

  replaceURLBySlideIndex = slideIndex => {
    if (slideIndex === ROOT_DISCUSSIONS_SLIDE) {
      const { forumBoardId } = this.props;
      const { forumBoardGroup } =
        this.props.targetKind !== "rootDiscussions"
          ? this.oldProps.rootDiscussions || this.props
          : this.props;
      const pathname = `/forumBoards/${forumBoardId}/rootDiscussions`;
      const search = forumBoardGroup
        ? `?forumBoardGroup=${encodeURIComponent(forumBoardGroup)}`
        : "";
      const url = `${pathname}${search}`;
      if (forumBoardId) {
        this.props.dispatch(replace(url));
      }
    } else if (slideIndex === ROOT_WIKI_OR_WIKI_SLIDE) {
      if (this.rootOrWikisSlideKind === "wikis") {
        const { rootWikiId } = this.props;
        const { rootWikiGroupTree } =
          this.props.targetKind !== "wikis"
            ? this.oldProps.wikis || this.props
            : this.props;
        const query = qs.stringify({
          rootWikiGroupTree:
            rootWikiGroupTree && rootWikiGroupTree.toJS
              ? rootWikiGroupTree.toJS()
              : rootWikiGroupTree
        });
        const url = `/rootWikis/${rootWikiId}/wikis?${query}`;
        if (rootWikiId) {
          this.props.dispatch(replace(url));
        }
      } else {
        const { rootWikiId } =
          this.props.targetKind !== "rootWiki"
            ? this.oldProps.rootWiki || this.props
            : this.props;
        if (rootWikiId) {
          const url = `/rootWikis/${rootWikiId}`;
          this.props.dispatch(replace(url));
        }
      }
    }
  };

  handleTransitionEnd = slideIndex => {
    this.replaceURLBySlideIndex(slideIndex);
  };

  render() {
    const metaDescription = "Tiamat | Game forum and wiki.";
    const meta = [
      {
        name: "description",
        content: metaDescription
      }
    ];
    const {
      title,
      targetKind,
      forumBoardId,
      forumBoard,
      rootWikiId,
      rootWiki
    } = this.props;
    const { forumBoardGroup } =
      this.props.targetKind !== "rootDiscussions"
        ? this.oldProps.rootDiscussions || this.props
        : this.props;
    const { rootWikiGroupTree } =
      this.props.targetKind !== "wikis"
        ? this.oldProps.wikis || this.props
        : this.props;
    return (
      <React.Fragment>
        <Helmet title={title} meta={meta} />
        <MixedMainTabs
          // ui
          id="MixedMainPage/MixedMainTabs"
          slideClassName={this.props.classes.slideHeight}
          onTransitionEnd={this.handleTransitionEnd}
          slideIndex={this.props.slideIndex}
          //
          targetKind={targetKind}
          forumBoardId={forumBoardId}
          forumBoard={forumBoard}
          forumBoardGroup={forumBoardGroup}
          //
          rootWikiId={rootWikiId}
          rootWiki={rootWiki}
          rootWikiGroupTree={rootWikiGroupTree}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state, routerProps) {
  const parsed = normalizeRouterProps(routerProps);
  const { forumBoardGroup, rootWikiGroupTree, targetKind, slideIndex } = parsed;
  const accessToken = getCurrentAccessToken(state);
  let { forumBoardId, rootWikiId } = parsed;
  let forumBoard = getForumBoardById(state, forumBoardId);
  if (!rootWikiId && forumBoard) {
    rootWikiId = forumBoard.rootWiki;
  }
  const rootWiki = getRootWiki(state, rootWikiId);
  if (!forumBoardId && rootWiki) {
    forumBoardId = rootWiki.forumBoard;
  }
  if (!forumBoard) {
    forumBoard = getForumBoardById(state, forumBoardId);
  }
  const forumBoardName = forumBoard ? forumBoard.name : "";
  const rootWikiName = rootWiki ? rootWiki.name : "";
  const title = rootWikiName || forumBoardName;
  const dbIsInitialized = getDBisInitialized(state);
  return {
    url: routerProps.match.url,
    dbIsInitialized,
    targetKind,
    accessToken,
    slideIndex,
    title,
    forumBoardId,
    forumBoard,
    forumBoardGroup,
    rootWikiId,
    rootWiki,
    rootWikiGroupTree
  };
}

function mapDispatchToProps(dispatch, routerProps) {
  return {
    fetchComponentData(options = {}) {
      const action = MixedMainPage.getInitialAction(
        { routerProps },
        { tryMore: true, ...options }
      );
      return dispatch(action);
    },
    dispatch
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  const { classes } = ownProps;
  return { ...stateProps, ...dispatchProps, classes };
}

export default compose(
  hot(module),
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps, mergeProps)
)(MixedMainPage);
