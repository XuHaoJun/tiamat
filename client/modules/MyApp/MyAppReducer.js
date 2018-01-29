import Immutable from "immutable";
// Import Actions
import {
  SET_HEADER_TITLE,
  UPDATE_APP_BAR_SEND_BUTTON_PROPS,
  SET_DB_IS_INITIALIZED,
  SET_IS_FIRST_RENDER,
  SET_CURRENT_PAGE
} from "./MyAppActions";

// Initial State
const initialState = Immutable.fromJS({
  isFirstRender: true,
  currentPage: "",
  db: {
    isInitialized: false
  },
  ui: {
    headerTitle: "Tiamat",
    sendButton: {
      show: false,
      loading: false,
      onTouchTap: () => {}
    }
  },
  data: {}
});

const AppReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CURRENT_PAGE: {
      const { page } = action;
      return state.set("currentPage", page);
    }
    case SET_IS_FIRST_RENDER: {
      const { isFirstRender } = action;
      return state.set("isFirstRender", isFirstRender);
    }
    case SET_HEADER_TITLE:
      return state.setIn(["ui", "headerTitle"], action.headerTitle);
    case UPDATE_APP_BAR_SEND_BUTTON_PROPS:
      let newState = state;
      for (const key in action.props) {
        if ({}.hasOwnProperty.call(action.props, key)) {
          const prop = action.props[key];
          newState = newState.setIn(["ui", "sendButton", key], prop);
        }
      }
      return newState;
    // may be add a DB module?
    case SET_DB_IS_INITIALIZED:
      const { isInitialized } = action;
      return state.setIn(["db", "isInitialized"], isInitialized);
    default:
      return state;
  }
};

/* Selectors */

// get ui
export const getUI = state => state.app.get("ui");

// get db is initialized
export const getDBisInitialized = state =>
  state.app.getIn(["db", "isInitialized"]);

export const getIsFirstRender = state => state.app.get("isFirstRender");

export const getCurrentPage = state => state.app.get("currentPage");

// Export Reducer
export default AppReducer;
