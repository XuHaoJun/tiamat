import Immutable from "immutable";
// Import Actions
import {
  SET_HEADER_TITLE,
  UPDATE_APP_BAR_SEND_BUTTON_PROPS
} from "./MyAppActions";

// Initial State
const initialState = Immutable.fromJS({
  ui: {
    headerTitle: "Tiamat",
    styles: {
      body: {
        backgroundColor: null
      },
      root: {}
    },
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
    default:
      return state;
  }
};

/* Selectors */

// get headerTitle
export const getUI = state => state.app.get("ui");

// Export Reducer
export default AppReducer;
