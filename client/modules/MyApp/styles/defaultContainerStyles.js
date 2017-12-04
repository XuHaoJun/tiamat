export default function getStyles(browser) {
  const styles = {
    container: {
      margin: 32
    },
    containerWithMedium: {
      margin: "64px 64px 64px 64px"
    }
  };
  if (!browser.lessThan.medium) {
    styles.container = styles.containerWithMedium;
  }
  return styles;
}
