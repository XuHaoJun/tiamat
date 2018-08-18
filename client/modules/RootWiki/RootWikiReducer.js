import { fromJS, Set, Record } from 'immutable';
import defaultSameIdElesMax from '../../util/defaultSameIdElesMax';
import { ADD_ROOT_WIKI } from './RootWikiActions';

const ROOT_WIKI_RECORD_DEFAULT = {
  _id: null,
  name: null,
  content: null,
  groupTree: fromJS({}),
  forumBoard: null,
  popularityCounter: 0,
  createdAt: null,
  updatedAt: null,
};

export class RootWiki extends Record(ROOT_WIKI_RECORD_DEFAULT) {
  static fromJS(obj = {}) {
    const record = new RootWiki({
      ...obj,
      content: fromJS(obj.content),
      groupTree: fromJS(obj.groupTree),
      createdAt: new Date(obj.createdAt),
      updatedAt: new Date(obj.updatedAt),
    });
    return record;
  }
}

const ROOT_WIKI_STATE_RECORD_DEFAULT = {
  ui: fromJS({
    form: {
      name: '',
      content: null,
    },
  }),
  data: new Set(),
};

export class RootWikiState extends Record(ROOT_WIKI_STATE_RECORD_DEFAULT) {
  static fromJS({ ui, data = [] } = {}) {
    const record = new RootWikiState({
      ui: fromJS(ui),
      data: Set(data.map(RootWiki.fromJS)),
    });
    return record;
  }
}

// Initial State
const initialState = new RootWikiState();

const RootWikiReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_ROOT_WIKI:
      const newRootWikis = Set([RootWiki.fromJS(action.rootWiki)]);
      const data = state.data
        .union(newRootWikis)
        .groupBy(ele => ele._id)
        .map(defaultSameIdElesMax)
        .toSet();
      return state.set('data', data);

    default:
      return state;
  }
};

/* Selectors */

// Get all posts
export const getUI = state => state.rootWikis.get('ui');

export const getRootWiki = (state, _id) =>
  state.rootWikis.get('data').find(v => v.get('_id') === _id);

export const getRootWikiById = getRootWiki;

// Export Reducer
export default RootWikiReducer;
