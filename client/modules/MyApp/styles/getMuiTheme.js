import _cloneDeep from "lodash/cloneDeep";
import memoize from "fast-memoize";
import createFastMemoizeDefaultOptions from "../../../util/createFastMemoizeDefaultOptions";

import {
  cyan500,
  cyan700,
  grey100,
  grey300,
  grey400,
  grey500,
  white,
  darkBlack,
  fullBlack
} from "material-ui/styles/colors";
import { fade } from "material-ui/utils/colorManipulator";
import getMuiThemeOri from "./_getMuiTheme";

// FIXME
//   getMuiTheme will overide something make responsive theme not work,
// workaround way use _cloneDeep.
const defaultMuiTheme = _cloneDeep(
  getMuiThemeOri({
    fontFamily:
      '"Noto Sans TC", "Helvetica Neue", "Calibri Light", Roboto, sans-serif, sans-serif'
  })
);

const mobileMuiTheme = _cloneDeep(defaultMuiTheme);

const desktopMuiTheme = getMuiThemeOri(_cloneDeep(defaultMuiTheme), {
  appBar: {
    color: white,
    textColor: darkBlack
  },
  drawer: {
    color: "#FAFAFA"
  },
  tabs: {
    backgroundColor: white,
    textColor: fade(darkBlack, 0.45),
    selectedTextColor: darkBlack
  },
  inkBar: {
    backgroundColor: "#6E6E6E"
  },
  palette: {
    primary1Color: cyan500,
    primary2Color: cyan700,
    primary3Color: grey400,
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: cyan500,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack
  },
  zIndex: {
    menu: 1000,
    drawerOverlay: 1200,
    drawer: 1300,
    appBar: 1301,
    dialogOverlay: 1400,
    dialog: 1500,
    layer: 2000,
    popover: 2100,
    snackbar: 2900,
    tooltip: 3000
  }
});

function getMuiTheme(
  userAgent,
  { isMobileSize, isOffline } = { isMobileSize: true, isOffline: false }
) {
  const base = _cloneDeep(isMobileSize ? mobileMuiTheme : desktopMuiTheme);
  if (isOffline) {
    return getMuiThemeOri(base, {
      appBar: {
        color: grey500,
        textColor: white
      },
      userAgent
    });
  } else {
    return getMuiThemeOri(base, {
      userAgent
    });
  }
}

const _memorizedGetMuiTheme = memoize(
  getMuiTheme,
  Object.assign(createFastMemoizeDefaultOptions(5), {
    strategy: memoize.strategies.variadic
  })
);

export function memorizedGetMuiTheme(
  userAgent,
  { isMobileSize, isOffline } = { isMobileSize: true, isOffline: false }
) {
  return _memorizedGetMuiTheme(userAgent, { isMobileSize, isOffline });
}

export default getMuiTheme;
