import { Value } from 'slate';
import Plain from 'slate-plain-serializer';

export default function contentToText(content) {
  const value = Value.fromJSON(content);
  const text = Plain.serialize(value);
  return text;
}
