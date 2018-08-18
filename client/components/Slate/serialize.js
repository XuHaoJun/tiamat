import { Map } from 'immutable';
import { Value } from 'slate';
import emptyContent from './emptyContent';

const serialize = content => {
  if (Value.isValue(content)) {
    return content;
  } else {
    const jsContent = Map.isMap(content) ? content.toJS() : emptyContent.toJS();
    const value = Value.fromJS(jsContent);
    return value;
  }
};

export { serialize as default };
