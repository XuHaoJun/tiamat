import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import HomeTabs, {
  HOME_SLIDE,
  SLIDE_COUNT,
  getSlideIndexEnAlias,
  getSlideIndexFromEnAlias
} from "../components/HomeTabs";
import { getStyles as myAppGetStyles } from "../../MyApp/MyApp";
import { setHeaderTitle } from "../../MyApp/MyAppActions";
import { fetchForumBoards } from "../../ForumBoard/ForumBoardActions";

export function getStyles(browser) {
  const maStyles = myAppGetStyles(browser);
  const styles = {
    root: Object.assign({}, maStyles.disableRoot),
    slideContainer: {
      height: "calc(100vh - 112px)",
      WebkitOverflowScrolling: "touch"
    },
    swipeableViews: {},
    swipeableViewsWithMedium: {
      paddingTop: 48
    },
    tabs: {},
    tabsWithMedium: {
      zIndex: 1,
      position: "fixed",
      width: "100%"
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
    browser: PropTypes.object.isRequired
  };

  static defaultProps = {
    title: "Tiamat"
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  componentWillMount() {
    const { title } = this.props;
    this.props.dispatch(setHeaderTitle(title));
  }

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
    const styles = getStyles(this.props.browser);
    const metaDescription = "Tiamat | Game forum and wiki.";
    const meta = [
      {
        name: "description",
        content: metaDescription
      }
    ];
    return (
      <div>
        <Helmet title={title} meta={meta} />
        <HomeTabs
          onTransitionEnd={this.handleTransitionEnd}
          slideIndex={this.props.slideIndex}
          disableOnDrawerStart={true}
          browser={this.props.browser}
          tabsStyle={styles.tabs}
          swipeableViewsStyle={styles.swipeableViews}
          slideContainerStyle={styles.slideContainer}
        />
      </div>
    );
  }
}

HomePage.need = [].concat(() => {
  return fetchForumBoards();
});

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

export default connect(mapStateToProps)(HomePage);
