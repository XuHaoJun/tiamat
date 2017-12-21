// Export Constants
export const SET_HEADER_TITLE = "SET_HEADER_TITLE";
export const UPDATE_APP_BAR_SEND_BUTTON_PROPS =
  "UPDATE_APP_BAR_SEND_BUTTON_PROPS";
export const SET_DB_IS_INITIALIZED = "SET_DB_IS_INITIALIZED";

// Export Actions
export function setHeaderTitle(headerTitle) {
  return { type: SET_HEADER_TITLE, headerTitle };
}

export function setDBisInitialized(error, isInitialized = false) {
  return { type: SET_DB_IS_INITIALIZED, error, isInitialized };
}

export function setHeaderTitleThunk(headerTitle) {
  return dispatch => {
    return Promise.resolve(dispatch(setHeaderTitle(headerTitle)));
  };
}

export function updateSendButtonProps(props) {
  return { type: UPDATE_APP_BAR_SEND_BUTTON_PROPS, props };
}
