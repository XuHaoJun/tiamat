export default function getStyles(context, browser) {
  const tabHeight = 48;
  const appBarHeight = context.muiTheme.appBar.height;
  const styles = {
    slideContainer: {
      height: `calc(100vh - ${tabHeight + appBarHeight}px)`,
      maxWidth: "100vw",
      WebkitOverflowScrolling: "touch"
    },
    swipeableViews: {},
    swipeableViewsWithMedium: {
      paddingTop: tabHeight
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
