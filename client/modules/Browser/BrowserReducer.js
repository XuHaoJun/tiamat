import { createResponsiveStateReducer } from "redux-responsive";

const breakPoint = {
  extraSmall: 412,
  small: 500,
  medium: 768,
  large: 992,
  extraLarge: 1200
};

const browser = createResponsiveStateReducer(breakPoint, {
  initialMediaType: "small"
});

export default browser;
