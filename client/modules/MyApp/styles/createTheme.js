import memoize from "fast-memoize";
import createFastMemoizeDefaultOptions from "../../../util/createFastMemoizeDefaultOptions";

import grey from "@material-ui/core/colors/grey";
import { createMuiTheme } from "@material-ui/core/styles";

function createTheme(
  { networkStatus } = {
    networkStatus: "online"
  }
) {
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
  const themeOpts = { ...baseThemeOpts, ...nsThemeOpts };
  return createMuiTheme(themeOpts);
}

const createThemeWithoutMemoize = createTheme;

const memoized = memoize(
  createTheme,
  createFastMemoizeDefaultOptions({ size: 2 })
);

export { memoized as default, createThemeWithoutMemoize };
