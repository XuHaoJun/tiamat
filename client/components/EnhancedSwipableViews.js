import React from "react";
import PropTypes from "prop-types";
import memoize from "fast-memoize";
import SwipeableViews from "@xuhaojun/react-swipeable-views";
import ReactDOM from "react-dom";
import warning from "warning";
import { connect } from "react-redux";
import { getUserAgent } from "../modules/UserAgent/UserAgentReducer";
import MobileDetect from "mobile-detect";

export class EnhancedSwipableViews extends React.Component {
  static propTypes = {
    disableOnDrawerStart: PropTypes.bool,
    resistance: PropTypes.bool,
    scrollKey: PropTypes.string,
    onFirstRenderComplete: PropTypes.func,
    scrollBehaviorShouldUpdateScroll: PropTypes.func,
    userAgent: PropTypes.string
  };

  static defaultProps = {
    disableOnDrawerStart: true,
    resistance: true,
    scrollKey: "",
    onFirstRenderComplete: () => {},
    scrollBehaviorShouldUpdateScroll: undefined,
    userAgent: ""
  };

  static contextTypes = {
    scrollBehavior: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.scrollKey = props.scrollKey;
    this.state = {
      disabled: false
    };
    const getMobileDetect = memoize(userAgent => {
      return new MobileDetect(userAgent);
    });
    this.getMobileDetect = getMobileDetect;
  }

  componentDidMount() {
    document.body.addEventListener("touchstart", this.onBodyTouchStart);
    document.body.addEventListener("touchend", this.onBodyTouchEnd);
  }

  componentWillReceiveProps(nextProps) {
    warning(
      nextProps.scrollKey === this.props.scrollKey,
      "<ScrollContainer> does not support changing scrollKey."
    );
  }

  componentWillUnmount() {
    document.body.removeEventListener("touchstart", this.onBodyTouchStart);
    document.body.removeEventListener("touchend", this.onBodyTouchEnd);
    if (this._registed && this._scrollKey) {
      this.context.scrollBehavior.unregisterElement(this._scrollKey);
    }
  }

  onBodyTouchStart = event => {
    if (this.props.disableOnDrawerStart && document) {
      const touchStartX = event.touches[0].pageX;
      const appDrawerSwipAreaWidth = 30;
      if (
        touchStartX <= appDrawerSwipAreaWidth ||
        touchStartX >= document.body.offsetWidth - appDrawerSwipAreaWidth
      ) {
        if (!this.state.disableSwipableViews) {
          this.setState({ disabled: true });
        }
      } else {
        if (this.state.disableSwipableViews) {
          this.setState({ disabled: false });
        }
      }
    }
    if (this.props.onTouchStart) {
      this.props.onTouchStart(event);
    }
  };

  onBodyTouchEnd = event => {
    if (this.props.disableOnDrawerStart) {
      if (this.state.disabled) {
        this.setState({ disabled: false });
      }
    }
    if (this.props.onTouchEnd) {
      this.props.onTouchEnd(event);
    }
  };

  onFirstRenderComplete = () => {
    const { scrollKey, animateHeight } = this.props;
    if (scrollKey && !animateHeight) {
      this._scrollKey = this.props.scrollKey;
      this._registed = true;
      const targetScrollElement = ReactDOM.findDOMNode(
        this.originalSwipableViews._activeSlide
      );
      let { scrollBehaviorShouldUpdateScroll } = this.props;
      scrollBehaviorShouldUpdateScroll = this.context.scrollBehavior
        .shouldUpdateScroll;
      this.context.scrollBehavior.registerElement(
        scrollKey,
        targetScrollElement,
        scrollBehaviorShouldUpdateScroll
      );
    }
    this.props.onFirstRenderComplete();
  };

  setOriginalSwipableViewsRef = ori => {
    this.originalSwipableViews = ori;
  };

  render() {
    const {
      disableOnDrawerStart,
      scrollKey,
      onFirstRenderComplete,
      resistance,
      dispatch,
      scrollBehaviorShouldUpdateScroll,
      onTouchStart,
      onTouchEnd,
      userAgent,
      ...other
    } = this.props;
    const mobileDetect = this.getMobileDetect(userAgent);
    // TODO workarund way for fix SwipableViews render nothing on first rendering, can't suit for google
    // bot crawler. I didn't know why SwipableViews design to not render on first time....
    if (mobileDetect.is("bot")) {
      return (
        <div>
          {this.props.children}
        </div>
      );
    }
    return (
      <SwipeableViews
        {...other}
        resistance={resistance}
        onFirstRenderComplete={this.onFirstRenderComplete}
        ref={this.setOriginalSwipableViewsRef}
        onTouchStart={this.onBodyTouchStart}
        onTouchEnd={this.onBodyTouchEnd}
        disabled={this.state.disabled}
      >
        {this.props.children}
      </SwipeableViews>
    );
  }
}

function mapStateToProps(store) {
  return { userAgent: getUserAgent(store) };
}

export default connect(mapStateToProps)(EnhancedSwipableViews);
