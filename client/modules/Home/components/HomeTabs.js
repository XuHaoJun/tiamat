import React from 'react';
import PropTypes from 'prop-types';
import _reduce from 'lodash/reduce';
import { shouldComponentUpdate } from 'react-immutable-render-mixin';

import Tabs, { Tab } from '../../../components/Tabs';

import ForumBoardList from '../../ForumBoard/components/ForumBoardList';
import EnhancedSwipeableViews from '../../../components/EnhancedSwipableViews';

export const HOME_SLIDE = 0;
export const WHAT_HOT_SLIDE = 1;
export const WIKI_SLIDE = 2;
export const SLIDE_COUNT = 3;

const _slideIndexEnMapping = {
  [HOME_SLIDE]: 'home',
  [WHAT_HOT_SLIDE]: 'what_hot',
  [WIKI_SLIDE]: 'wiki',
};

const _slideIndexEnReverseMapping = _reduce(
  _slideIndexEnMapping,
  (result, v, k) => {
    const en = v;
    const i = Number.parseInt(k, 10);
    return Object.assign(result, { [en]: i });
  },
  {}
);

export const getSlideIndexEnAlias = slideIndex => {
  return _slideIndexEnMapping[slideIndex];
};

export const getSlideIndexFromEnAlias = enAlias => {
  return _slideIndexEnReverseMapping[enAlias];
};

class HomeTabs extends React.Component {
  static propTypes = {
    slideContainerStyle: PropTypes.object,
    forumBoardListProps: PropTypes.object,
  };

  static defaultProps = {
    slideIndex: 0, // eslint-disable-line
    slideContainerStyle: {
      height: '100%',
    },
    forumBoardListProps: {},
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.state = {
      slideIndex: props.slideIndex,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.slideIndex !== this.state.slideIndex) {
      this.setState({ slideIndex: nextProps.slideIndex });
    }
  }

  handleChange = (event, value) => {
    this.setState({ slideIndex: value });
  };

  handleChangeIndex = value => {
    this.setState({ slideIndex: value });
  };

  handleTransitionEnd = () => {
    if (this.props.onTransitionEnd) {
      this.props.onTransitionEnd(this.state.slideIndex);
    }
  };

  render() {
    const { id, forumBoardListProps } = this.props;
    const { slideIndex } = this.state;
    return (
      <div>
        <Tabs onChange={this.handleChange} value={slideIndex}>
          <Tab label="首頁" value={HOME_SLIDE} />
          <Tab label="熱門看板" value={WHAT_HOT_SLIDE} />
          <Tab label="今日維基" value={WIKI_SLIDE} />
        </Tabs>
        <EnhancedSwipeableViews
          id={id ? `${id}/EnhancedSwipeableViews` : null}
          index={slideIndex}
          style={this.props.swipeableViewsStyle}
          containerStyle={this.props.slideContainerStyle}
          slideClassName={this.props.slideClassName}
          onChangeIndex={this.handleChangeIndex}
          onTransitionEnd={this.handleTransitionEnd}
        >
          <div>首頁，放推薦內容(尚未完成)</div>
          <ForumBoardList id={id ? `${id}/ForumBoardList` : null} {...forumBoardListProps} />
          <div>維基特色條目(尚未完成)</div>
        </EnhancedSwipeableViews>
      </div>
    );
  }
}

export default HomeTabs;
