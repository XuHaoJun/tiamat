// Export Constants
export const SET_HEADER_TITLE = "SET_HEADER_TITLE";
export const UPDATE_APP_BAR_SEND_BUTTON_PROPS =
  "UPDATE_APP_BAR_SEND_BUTTON_PROPS";
export const SET_DB_IS_INITIALIZED = "SET_DB_IS_INITIALIZED";
export const SET_IS_FIRST_RENDER = "SET_IS_FIRST_RENDER";
export const SET_CURRENT_PAGE = "SET_CURRENT_PAGE";

// Export Actions
export function setHeaderTitle(headerTitle) {
  return { type: SET_HEADER_TITLE, headerTitle };
}

export function setCurrentPage(page) {
  return { type: SET_CURRENT_PAGE, page };
}

export function setDBisInitialized(error, isInitialized = false) {
  return { type: SET_DB_IS_INITIALIZED, error, isInitialized };
}

export function setIsFirstRender(isFirstRender = false) {
  return { type: SET_IS_FIRST_RENDER, isFirstRender };
}

export function setHeaderTitleThunk(headerTitle) {
  return dispatch => {
    return Promise.resolve(dispatch(setHeaderTitle(headerTitle)));
  };
}

export function updateSendButtonProps(props) {
  return { type: UPDATE_APP_BAR_SEND_BUTTON_PROPS, props };
}
