import React from "react";
import PropTypes from "prop-types";
import _reduce from "lodash/reduce";
import { shouldComponentUpdate } from "react-immutable-render-mixin";

import { Tabs, Tab } from "material-ui/Tabs";
import WhatHotIcon from "material-ui/svg-icons/social/whatshot";
import ActionHome from "material-ui/svg-icons/action/home";
import WikiIcon from "material-ui/svg-icons/communication/import-contacts";

import ForumBoardList from "../../ForumBoard/components/ForumBoardList";
import EnhancedSwipeableViews from "../../../components/EnhancedSwipableViews";

export const HOME_SLIDE = 0;
export const WHAT_HOT_SLIDE = 1;
export const WIKI_SLIDE = 2;
export const SLIDE_COUNT = 3;

const _slideIndexEnMapping = {
  [HOME_SLIDE]: "home",
  [WHAT_HOT_SLIDE]: "what_hot",
  [WIKI_SLIDE]: "wiki"
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
    style: PropTypes.object,
    slideContainerStyle: PropTypes.object,
    scrollBehaviorShouldUpdateScroll: PropTypes.func
  };

  static defaultProps = {
    onChangeTab: () => {},
    scrollBehaviorShouldUpdateScroll: undefined,
    slideIndex: 0,
    style: {},
    slideContainerStyle: {
      height: "100%"
    },
    swipeableViewsStyle: {},
    tabsStyle: {}
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.state = {
      slideIndex: props.slideIndex
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.slideIndex !== this.state.slideIndex) {
      this.setState({ slideIndex: nextProps.slideIndex });
    }
  }

  handleChange = value => {
    this.setState({ slideIndex: value });
    this.props.onChangeTab(value);
  };

  handleTransitionEnd = () => {
    if (this.props.onTransitionEnd) {
      this.props.onTransitionEnd(this.state.slideIndex);
    }
  };

  handleTabMouseOver = slideIndex => {
    // this.setState({ slideIndex });
  };

  handleTabMouseOvers = {
    [HOME_SLIDE]: this.handleTabMouseOver.bind(this, HOME_SLIDE),
    [WHAT_HOT_SLIDE]: this.handleTabMouseOver.bind(this, WHAT_HOT_SLIDE),
    [WIKI_SLIDE]: this.handleTabMouseOver.bind(this, WIKI_SLIDE)
  };

  render() {
    const { slideIndex } = this.state;
    const MyTab = (icon, slide) => (
      <Tab
        icon={icon}
        value={slide}
        onFocus={() => undefined}
        onMouseOver={this.handleTabMouseOvers[slide]}
      />
    );
    // {MyTab(<ActionHome />, HOME_SLIDE)}
    return (
      <div style={this.props.style}>
        <Tabs
          style={this.props.tabsStyle}
          onChange={this.handleChange}
          value={slideIndex}
        >
          <Tab
            icon={<ActionHome />}
            value={HOME_SLIDE}
            onFocus={() => undefined}
            onMouseOver={this.handleTabMouseOvers[HOME_SLIDE]}
          />
          <Tab
            icon={<WhatHotIcon />}
            value={WHAT_HOT_SLIDE}
            onFocus={() => undefined}
            onMouseOver={this.handleTabMouseOvers[WHAT_HOT_SLIDE]}
          />
          <Tab
            icon={<WikiIcon />}
            value={WIKI_SLIDE}
            onFocus={() => undefined}
            onMouseOver={this.handleTabMouseOvers[WIKI_SLIDE]}
          />
        </Tabs>
        <EnhancedSwipeableViews
          scrollKey="hometabs"
          index={slideIndex}
          scrollBehaviorShouldUpdateScroll={
            this.props.scrollBehaviorShouldUpdateScroll
          }
          style={this.props.swipeableViewsStyle}
          containerStyle={this.props.slideContainerStyle}
          onChangeIndex={this.handleChange}
          onTransitionEnd={this.handleTransitionEnd}
        >
          <div>主頁，放訂閱的文章或看板等最新或熱門資訊(尚未完成)</div>
          <ForumBoardList />
          <div>維基特色條目(尚未完成)</div>
        </EnhancedSwipeableViews>
      </div>
    );
  }
}

export default HomeTabs;
