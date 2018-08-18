import { createStore } from 'redux';

export const PREFIX_STORE_KEY = 'slate-editor';

let editorIdCounter = 0;

export const defaultGenerateEditorId = () => {
  editorIdCounter += 1;
  return editorIdCounter;
};

export const resetEditorId = () => {
  editorIdCounter = 0;
};

// TODO
// support custom generate func
export const getStoreKey = ({ key, id }) => {
  if (key || id) {
    return `${PREFIX_STORE_KEY}-${key || id}`;
  } else {
    return `${PREFIX_STORE_KEY}-${defaultGenerateEditorId()}`;
  }
};

export function configureStore({ initialState, reducer }) {
  const store = createStore(reducer, initialState);
  return store;
}

export default configureStore;
