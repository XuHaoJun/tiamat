import grey from "material-ui-next/colors/grey";

import { createMuiTheme } from "material-ui-next/styles";

const createTheme = ({ networkStatus } = { networkStatus: "online" }) => {
  let themeOpts;
  const baseOpts = {
    overrides: {
      MuiList: {
        root: {
          boxSizing: "border-box"
        }
      }
    }
  };
  if (networkStatus === "offline") {
    themeOpts = Object.assign({}, baseOpts, {
      palette: {
        primary: grey
      }
    });
  } else {
    themeOpts = baseOpts;
  }
  return createMuiTheme(themeOpts);
};

export default createTheme;
