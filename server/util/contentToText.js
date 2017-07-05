import Slate from "slate";

export default function contentToText(content) {
  const state = Slate.Raw.deserialize(content, { terse: true });
  return state.document.text;
}
