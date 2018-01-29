import MobileDetect from "mobile-detect";

export default function shouldUpdateScroll(prevRouterProps, routerProps) {
  if (prevRouterProps) {
    if (
      prevRouterProps.location.pathname === routerProps.location.pathname &&
      routerProps.location.action === "REPLACE"
    ) {
      return false;
    } else {
      let isSameComponent = false;
      prevRouterProps.components.forEach((component, index) => {
        isSameComponent = routerProps.components[index] === component;
      });
      return !isSameComponent;
    }
  } else {
    const userAgent = navigator ? navigator.userAgent : "";
    if (userAgent) {
      const mobileDetect = new MobileDetect(userAgent);
      if (mobileDetect.mobile()) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
}
