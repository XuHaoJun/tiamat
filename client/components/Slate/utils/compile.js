import { Iterable, fromJS, List } from 'immutable';

import compileTemplate from '../../../modules/Template/utils/compile';
import getTemplates from './getTemplates';

// no depent on slate's value model ver.
export default async function compile(preValue, { dispatch }) {
  const slateValue = Iterable.isIterable(preValue) ? preValue : fromJS(preValue);
  const templatePayloads = getTemplates(slateValue);
  const modules = List(
    await Promise.all(
      templatePayloads.map(payload => {
        const template = payload.get('template');
        const moduleCompiling = compileTemplate(template, { dispatch });
        return moduleCompiling;
      })
    )
  );
  let nextValue = slateValue;
  templatePayloads.forEach((payload, index) => {
    const nodePath = payload.get('nodePath');
    const path = nodePath.concat(List(['data', 'module']));
    const module = modules.get(index);
    nextValue = nextValue.setIn(path, module);
  });
  return nextValue;
}
