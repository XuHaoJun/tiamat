// Export Constants
export const ADD_ERROR = 'ADD_ERROR';

export function addError(error) {
  return { type: ADD_ERROR, error };
}

export function defaultRequestCatchHandler(dispatch, err = {}) {
  if (err.response) {
    return Promise.resolve(dispatch(addError(err.response.data))).then(() => {
      return Promise.reject(err);
    });
  } else {
    return Promise.reject(err);
  }
}

export const defaultRequestErrorHandler = defaultRequestCatchHandler;
