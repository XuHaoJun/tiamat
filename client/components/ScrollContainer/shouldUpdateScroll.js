import MobileDetect from "mobile-detect";
import { matchRoutes } from "react-router-config";

import routes from "../../routes";

function isSameRoute(prevPathname, currentPathname) {
  const prevBranch = matchRoutes(routes[0].routes, prevPathname);
  const currentBranch = matchRoutes(routes[0].routes, currentPathname);
  return currentBranch.every((currentMatch, i) => {
    const prevMatch = prevBranch[i];
    if (!prevMatch) {
      return false;
    } else {
      return currentMatch.route.component === prevMatch.route.component;
    }
  });
}

export default function shouldUpdateScroll(prevRouterProps, routerProps) {
  if (prevRouterProps) {
    return !isSameRoute(
      prevRouterProps.location.pathname,
      routerProps.location.pathname
    );
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
