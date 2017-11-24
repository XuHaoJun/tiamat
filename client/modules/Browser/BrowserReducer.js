import { createResponsiveStateReducer } from "redux-responsive";

const breakPoints = {
  extraSmall: 1,
  small: 600,
  medium: 960,
  large: 1280,
  extraLarge: 1920
};

const browser = createResponsiveStateReducer(breakPoints, {
  initialMediaType: "small"
});

export default browser;

export { breakPoints };
