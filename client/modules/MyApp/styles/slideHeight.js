// FIXME
// suck responsive styles
export default function styles(
  theme,
  { withTab, withAppBar } = { withTab: false, withAppBar: true }
) {
  const { breakpoints } = theme;
  const tabHeight = withTab ? 48 : 0;
  const bottomNavigationHeight = 56;
  return {
    slideHeight: {
      height: `calc(100vh - ${tabHeight +
        (withAppBar ? 56 : 0) +
        bottomNavigationHeight}px)`,
      [`${breakpoints.up("xs")} and (orientation: landscape)`]: {
        height: `calc(100vh - ${tabHeight +
          (withAppBar ? 48 : 0) +
          bottomNavigationHeight}px)`
      },
      [`${breakpoints.up("sm")}`]: {
        height: `calc(100vh - ${tabHeight + (withAppBar ? 64 : 0)}px)`
      }
    }
  };
}
