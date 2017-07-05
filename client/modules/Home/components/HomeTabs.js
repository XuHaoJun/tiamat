import React from "react";
import PropTypes from "prop-types";
import EnhancedSwipeableViews from "../../../components/EnhancedSwipableViews";
import { Tabs, Tab } from "material-ui/Tabs";
import WhatHotIcon from "material-ui/svg-icons/social/whatshot";
import ActionHome from "material-ui/svg-icons/action/home";
import ForumBoardList from "../../ForumBoard/components/ForumBoardList";
import WikiIcon from "material-ui/svg-icons/communication/import-contacts";
import { shouldComponentUpdate } from "react-immutable-render-mixin";

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

  render() {
    return (
      <div style={this.props.style}>
        <Tabs
          style={this.props.tabsStyle}
          onChange={this.handleChange}
          value={this.state.slideIndex}
        >
          <Tab icon={<ActionHome />} value={0} />
          <Tab icon={<WhatHotIcon />} value={1} />
          <Tab icon={<WikiIcon />} value={2} />
        </Tabs>
        <EnhancedSwipeableViews
          scrollKey="hometabs"
          scrollBehaviorShouldUpdateScroll={
            this.props.scrollBehaviorShouldUpdateScroll
          }
          style={this.props.swipeableViewsStyle}
          containerStyle={this.props.slideContainerStyle}
          index={this.state.slideIndex}
          onChangeIndex={this.handleChange}
          onTransitionEnd={this.handleTransitionEnd}
        >
          <div>主頁</div>
          <ForumBoardList />
          <div>維基特色條目</div>
        </EnhancedSwipeableViews>
      </div>
    );
  }
}

export default HomeTabs;
