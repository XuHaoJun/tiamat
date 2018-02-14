import React from "react";
import qs from "qs";
import { fromJS } from "immutable";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import { hot } from "react-hot-loader";
import _omitBy from "lodash/omitBy";
import _isEmpty from "lodash/isEmpty";

import compose from "recompose/compose";
import { withStyles } from "material-ui-next/styles";
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

import { fetchRootDiscussions } from "../../Discussion/DiscussionActions";

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

function parseRouterProps(routerProps) {
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
  static propTypes = {
    title: PropTypes.string
  };

  static defaultProps = {
    title: "Loading..."
  };

  static getInitialAction({ routerProps }, { tryMore } = { tryMore: false }) {
    const parsed = parseRouterProps(routerProps);
    return async (dispatch, getState) => {
      const _setHeaderTitle = state => {
        const { forumBoardId, rootWikiId } = parsed;
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
      const { targetKind } = parsed;
      await (() => {
        if (targetKind === "rootDiscussions") {
          const { forumBoardId, forumBoardGroup } = parsed;
          return Promise.all(
            [
              fetchForumBoardById(forumBoardId),
              fetchRootDiscussions(forumBoardId, { forumBoardGroup })
            ].map(dispatch)
          );
        } else if (targetKind === "wikis") {
          const { rootWikiId, rootWikiGroupTree } = parsed;
          return Promise.all(
            [
              fetchRootWikiById(rootWikiId),
              fetchWikis(rootWikiId, { rootWikiGroupTree })
            ].map(dispatch)
          );
        } else if (targetKind === "rootWiki") {
          const { rootWikiId } = parsed;
          return dispatch(fetchRootWikiById(rootWikiId));
        } else {
          return Promise.resolve(null);
        }
      })();
      // update title after fetch.
      dispatch(_setHeaderTitle(getState()));
      // tryMore
      if (tryMore) {
        const { forumBoardId, rootWikiId } = parsed;
        const state = getState();
        const forumBoard = forumBoardId
          ? getForumBoardById(state, forumBoardId)
          : null;
        const rootWiki = rootWikiId ? getRootWiki(state, rootWikiId) : null;
        if (forumBoard && forumBoard.get("rootWiki") && !rootWiki) {
          return dispatch(fetchRootWikiById(forumBoard.get("rootWiki")));
        } else if (rootWiki && rootWiki.get("forumBoard") && !forumBoard) {
          return dispatch(fetchForumBoardById(rootWiki.get("forumBoard")));
        } else {
          return Promise.resolve(null);
        }
      } else {
        return Promise.resolve(null);
      }
    };
  }

  constructor(props) {
    super(props);
    this.state = this.createStateByProps(props);
    this.rootOrWikisSlideKind = "rootWiki";
    this.setRootOrWikisSlideKind(props);
  }

  componentDidMount() {
    this.fetchComponentData();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.url !== nextProps.url && nextProps.dbIsInitialized) {
      this.fetchComponentData({ tryMore: false }, nextProps);
    }
    this.setRootOrWikisSlideKind(nextProps);
    this.setState(this.createStateByProps(nextProps));
  }

  setRootOrWikisSlideKind = (props = this.props) => {
    if (props.targetKind === "wikis" || props.targetKind === "rootWiki") {
      this.rootOrWikisSlideKind = props.targetKind;
    }
  };

  createStateByProps = (propsInput = this.props) => {
    const props = _omitBy(propsInput, _isEmpty);
    const state = {
      ...props
    };
    return state;
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
      const { forumBoardId, forumBoardGroup } = this.state;
      const pathname = `/forumBoards/${forumBoardId}/rootDiscussions`;
      const search = forumBoardGroup
        ? `?forumBoardGroup=${encodeURIComponent(forumBoardGroup)}`
        : "";
      const url = `${pathname}${search}`;
      this.props.dispatch(replace(url));
    } else if (slideIndex === ROOT_WIKI_OR_WIKI_SLIDE) {
      if (this.rootOrWikisSlideKind === "wikis") {
        const { rootWikiId, rootWikiGroupTree } = this.state;
        const query = qs.stringify({
          rootWikiGroupTree:
            rootWikiGroupTree && rootWikiGroupTree.toJS
              ? rootWikiGroupTree.toJS()
              : rootWikiGroupTree
        });
        const url = `/rootWikis/${rootWikiId}/wikis?${query}`;
        this.props.dispatch(replace(url));
      } else {
        const { rootWikiId } = this.state;
        const url = `/rootWikis/${rootWikiId}`;
        this.props.dispatch(replace(url));
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
      rootWiki,
      rootWikiGroupTree,
      forumBoardGroup
    } = this.state;
    return (
      <React.Fragment>
        <Helmet title={title} meta={meta} />
        <MixedMainTabs
          // ui
          id="MixedMainPage/MixedMainTabs"
          slideClassName={this.props.classes.slideHeight}
          onTransitionEnd={this.handleTransitionEnd}
          slideIndex={this.props.slideIndex}
          // data
          targetKind={targetKind}
          forumBoardId={forumBoardId}
          forumBoard={forumBoard}
          forumBoardGroup={forumBoardGroup}
          rootWikiId={rootWikiId}
          rootWiki={rootWiki}
          rootWikiGroupTree={rootWikiGroupTree}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state, routerProps) {
  const parsed = parseRouterProps(routerProps);
  const { forumBoardGroup, rootWikiGroupTree, targetKind, slideIndex } = parsed;
  const accessToken = getCurrentAccessToken(state);
  let { forumBoardId, rootWikiId } = parsed;
  let forumBoard = getForumBoardById(state, forumBoardId);
  if (!rootWikiId && forumBoard) {
    rootWikiId = forumBoard.get("rootWiki");
  }
  const rootWiki = getRootWiki(state, rootWikiId);
  if (!forumBoardId && rootWiki) {
    forumBoardId = rootWiki.get("forumBoard");
  }
  if (!forumBoard) {
    forumBoard = getForumBoardById(state, forumBoardId);
  }
  const forumBoardName = forumBoard ? forumBoard.get("name") : "";
  const rootWikiName = rootWiki ? rootWiki.get("name") : "";
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
