// Export Constants
export const SET_HEADER_TITLE = 'SET_HEADER_TITLE';
export const UPDATE_APP_BAR_SEND_BUTTON_PROPS = 'UPDATE_APP_BAR_SEND_BUTTON_PROPS';

// Export Actions
export function setHeaderTitle(headerTitle) {
  return {type: SET_HEADER_TITLE, headerTitle};
}

export function setHeaderTitleThunk(headerTitle) {
  return (dispatch) => {
    return Promise.resolve(dispatch(setHeaderTitle(headerTitle)));
  };
}

export function updateSendButtonProps(props) {
  return {type: UPDATE_APP_BAR_SEND_BUTTON_PROPS, props};
}
