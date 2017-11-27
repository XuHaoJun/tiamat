import React from "react";
import PropTypes from "prop-types";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import { Tabs, Tab } from "material-ui/Tabs";
import Loadable from "react-loadable";

import EnhancedSwipeableViews from "../../../components/EnhancedSwipableViews";
// import RootWikiDetail from "../../RootWiki/components/RootWikiDetail";
import RootDiscussionList from "../../Discussion/components/RootDiscussionList";
import ForumBoardGroupsList from "../../ForumBoard/components/ForumBoardGroupsList";
import RootWikiGroupTreeList from "../../RootWiki/components/RootWikiGroupTreeList";
import WikiList from "../../Wiki/components/WikiList";
import AddButton from "./AddButton";
import Loading from "../../../components/CenterCircularProgress";

// optimize size beacuse RootWikiDetail use Editor module.
const RootWikiDetail = Loadable({
  loader: () => {
    const isServer = typeof window === "undefined";
    // use same Component with client-side and server-side for hydrate.
    if (isServer) {
      return Promise.resolve(Loading);
    } else {
      return import(/* webpackChunkName: "RootWikiDetail" */ "../../RootWiki/components/RootWikiDetail");
    }
  },
  loading: Loading
});

export const FORUMBOARD_GROUPS_SLIDE = 0;
export const ROOT_DISCUSSIONS_SLIDE = 1;
export const ROOT_WIKI_GROUPS_SLIDE = 2;
export const ROOT_WIKI_OR_WIKI_SLIDE = 3;

class RootWikiDetailOrWikiList extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  render() {
    const { rootWikiId, rootWikiGroupTree } = this.props;
    if (rootWikiGroupTree) {
      return (
        <WikiList
          rootWikiId={rootWikiId}
          rootWikiGroupTree={rootWikiGroupTree}
        />
      );
    }
    return <RootWikiDetail rootWikiId={rootWikiId} />;
  }
}

export function getStyles(context, browser) {
  const tabHeight = 48;
  const appBarHeight = context.muiTheme.appBar.height;
  const styles = {
    slideContainer: {
      height: `calc(100vh - ${tabHeight + appBarHeight}px)`,
      WebkitOverflowScrolling: "touch"
    },
    swipeableViews: {
      paddingTop: tabHeight
    },
    swipeableViewsWithMedium: {
      paddingTop: tabHeight
    },
    tabs: {
      position: "fixed",
      zIndex: 1,
      width: "calc(100% - 256px)"
    },
    tabsWithMedium: {
      position: "fixed",
      zIndex: 1,
      width: "100%"
    }
  };
  if (browser.lessThan.medium) {
    styles.tabs = styles.tabsWithMedium;
    styles.swipeableViews = styles.swipeableViewsWithMedium;
  }
  return styles;
}

class MixedMainTabs extends React.Component {
  static propTypes = {
    rootStyle: PropTypes.object,
    slideContainerStyle: PropTypes.object,
    browser: PropTypes.object
  };

  static defaultProps = {
    onChangeTab: () => {},
    slideIndex: 0,
    rootStyle: {},
    slideContainerStyle: {},
    swipeableViewsStyle: {},
    tabsStyle: {},
    browser: null
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    const { slideIndex } = props;
    const lastScrollDirection = "up";
    this.state = {
      slideIndex,
      lastScrollDirection
    };
    this.lastScrollTop = {
      [slideIndex]: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.slideIndex !== nextProps.slideIndex) {
      const { slideIndex } = nextProps;
      this.setState({ slideIndex });
    }
  }

  getStyles = () => {
    const {
      rootStyle,
      tabsStyle,
      swipeableViewsStyle,
      slideContainerStyle
    } = this.props;
    const defaultStyles = getStyles(this.context, this.props.browser);
    const propStyles = {
      rootStyle,
      tabsStyle,
      swipeableViewsStyle,
      slideContainerStyle
    };
    const styles = defaultStyles;
    for (const k in styles) {
      if (Object.prototype.hasOwnProperty.call(styles, k)) {
        styles[k] = {
          ...styles[k],
          ...propStyles[k]
        };
      }
    }
    return styles;
  };

  getAddButtonIsOpened = slideIndex => {
    if (this.state.lastScrollDirection === "down") {
      return false;
    }
    return true;
  };

  getAddButtonHref = (slideIndex, forumBoardGroup = "") => {
    const { forumBoardId, rootWiki } = this.props;
    const rootWikiId = rootWiki ? rootWiki.get("_id") : "";
    let href = "";
    if (slideIndex === ROOT_DISCUSSIONS_SLIDE && forumBoardId) {
      const search = forumBoardGroup
        ? `?forumBoardGroup=${encodeURIComponent(forumBoardGroup)}`
        : "";
      href = `/create/forumBoards/${forumBoardId}/rootDiscussion${search}`;
    } else if (slideIndex === ROOT_WIKI_OR_WIKI_SLIDE) {
      if (rootWikiId && forumBoardId) {
        href = `/create/forumBoards/${forumBoardId}/rootWikis/${
          rootWikiId
        }/wiki`;
      } else {
        href = `/create/forumBoards/${forumBoardId}/rootWiki`;
      }
    } else if (slideIndex === ROOT_WIKI_GROUPS_SLIDE) {
      if (rootWikiId) {
        href = `/edit/rootWikis/${rootWikiId}/rootWikiGroupTree`;
      }
    }
    return href;
  };

  getAddButtonIconType = slideIndex => {
    if (
      slideIndex === FORUMBOARD_GROUPS_SLIDE ||
      slideIndex === ROOT_WIKI_GROUPS_SLIDE
    ) {
      return "add";
    }
    return "create";
  };

  getAddButtonProps = (slideIndex, forumBoardGroup) => {
    const isOpen = this.getAddButtonIsOpened(slideIndex);
    const iconType = this.getAddButtonIconType(slideIndex);
    const href = this.getAddButtonHref(slideIndex, forumBoardGroup);
    return { isOpen, iconType, href };
  };

  handleTransitionEnd = () => {
    if (this.props.onTransitionEnd) {
      this.props.onTransitionEnd(this.state.slideIndex);
    }
  };

  handleTabChange = value => {
    const slideIndex = value;
    this.lastScrollTop[slideIndex] = 0;
    this.setState(
      {
        slideIndex,
        lastScrollDirection: "up"
      },
      () => this.props.onChangeTab(value)
    );
  };

  handleScroll = e => {
    const lastScrollTop = this.lastScrollTop[this.state.slideIndex];
    const { scrollTop } = e.target;
    const lastScrollDirection = scrollTop > lastScrollTop ? "down" : "up";
    if (this.state.lastScrollDirection !== lastScrollDirection) {
      this.setState({ lastScrollDirection });
    }
    this.lastScrollTop[this.state.slideIndex] = scrollTop;
  };

  render() {
    const {
      forumBoardId,
      rootWikiId,
      forumBoardGroup,
      rootWikiGroupTree
    } = this.props;
    const { scrollKey } = this.props;
    const { slideIndex } = this.state;
    const styles = this.getStyles();
    const addButtonProps = this.getAddButtonProps(slideIndex, forumBoardGroup);
    return (
      <div style={styles.root}>
        <Tabs
          style={styles.tabs}
          value={slideIndex}
          onChange={this.handleTabChange}
        >
          <Tab label="看板分類" value={FORUMBOARD_GROUPS_SLIDE} />
          <Tab label="文章列表" value={ROOT_DISCUSSIONS_SLIDE} />
          <Tab label="維基分類" value={ROOT_WIKI_GROUPS_SLIDE} />
          <Tab label="維基列表" value={ROOT_WIKI_OR_WIKI_SLIDE} />
        </Tabs>
        <EnhancedSwipeableViews
          scrollKey={scrollKey}
          style={styles.swipeableViews}
          containerStyle={styles.slideContainer}
          index={slideIndex}
          onScroll={this.handleScroll}
          onChangeIndex={this.handleTabChange}
          onTransitionEnd={this.handleTransitionEnd}
        >
          <ForumBoardGroupsList
            forumBoardId={forumBoardId}
            forumBoardGroup={forumBoardGroup}
          />
          <RootDiscussionList
            forumBoardId={forumBoardId}
            forumBoardGroup={forumBoardGroup}
          />
          <RootWikiGroupTreeList
            forumBoardId={forumBoardId}
            rootWikiId={rootWikiId}
            queryRootWikiGroupTree={rootWikiGroupTree}
          />
          <RootWikiDetailOrWikiList
            rootWikiId={rootWikiId}
            rootWikiGroupTree={rootWikiGroupTree}
          />
        </EnhancedSwipeableViews>
        <AddButton {...addButtonProps} />
      </div>
    );
  }
}

export default MixedMainTabs;
