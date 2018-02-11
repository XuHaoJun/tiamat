// Export Actions
export const prefix = "@TIAMAT/MYAPP/";

export const SET_NETWORK_STATUS = `${prefix}SET_NETWORK_STATUS`;
export function setNetworkStatus(networkStatus) {
  return { type: SET_NETWORK_STATUS, networkStatus };
}

export const SET_HEADER_TITLE = `${prefix}SET_HEADER_TITLE`;
export function setHeaderTitle(headerTitle) {
  return { type: SET_HEADER_TITLE, headerTitle };
}

export const SET_CURRENT_PAGE = `${prefix}SET_CURRENT_PAGE`;
export function setCurrentPage(page) {
  return { type: SET_CURRENT_PAGE, page };
}

export const SET_DB_IS_INITIALIZED = `${prefix}SET_DB_IS_INITIALIZED`;
export function setDBisInitialized(error, isInitialized = false) {
  return { type: SET_DB_IS_INITIALIZED, error, isInitialized };
}

export const SET_IS_FIRST_RENDER = `${prefix}SET_IS_FIRST_RENDER`;
export function setIsFirstRender(isFirstRender = false) {
  return { type: SET_IS_FIRST_RENDER, isFirstRender };
}

export const UPDATE_APP_BAR_SEND_BUTTON_PROPS = `${prefix}UPDATE_APP_BAR_SEND_BUTTON_PROPS`;
export function updateSendButtonProps(props) {
  return { type: UPDATE_APP_BAR_SEND_BUTTON_PROPS, props };
}
