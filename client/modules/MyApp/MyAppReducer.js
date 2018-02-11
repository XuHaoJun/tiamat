import Immutable from "immutable";
import createTheme from "./styles/createTheme";
import toJS from "../../util/toJS";

// Import Actions
import {
  SET_NETWORK_STATUS,
  SET_HEADER_TITLE,
  UPDATE_APP_BAR_SEND_BUTTON_PROPS,
  SET_DB_IS_INITIALIZED,
  SET_IS_FIRST_RENDER,
  SET_CURRENT_PAGE
} from "./MyAppActions";

export function getDefaultNetworkStatus() {
  if (process.browser) {
    return window.navigator.onLine ? "online" : "offline";
  } else {
    return "online";
  }
}

// Initial State
const initialState = Immutable.fromJS({
  isFirstRender: true,
  currentPage: "",
  networkStatus: getDefaultNetworkStatus(),
  db: {
    isInitialized: false
  },
  ui: {
    pageThemeOptions: {},
    header: {
      title: "Tiamat"
    },
    sendButtonProps: {
      show: false,
      loading: false,
      onClick: () => {}
    }
  }
});

const AppReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_NETWORK_STATUS: {
      const { networkStatus } = action;
      return state.set("networkStatus", networkStatus);
    }

    case SET_CURRENT_PAGE: {
      const { page } = action;
      return state.set("currentPage", page);
    }

    case SET_IS_FIRST_RENDER: {
      const { isFirstRender } = action;
      return state.set("isFirstRender", isFirstRender);
    }

    case SET_HEADER_TITLE: {
      return state.setIn(["ui", "header", "title"], action.headerTitle);
    }

    case UPDATE_APP_BAR_SEND_BUTTON_PROPS: {
      let newState = state;
      for (const key in action.props) {
        if ({}.hasOwnProperty.call(action.props, key)) {
          const prop = action.props[key];
          newState = newState.setIn(["ui", "sendButtonProps", key], prop);
        }
      }
      return newState;
    }

    // may be add a DB module?
    case SET_DB_IS_INITIALIZED: {
      const { isInitialized } = action;
      return state.setIn(["db", "isInitialized"], isInitialized);
    }

    default:
      return state;
  }
};

/* Selectors */

// ui Selectors
export const getUI = state => state.app.get("ui");

export const getTheme = state => {
  const networkStatus = state.app.get("networkStatus");
  return createTheme({ networkStatus });
};

// other Selectors

export const getDBisInitialized = state =>
  state.app.getIn(["db", "isInitialized"]);

export const getIsFirstRender = state => state.app.get("isFirstRender");

export const getCurrentPage = state => state.app.get("currentPage");

// Export Reducer
export default AppReducer;
