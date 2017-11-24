import React from "react";
import memoize from "fast-memoize";
import qs from "qs";
import { fromJS } from "immutable";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import Debug from "debug";

import MixedMainTabs, {
  FORUMBOARD_GROUPS_SLIDE,
  ROOT_DISCUSSIONS_SLIDE,
  ROOT_WIKI_GROUPS_SLIDE,
  ROOT_WIKI_OR_WIKI_SLIDE
} from "../components/MixedMainTabs";
import { setHeaderTitle, setHeaderTitleThunk } from "../../MyApp/MyAppActions";
import { fetchWikis } from "../../Wiki/WikiActions";
import { fetchRootWikiById } from "../../RootWiki/RootWikiActions";
import { getRootWiki } from "../../RootWiki/RootWikiReducer";
import { fetchForumBoardById } from "../../ForumBoard/ForumBoardActions";
import { getForumBoardById } from "../../ForumBoard/ForumBoardReducer";
import { fetchRootDiscussions } from "../../Discussion/DiscussionActions";
import { createSocket, removeSocket } from "../../Socket/SocketActions";
import { getCurrentAccessToken } from "../../User/UserReducer";

const debug = Debug("app:MixedMainPage");

class MixedMainPage extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    browser: PropTypes.object.isRequired
  };

  static defaultProps = {
    title: "Redirecting..."
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.timeouts = [];
  }

  componentWillMount() {
    const { title } = this.props;
    this.props.dispatch(setHeaderTitle(title));
  }

  componentDidMount() {
    const {
      dispatch,
      forumBoardId,
      forumBoardGroup,
      forumBoard,
      rootWikiGroupTree
    } = this.props;
    const rootWikiId =
      this.props.rootWikiId || (forumBoard && forumBoard.get("rootWiki"));
    if (forumBoardId) {
      dispatch(fetchForumBoardById(forumBoardId));
      dispatch(fetchRootDiscussions(forumBoardId, { forumBoardGroup }));
      if (forumBoardGroup) {
        this.lastForumBoardGroup = forumBoardGroup;
      }
    }
    if (rootWikiId) {
      dispatch(fetchRootWikiById(rootWikiId));
      if (rootWikiGroupTree) {
        dispatch(fetchWikis(rootWikiId, { rootWikiGroupTree }));
        this.lastRootWikiGroupTree = rootWikiGroupTree;
      }
    }
    if (forumBoardId) {
      const { accessToken } = this.props;
      dispatch(
        createSocket(`/forumBoards/${forumBoardId}/discussions`, {
          accessToken
        })
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    const { title } = nextProps;
    if (this.props.title !== title) {
      this.props.dispatch(setHeaderTitle(title));
    }
    const {
      dispatch,
      forumBoard,
      rootWiki,
      forumBoardGroup,
      rootWikiGroupTree
    } = nextProps;
    const rootWikiId =
      nextProps.rootWikiId || (forumBoard && forumBoard.get("rootWiki"));
    const forumBoardId =
      nextProps.forumBoardId || (rootWiki && rootWiki.get("forumBoard"));
    if (forumBoardId) {
      dispatch(fetchForumBoardById(forumBoardId));
      dispatch(fetchRootDiscussions(forumBoardId, { forumBoardGroup }));
      if (nextProps.isRootDiscussions) {
        this.lastForumBoardGroup = forumBoardGroup;
      }
    }
    if (rootWikiId) {
      dispatch(fetchRootWikiById(rootWikiId));
      if (rootWikiGroupTree) {
        dispatch(fetchWikis(rootWikiId, { rootWikiGroupTree }));
      }
      if (!nextProps.isRootDiscussions) {
        this.lastRootWikiGroupTree = rootWikiGroupTree;
      }
    }
    if (this.props.forumBoardId !== nextProps.forumBoardId) {
      dispatch(
        removeSocket(`/forumBoards/${this.props.forumBoardId}/discussions`)
      );
    }
  }

  componentWillUnmount() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts = [];
    this.props.dispatch(
      removeSocket(`/forumBoards/${this.props.forumBoardId}/discussions`)
    );
  }

  handleTransitionEnd = slideIndex => {
    const { rootWiki, forumBoard } = this.props;
    const forumBoardId =
      this.props.forumBoardId || (rootWiki && rootWiki.get("forumBoard"));
    const rootWikiId =
      this.props.rootWikiId || (forumBoard && forumBoard.get("rootWiki"));
    const { router } = this.context;
    const currentURL = `${router.location.pathname}${router.location.search}`;
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
        this.timeouts.push(setTimeout(() => router.replace(url), 150));
      }
    } else if (slideIndex === ROOT_WIKI_OR_WIKI_SLIDE) {
      let { rootWikiGroupTree } = this.props;
      rootWikiGroupTree = !rootWikiGroupTree
        ? this.lastRootWikiGroupTree
        : rootWikiGroupTree;
      if (rootWikiId && rootWikiGroupTree) {
        const query = qs.stringify({
          rootWikiGroupTree: rootWikiGroupTree.toJSON
            ? rootWikiGroupTree.toJSON()
            : rootWikiGroupTree
        });
        const url = `/rootWikis/${rootWikiId}/wikis?${query}`;
        if (url !== currentURL) {
          this.timeouts.push(setTimeout(() => router.replace(url), 150));
        }
      } else if (rootWikiId) {
        const url = `/rootWikis/${rootWikiId}`;
        if (url !== currentURL) {
          this.timeouts.push(setTimeout(() => router.replace(url), 150));
        }
      }
    }
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
      forumBoardId,
      forumBoard,
      rootWikiId,
      rootWiki,
      wiki,
      isWikis
    } = this.props;
    const { browser } = this.props;
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
          scrollKey="MixedMainPage/MixedMainTabs"
          forumBoardId={forumBoardId}
          forumBoard={forumBoard}
          forumBoardGroup={forumBoardGroup}
          rootWikiId={rootWikiId}
          rootWiki={rootWiki}
          rootWikiGroupTree={rootWikiGroupTree}
          wiki={wiki}
          isWikis={isWikis}
          onTransitionEnd={this.handleTransitionEnd}
          slideIndex={this.props.slideIndex}
          disableOnDrawerStart={true}
          browser={browser}
        />
      </div>
    );
  }
}

const emptyThunkAction = () => {
  return Promise.resolve(null);
};

// TODO
// optimize need by Promise.all by default need behavior is sequence
MixedMainPage.need = []
  .concat(params => {
    const { forumBoardId } = params;
    return forumBoardId ? fetchForumBoardById(forumBoardId) : emptyThunkAction;
  })
  .concat((params, store, query) => {
    const { forumBoardId } = params;
    const { forumBoardGroup } = query;
    return forumBoardId
      ? fetchRootDiscussions(forumBoardId, { forumBoardGroup })
      : emptyThunkAction;
  })
  .concat(params => {
    const { rootWikiId } = params;
    return rootWikiId ? fetchRootWikiById(rootWikiId) : emptyThunkAction;
  })
  .concat((params, store) => {
    let { rootWikiId } = params;
    const { forumBoardId } = params;
    const forumBoard = forumBoardId
      ? getForumBoardById(store, forumBoardId)
      : null;
    rootWikiId = rootWikiId || (forumBoard && forumBoard.get("rootWiki"));
    return rootWikiId ? fetchWikis(rootWikiId) : emptyThunkAction;
  })
  .concat((params, store) => {
    const { forumBoardId, rootWikiId } = params;
    const forumBoard = forumBoardId
      ? getForumBoardById(store, forumBoardId)
      : null;
    const rootWiki = rootWikiId ? getRootWiki(store, rootWikiId) : null;
    const fName = forumBoard ? forumBoard.get("name") : "";
    const rName = rootWiki ? rootWiki.get("name") : "";
    const title = fName || rName;
    return title ? setHeaderTitleThunk(title) : emptyThunkAction;
  });

const parseRootWikiGroupTree = memoize(queryString => {
  if (!queryString) {
    return queryString;
  }
  // TODO
  // let depth limit to 3 or 4?
  const parsed = qs.parse(queryString, { depth: Infinity });
  const { rootWikiGroupTree } = parsed;
  return fromJS(rootWikiGroupTree);
});

function mapStateToProps(store, routerProps) {
  const accessToken = getCurrentAccessToken(store);
  const { forumBoardGroup } = routerProps.location.query;
  const rootWikiGroupTree = parseRootWikiGroupTree(
    routerProps.location.search.length > 0
      ? routerProps.location.search.slice(1)
      : ""
  );
  const isWikis = routerProps.location.pathname.split("/").pop() === "wikis";
  const isRootDiscussions =
    routerProps.location.pathname.split("/").pop() === "rootDiscussions";
  let { forumBoardId, rootWikiId } = routerProps.params;
  let forumBoard = getForumBoardById(store, forumBoardId);
  if (!rootWikiId && forumBoard) {
    rootWikiId = forumBoard.get("rootWiki");
  }
  const rootWiki = getRootWiki(store, rootWikiId);
  if (rootWiki) {
    forumBoardId = rootWiki.get("forumBoard");
  }
  if (!forumBoard) {
    forumBoard = getForumBoardById(store, forumBoardId);
  }
  const forumBoardName = forumBoard ? forumBoard.get("name") : "";
  const rootWikiName = rootWiki ? rootWiki.get("name") : "";
  const { browser } = store;
  let slideIndex = 1;
  const slideIndexMapping = {
    forumBoardId: 1,
    rootWikiId: 3
  };
  for (const key in routerProps.params) {
    if ({}.hasOwnProperty.call(routerProps.params, key)) {
      slideIndex = slideIndexMapping[key];
    }
  }
  const title = forumBoardName || rootWikiName;
  return {
    accessToken,
    browser,
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

export default connect(mapStateToProps)(MixedMainPage);
