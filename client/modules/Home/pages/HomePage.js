import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { is } from "immutable";
import Helmet from "react-helmet";

import HomeTabs, {
  HOME_SLIDE,
  SLIDE_COUNT,
  getSlideIndexEnAlias,
  getSlideIndexFromEnAlias
} from "../components/HomeTabs";
import { setHeaderTitle } from "../../MyApp/MyAppActions";
import { fetchForumBoards } from "../../ForumBoard/ForumBoardActions";

export function getStyles(context, browser) {
  const tabHeight = 48;
  const appBarHeight = context.muiTheme.appBar.height;
  const styles = {
    slideContainer: {
      height: `calc(100vh - ${tabHeight + appBarHeight}px)`,
      WebkitOverflowScrolling: "touch"
    },
    swipeableViews: {},
    swipeableViewsWithMedium: {},
    tabs: {},
    tabsWithMedium: {
      // position: "fixed",
      // width: "100%"
    }
  };
  if (browser.lessThan.medium) {
    styles.tabs = styles.tabsWithMedium;
    styles.swipeableViews = styles.swipeableViewsWithMedium;
  }
  return styles;
}

class HomePage extends React.Component {
  static propTypes = {
    browser: PropTypes.object.isRequired,
    title: PropTypes.string
  };

  static defaultProps = {
    title: "首頁"
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  static getInitialAction() {
    return dispatch => {
      dispatch(setHeaderTitle(HomePage.defaultProps.title));
      return dispatch(fetchForumBoards());
    };
  }

  componentDidMount() {
    this.fetchComponentData();
  }

  componentWillReceiveProps(nextProps) {
    if (!is(this.props, nextProps)) {
      this.fetchComponentData(nextProps);
    }
  }

  fetchComponentData = (props = this.props) => {
    if (props.fetchComponentData) {
      return props.fetchComponentData();
    } else {
      return null;
    }
  };

  handleTransitionEnd = slideIndex => {
    if (slideIndex === HOME_SLIDE) {
      this.context.router.replace("/");
    } else {
      const slideIndexEN = getSlideIndexEnAlias(slideIndex);
      this.context.router.replace(`/?slideIndex=${slideIndexEN}`);
    }
  };

  render() {
    const { title } = this.props;
    const styles = getStyles(this.context, this.props.browser);
    const metaDescription = "Tiamat | Game forum and wiki.";
    const meta = [
      {
        name: "description",
        content: metaDescription
      }
    ];
    const { slideIndex, browser } = this.props;
    return (
      <div>
        <Helmet title={title} meta={meta} />
        <HomeTabs
          onTransitionEnd={this.handleTransitionEnd}
          slideIndex={slideIndex}
          disableOnDrawerStart={true}
          browser={browser}
          tabsStyle={styles.tabs}
          swipeableViewsStyle={styles.swipeableViews}
          slideContainerStyle={styles.slideContainer}
        />
      </div>
    );
  }
}

function mapStateToProps(state, routerProps) {
  const { location } = routerProps;
  const { browser } = state;
  const slideIndex = (() => {
    const qsi = location.query.slideIndex;
    let si = Number.parseInt(qsi, 10);
    if (!si) {
      si = getSlideIndexFromEnAlias(qsi) || 0;
    }
    if (si > SLIDE_COUNT - 1) {
      si = 0;
    }
    return si;
  })();
  return { browser, location, slideIndex };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchComponentData() {
      const action = HomePage.getInitialAction();
      return dispatch(action);
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
