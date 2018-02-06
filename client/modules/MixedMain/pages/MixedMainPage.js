import React from "react";
import qs from "qs";
import { fromJS } from "immutable";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import { replace } from "react-router-redux";

import compose from "recompose/compose";
import { withStyles } from "material-ui-next/styles";
import slideHeightStyle from "../../MyApp/styles/slideHeight";

import MixedMainTabs, {
  ROOT_DISCUSSIONS_SLIDE,
  ROOT_WIKI_OR_WIKI_SLIDE
} from "../components/MixedMainTabs";
import { setHeaderTitle } from "../../MyApp/MyAppActions";
import { fetchWikis } from "../../Wiki/WikiActions";
import { fetchRootWikiById } from "../../RootWiki/RootWikiActions";
import { getRootWiki } from "../../RootWiki/RootWikiReducer";
import { fetchForumBoardById } from "../../ForumBoard/ForumBoardActions";
import { getForumBoardById } from "../../ForumBoard/ForumBoardReducer";
import { fetchRootDiscussions } from "../../Discussion/DiscussionActions";
import { getCurrentAccessToken } from "../../User/UserReducer";
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
      const _setHeaderTitle = () => {
        const { forumBoardId, rootWikiId } = parsed;
        const state = getState();
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
      dispatch(_setHeaderTitle());
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
      dispatch(_setHeaderTitle());
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
    this.timeouts = [];
  }

  componentDidMount() {
    this.fetchComponentData();
    this.setLast();
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.location.pathname !== nextProps.location.pathname &&
      nextProps.dbIsInitialized
    ) {
      this.fetchComponentData({ tryMore: false }, nextProps);
    }
    this.setLast(nextProps);
  }

  componentWillUnmount() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts = [];
  }

  setLast = (props = this.props) => {
    this.lastForumBoardGroup = props.forumBoardGroup;
    this.lastRootWikiGroupTree = props.rootWikiGroupTree;
  };

  fetchComponentData = (options = {}, props = this.props) => {
    if (props.fetchComponentData) {
      return props.fetchComponentData(options);
    } else {
      return Promise.resolve(null);
    }
  };

  replaceURLBySlideIndex = slideIndex => {
    const { rootWiki, forumBoard } = this.props;
    const forumBoardId =
      this.props.forumBoardId || (rootWiki && rootWiki.get("forumBoard"));
    const rootWikiId =
      this.props.rootWikiId || (forumBoard && forumBoard.get("rootWiki"));
    const { location } = this.props;
    const currentURL = `${location.pathname}${location.search}`;
    if (slideIndex === ROOT_DISCUSSIONS_SLIDE) {
      let { forumBoardGroup } = this.props;
      forumBoardGroup = !forumBoardGroup
        ? this.lastForumBoardGroup
        : forumBoardGroup;
      const pathname = `/forumBoards/${forumBoardId}/rootDiscussions`;
      const search = forumBoardGroup
        ? `?forumBoardGroup=${encodeURIComponent(forumBoardGroup)}`
        : "";
      const url = `${pathname}${search}`;
      if (url !== currentURL) {
        this.timeouts.push(
          setTimeout(() => this.props.dispatch(replace(url)), 150)
        );
      }
    } else if (slideIndex === ROOT_WIKI_OR_WIKI_SLIDE) {
      let { rootWikiGroupTree } = this.props;
      rootWikiGroupTree = !rootWikiGroupTree
        ? this.lastRootWikiGroupTree
        : rootWikiGroupTree;
      if (rootWikiId && rootWikiGroupTree) {
        const query = qs.stringify({
          rootWikiGroupTree: rootWikiGroupTree.toJS
            ? rootWikiGroupTree.toJS()
            : rootWikiGroupTree
        });
        const url = `/rootWikis/${rootWikiId}/wikis?${query}`;
        if (url !== currentURL) {
          this.timeouts.push(
            setTimeout(() => this.props.dispatch(replace(url)), 150)
          );
        }
      } else if (rootWikiId) {
        const url = `/rootWikis/${rootWikiId}`;
        if (url !== currentURL) {
          this.timeouts.push(
            setTimeout(() => this.props.dispatch(replace(url)), 150)
          );
        }
      }
    }
  };

  handleTransitionEnd = slideIndex => {
    this.replaceURLBySlideIndex(slideIndex);
  };

  render() {
    const { title } = this.props;
    const metaDescription = "Tiamat | Game forum and wiki.";
    const meta = [
      {
        name: "description",
        content: metaDescription
      }
    ];
    const {
      targetKind,
      forumBoardId,
      forumBoard,
      rootWikiId,
      rootWiki,
      wiki,
      isWikis
    } = this.props;
    let { rootWikiGroupTree, forumBoardGroup } = this.props;
    rootWikiGroupTree = !rootWikiGroupTree
      ? this.lastRootWikiGroupTree
      : rootWikiGroupTree;
    forumBoardGroup = !forumBoardGroup
      ? this.lastForumBoardGroup
      : forumBoardGroup;
    return (
      <div>
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
          wiki={wiki}
          isWikis={isWikis}
        />
      </div>
    );
  }
}

function mapStateToProps(state, routerProps) {
  const parsed = parseRouterProps(routerProps);
  const { forumBoardGroup, rootWikiGroupTree, targetKind, slideIndex } = parsed;
  const accessToken = getCurrentAccessToken(state);
  const isWikis = routerProps.location.pathname.split("/").pop() === "wikis";
  const isRootDiscussions =
    routerProps.location.pathname.split("/").pop() === "rootDiscussions";
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
    dbIsInitialized,
    targetKind,
    accessToken,
    isWikis,
    isRootDiscussions,
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

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(MixedMainPage);
