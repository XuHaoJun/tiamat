import grey from "material-ui-next/colors/grey";

import { createMuiTheme } from "material-ui-next/styles";

const createTheme = (
  { networkStatus, pageThemeOptions } = {
    networkStatus: "online",
    pageThemeOptions: {}
  }
) => {
  const baseThemeOpts = {
    overrides: {
      MuiList: {
        root: {
          boxSizing: "border-box"
        }
      }
    }
  };
  const offlineThemeOpts = {
    palette: {
      primary: grey
    }
  };
  const nsThemeOpts = networkStatus === "offline" ? offlineThemeOpts : {};
  const themeOpts = { ...baseThemeOpts, ...pageThemeOptions, ...nsThemeOpts };
  return createMuiTheme(themeOpts);
};

export default createTheme;
