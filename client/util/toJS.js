export default function toJS(obj) {
  if (obj && obj.toJS) {
    return obj.toJS();
  } else {
    return obj;
  }
}
