import React from "react";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import { connect } from "react-redux";
import { getIsFirstRender } from "../modules/MyApp/MyAppReducer";

class EnhancedSwipableViews extends React.Component {
  static propTypes = {
    disableOnDrawerStart: PropTypes.bool,
    resistance: PropTypes.bool,
    scrollKey: PropTypes.string,
    scrollBehaviorShouldUpdateScroll: PropTypes.func,
    disableLazyLoading: PropTypes.bool
  };

  static defaultProps = {
    disableOnDrawerStart: true,
    disableLazyLoading: true,
    resistance: true,
    scrollKey: "",
    scrollBehaviorShouldUpdateScroll: undefined
  };

  static contextTypes = {
    scrollBehavior: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.scrollKey = props.id;
    this.state = {
      disabled: false
    };
  }

  componentDidMount() {
    document.body.addEventListener("touchstart", this.onBodyTouchStart);
    document.body.addEventListener("touchend", this.onBodyTouchEnd);
    this._scrollSpy();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id && this.props.id !== nextProps.id) {
      if (this._scrollKeys) {
        this._scrollKeys.forEach(scrollKey => {
          this.context.scrollBehavior.unregisterElement(scrollKey);
        });
        this._scrollKeys = [];
        this._scrollSpy();
      }
    }
  }

  componentWillUnmount() {
    document.body.removeEventListener("touchstart", this.onBodyTouchStart);
    document.body.removeEventListener("touchend", this.onBodyTouchEnd);
    if (this._scrollKeys) {
      this._scrollKeys.forEach(scrollKey => {
        this.context.scrollBehavior.unregisterElement(scrollKey);
      });
      this._scrollKeys = [];
    }
  }

  onBodyTouchStart = event => {
    if (this.props.disableOnDrawerStart && document) {
      const touchStartX = event.touches[0].pageX;
      // FIXME
      // remove magic number
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
  };

  onBodyTouchEnd = event => {
    if (this.props.disableOnDrawerStart) {
      if (this.state.disabled) {
        this.setState({ disabled: false });
      }
    }
  };

  setOriginalSwipableViewsRef = ori => {
    this.originalSwipableViews = ori;
  };

  _scrollSpy = () => {
    if (!this.originalSwipableViews) {
      return;
    }
    const { containerNode } = this.originalSwipableViews;
    const { id, animateHeight } = this.props;
    const scrollKey = id;
    if (scrollKey && !animateHeight && containerNode) {
      containerNode.childNodes.forEach((activeNode, index) => {
        const _scrollKey = `${scrollKey}-${index}`;
        this._scrollKeys = this._scrollKeys || [];
        this._scrollKeys.push(_scrollKey);
        const targetScrollElement = activeNode;
        let { scrollBehaviorShouldUpdateScroll } = this.props;
        scrollBehaviorShouldUpdateScroll = this.context.scrollBehavior
          .shouldUpdateScroll;
        try {
          this.context.scrollBehavior.registerElement(
            _scrollKey,
            targetScrollElement,
            scrollBehaviorShouldUpdateScroll
          );
        } catch (err) {
          console.warn(err);
        }
      });
    }
  };

  render() {
    const {
      index,
      disableOnDrawerStart,
      scrollKey,
      resistance,
      dispatch,
      scrollBehaviorShouldUpdateScroll,
      disableLazyLoading,
      children,
      ...other
    } = this.props;
    const { disabled } = this.state;
    return (
      <SwipeableViews
        {...other}
        index={index}
        resistance={resistance}
        ref={this.setOriginalSwipableViewsRef}
        disabled={disabled}
        disableLazyLoading={disableLazyLoading}
      >
        {children}
      </SwipeableViews>
    );
  }
}

function mapStateToProps(state) {
  const isFirstRender = getIsFirstRender(state);
  return { disableLazyLoading: isFirstRender };
}

function mapDispatchToProps() {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(
  EnhancedSwipableViews
);
