import React from "react";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import warning from "warning";

export class EnhancedSwipableViews extends React.Component {
  static propTypes = {
    disableOnDrawerStart: PropTypes.bool,
    resistance: PropTypes.bool,
    scrollKey: PropTypes.string,
    scrollBehaviorShouldUpdateScroll: PropTypes.func,
    userAgent: PropTypes.string,
    disableLazyLoading: PropTypes.bool
  };

  static defaultProps = {
    disableOnDrawerStart: true,
    disableLazyLoading: true,
    resistance: true,
    scrollKey: "",
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
  }

  componentDidMount() {
    document.body.addEventListener("touchstart", this.onBodyTouchStart);
    document.body.addEventListener("touchend", this.onBodyTouchEnd);
    this._scrollSpy(this.props.index);
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

  onChangeIndex = (currentIndex, prevIndex) => {
    this._scrollSpy(currentIndex, prevIndex);
    if (this.props.onChangeIndex) {
      this.props.onChangeIndex(currentIndex, prevIndex);
    }
  };

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

  _scrollSpy = (index, prevIndex) => {
    if (!this.originalSwipableViews || typeof index !== "number") {
      return;
    }
    const { containerNode } = this.originalSwipableViews;
    const activeNode = containerNode.childNodes[index];
    if (!activeNode) {
      return;
    }
    const { scrollKey, animateHeight } = this.props;
    if (scrollKey && !animateHeight) {
      if (this._registed && this._scrollKey && typeof prevIndex === "number") {
        try {
          this.context.scrollBehavior.unregisterElement(
            `${scrollKey}-${prevIndex}`
          );
        } catch (err) {
          if (
            /ScrollBehavior: There is already an element registered for /.test(
              err.message
            )
          ) {
            warning(err);
          } else {
            throw err;
          }
        }
      }
      const _scrollKey = `${scrollKey}-${index}`;
      if (_scrollKey === this._scrollKey && this._registed) {
        return;
      }
      this._scrollKey = _scrollKey;
      this._registed = true;
      const targetScrollElement = activeNode;
      let { scrollBehaviorShouldUpdateScroll } = this.props;
      scrollBehaviorShouldUpdateScroll = this.context.scrollBehavior
        .shouldUpdateScroll;
      this.context.scrollBehavior.registerElement(
        _scrollKey,
        targetScrollElement,
        scrollBehaviorShouldUpdateScroll
      );
    }
  };

  render() {
    const {
      disableOnDrawerStart,
      scrollKey,
      resistance,
      dispatch,
      scrollBehaviorShouldUpdateScroll,
      userAgent,
      disableLazyLoading,
      children,
      ...other
    } = this.props;
    const { disabled } = this.state;
    return (
      <SwipeableViews
        {...other}
        resistance={resistance}
        ref={this.setOriginalSwipableViewsRef}
        disabled={disabled}
        onChangeIndex={this.onChangeIndex}
        disableLazyLoading={disableLazyLoading}
      >
        {children}
      </SwipeableViews>
    );
  }
}

export default EnhancedSwipableViews;
