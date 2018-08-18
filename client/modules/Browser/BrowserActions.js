import { calculateResponsiveState } from 'redux-responsive';
import { breakPoints } from './BrowserReducer';
import MatchMedia from 'match-media-mock';
import MobileDetect from 'mobile-detect';

export function calculateResponsiveStateByUserAgent(userAgent) {
  const mobileDetect = new MobileDetect(userAgent);
  const matchMedia = MatchMedia.create();
  if (mobileDetect.mobile()) {
    matchMedia.setConfig({ type: 'screen', width: breakPoints.small });
  } else {
    matchMedia.setConfig({ type: 'screen', width: breakPoints.large });
  }
  const _window = { matchMedia };
  return calculateResponsiveState(_window);
}

export default {};
