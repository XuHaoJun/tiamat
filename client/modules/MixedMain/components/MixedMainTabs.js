import React from 'react';
import PropTypes from 'prop-types';
import { shouldComponentUpdate } from 'react-immutable-render-mixin';
import Loadable from 'react-loadable';
import { connect } from 'react-redux';
import pure from 'recompose/pure';

import Tab from '@material-ui/core/Tab';
import Tabs from '../../../components/Tabs';
import EnhancedSwipeableViews from '../../../components/EnhancedSwipableViews';

import RootDiscussionList from '../../Discussion/components/RootDiscussionList';
import ForumBoardGroupsList from '../../ForumBoard/components/ForumBoardGroupsList';
import RootWikiGroupTreeList from '../../RootWiki/components/RootWikiGroupTreeList';
import WikiList from '../../Wiki/components/WikiList';
import ActionButton from './ActionButton';

import { getIsFirstRender } from '../../MyApp/MyAppReducer';

const Loading = pure(() => <div>Loading...</div>);

// optimize size beacuse RootWikiDetail use Editor module.
// TODO
// disable lazy load for bot crawler.
const RootWikiDetail = connect(state => {
  return { isFirstRender: getIsFirstRender(state) };
})(
  Loadable({
    loader: async () => {
      // use same Component with client-side and server-side for hydrate.
      if (process.browser) {
        const Component = await import(/* webpackChunkName: "RootWikiDetail" */ '../../RootWiki/components/RootWikiDetail');
        return Component;
      } else {
        return Loading;
      }
    },
    render(loaded, props) {
      const Component = loaded.default;
      if (props.isFirstRender) {
        return <Loading />;
      } else {
        return <Component {...props} />;
      }
    },
    loading: Loading,
  })
);

export const FORUMBOARD_GROUPS_SLIDE = 0;
export const ROOT_DISCUSSIONS_SLIDE = 1;
export const ROOT_WIKI_GROUPS_SLIDE = 2;
export const ROOT_WIKI_OR_WIKI_SLIDE = 3;

class RootWikiDetailOrWikiList extends React.Component {
  static propTypes = {
    targetKind: PropTypes.string,
  };

  static defaultProps = {
    targetKind: 'rootDiscussions',
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.state = {
      ...props,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { targetKind } = nextProps;
    if (targetKind === 'wikis' || targetKind === 'rootWiki') {
      this.setState({ ...nextProps });
    }
  }

  render() {
    const { targetKind, rootWikiId, rootWikiGroupTree } = this.state;
    if (targetKind === 'wikis') {
      return <WikiList rootWikiId={rootWikiId} rootWikiGroupTree={rootWikiGroupTree} />;
    } else if (targetKind === 'rootWiki') {
      return <RootWikiDetail rootWikiId={rootWikiId} />;
    } else {
      return <Loading />;
    }
  }
}

class MixedMainTabs extends React.Component {
  static propTypes = {
    slideContainerStyle: PropTypes.object,
    RootDiscussionListProps: PropTypes.object,
  };

  static defaultProps = {
    slideIndex: 0, // eslint-disable-line
    slideContainerStyle: {
      height: '100%',
    },
    RootDiscussionListProps: {},
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    const { slideIndex } = props;
    const lastScrollDirection = 'up';
    this.state = {
      slideIndex,
      lastScrollDirection,
    };
    this.lastScrollTop = {
      [slideIndex]: 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.slideIndex !== nextProps.slideIndex) {
      const { slideIndex } = nextProps;
      this.setState({ slideIndex });
    }
  }

  getActionButtonIsOpened = slideIndex => {
    return this.state.lastScrollDirection !== 'down';
  };

  getActionButtonHref = (slideIndex, forumBoardGroup = '') => {
    const { forumBoardId, rootWiki } = this.props;
    const rootWikiId = rootWiki ? rootWiki.get('_id') : null;
    if (slideIndex === ROOT_DISCUSSIONS_SLIDE && forumBoardId) {
      const search = forumBoardGroup
        ? `?forumBoardGroup=${encodeURIComponent(forumBoardGroup)}`
        : '';
      return `/create/forumBoards/${forumBoardId}/rootDiscussion${search}`;
    } else if (slideIndex === ROOT_WIKI_OR_WIKI_SLIDE) {
      if (rootWikiId && forumBoardId) {
        return `/create/forumBoards/${forumBoardId}/rootWikis/${rootWikiId}/wiki`;
      } else if (forumBoardId) {
        return `/create/forumBoards/${forumBoardId}/rootWiki`;
      } else {
        return null;
      }
    } else if (slideIndex === ROOT_WIKI_GROUPS_SLIDE && rootWikiId) {
      return `/create/rootWikis/${rootWikiId}/rootWikiGroupTree`;
    } else {
      return null;
    }
  };

  getActionButtonIconType = slideIndex => {
    if (slideIndex === FORUMBOARD_GROUPS_SLIDE || slideIndex === ROOT_WIKI_GROUPS_SLIDE) {
      return 'add';
    } else {
      return 'create';
    }
  };

  getActionButtonProps = (slideIndex, forumBoardGroup) => {
    const isOpen = this.getActionButtonIsOpened(slideIndex);
    const iconType = this.getActionButtonIconType(slideIndex);
    const href = this.getActionButtonHref(slideIndex, forumBoardGroup);
    const { targetKind, rootWikiId } = this.props;
    return { slideIndex, isOpen, iconType, href, targetKind, rootWikiId };
  };

  handleTransitionEnd = () => {
    if (this.props.onTransitionEnd) {
      this.props.onTransitionEnd(this.state.slideIndex);
    }
  };

  handleChange = (event, value) => {
    const slideIndex = value;
    this.lastScrollTop[slideIndex] = 0;
    this.setState({
      slideIndex,
      lastScrollDirection: 'up',
    });
  };

  handleChangeIndex = value => {
    this.handleChange(null, value);
  };

  handleScroll = e => {
    const lastScrollTop = this.lastScrollTop[this.state.slideIndex];
    const { scrollTop } = e.target;
    const lastScrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
    if (this.state.lastScrollDirection !== lastScrollDirection) {
      this.setState({ lastScrollDirection });
    }
    this.lastScrollTop[this.state.slideIndex] = scrollTop;
  };

  render() {
    const {
      id,
      targetKind,
      forumBoard,
      forumBoardId,
      rootWikiId,
      forumBoardGroup,
      rootWikiGroupTree,
      RootDiscussionListProps,
    } = this.props;
    const { slideIndex } = this.state;
    const actionButtonProps = this.getActionButtonProps(slideIndex, forumBoardGroup);
    return (
      <div>
        <Tabs value={slideIndex} onChange={this.handleChange}>
          <Tab label="看板分類" value={FORUMBOARD_GROUPS_SLIDE} />
          <Tab label="文章列表" value={ROOT_DISCUSSIONS_SLIDE} />
          <Tab label="維基分類" value={ROOT_WIKI_GROUPS_SLIDE} />
          <Tab label="維基列表" value={ROOT_WIKI_OR_WIKI_SLIDE} />
        </Tabs>
        <EnhancedSwipeableViews
          id={id ? `${id}/EnhancedSwipeableViews` : null}
          containerStyle={this.props.slideContainerStyle}
          slideClassName={this.props.slideClassName}
          index={slideIndex}
          onScroll={this.handleScroll}
          onChangeIndex={this.handleChangeIndex}
          onTransitionEnd={this.handleTransitionEnd}
        >
          <ForumBoardGroupsList
            id={id ? `${id}/ForumBoardGroupsList` : null}
            forumBoard={forumBoard}
            forumBoardId={forumBoardId}
            forumBoardGroup={forumBoardGroup}
          />
          <RootDiscussionList
            id={id ? `${id}/RootDiscussionList` : null}
            forumBoard={forumBoard}
            forumBoardId={forumBoardId}
            forumBoardGroup={forumBoardGroup}
            {...RootDiscussionListProps}
          />
          <RootWikiGroupTreeList
            id={id ? `${id}/RootWikiGroupTreeList` : null}
            forumBoard={forumBoard}
            forumBoardId={forumBoardId}
            rootWikiId={rootWikiId}
            queryRootWikiGroupTree={rootWikiGroupTree}
          />
          <RootWikiDetailOrWikiList
            id={id ? `${id}/RootWikiDetailOrWikiList` : null}
            targetKind={targetKind}
            rootWikiId={rootWikiId}
            rootWikiGroupTree={rootWikiGroupTree}
          />
        </EnhancedSwipeableViews>
        <ActionButton {...actionButtonProps} />
      </div>
    );
  }
}

export default MixedMainTabs;
