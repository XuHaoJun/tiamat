import _findIndex from "lodash/findIndex";
import { LOCATION_CHANGE } from "react-router-redux";

import { connectDB } from "../../localdb";
import { SET_HISTORY_STATE, SET_HISTORY_CURSOR } from "./HistoryActions";

const initialState = {
  prevCursor: "/",
  cursor: "/",
  stacks: {
    "/": []
  },
  popedStacks: {
    "/": []
  }
};

function save(db, state) {
  if (db) {
    return db.setItem("history", state);
  } else {
    return null;
  }
}

function getKey(l) {
  let k;
  if (l.state && l.state.oriKey) {
    k = l.state.oriKey;
  } else {
    k = l.key;
  }
  return k;
}

function eqByKey(l1, l2) {
  return getKey(l1) === getKey(l2);
}

function equal(l1, l2) {
  return (
    l1.pathname === l2.pathname &&
    l1.search === l2.search &&
    l1.hash === l2.hash
  );
}

function limitStack(stack) {
  if (stack.length > 100) {
    stack.slice(-20, -1);
  }
  return stack;
}

const _HistoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_HISTORY_STATE: {
      return action.state || state;
    }
    case SET_HISTORY_CURSOR: {
      const { cursor } = action;
      return { ...state, cursor, prevCursor: state.cursor };
    }
    case LOCATION_CHANGE: {
      const location = action.payload;
      switch (location.action) {
        // TODO
        // let push support forward for change cursor.
        case "PUSH": {
          const { cursor, stacks } = state;
          const stack = stacks[cursor] || [];
          const index = _findIndex(stack, l => {
            return eqByKey(l, location);
          });
          if (index > -1) {
            stack[index] = location;
          } else {
            stack.unshift(location);
          }
          limitStack(stack);
          stacks[cursor] = stack;
          const nextStacks = stacks;
          const nextState = {
            ...state,
            stacks: nextStacks
          };
          return nextState;
        }
        case "REPLACE": {
          const { cursor, stacks } = state;
          const stack = stacks[cursor];
          if (stack && stack.length > 0) {
            const head = stack[0];
            if (eqByKey(head, location)) {
              stack[0] = location;
              stacks[cursor] = stack;
              const nextStacks = stacks;
              const nextState = { ...state, stacks: nextStacks };
              return nextState;
            } else {
              return state;
            }
          } else {
            return state;
          }
        }
        // TODO
        // refactor it.
        case "POP": {
          const { cursor, stacks, popedStacks } = state;
          let nextCursor = cursor;
          let changed = false;
          for (const _cursor in stacks) {
            if ({}.hasOwnProperty.call(stacks, _cursor)) {
              const stack = stacks[_cursor] || [];
              const index = _findIndex(stack, l => {
                return eqByKey(l, location);
              });
              if (index > -1) {
                nextCursor = _cursor;
                const poped = stack.splice(index, 1)[0];
                const popedStack = popedStacks[_cursor] || [];
                popedStack.unshift(poped);
                limitStack(popedStack);
                stacks[_cursor] = stack;
                changed = true;
                break;
              }
            }
          }
          if (!changed) {
            for (const _cursor in stacks) {
              if ({}.hasOwnProperty.call(stacks, _cursor)) {
                const stack = stacks[_cursor] || [];
                const index = _findIndex(stack, l => {
                  return equal(l, location);
                });
                if (index > -1) {
                  nextCursor = _cursor;
                  const poped = stack.splice(index, 1)[0];
                  const popedStack = popedStacks[_cursor] || [];
                  popedStack.unshift(poped);
                  limitStack(popedStacks[_cursor]);
                  stacks[_cursor] = stack;
                  changed = true;
                  break;
                }
              }
            }
          }
          if (!changed) {
            for (const _cursor in popedStacks) {
              if ({}.hasOwnProperty.call(popedStacks, _cursor)) {
                const stack = popedStacks[_cursor] || [];
                const index = _findIndex(stack, l => {
                  return eqByKey(l, location) || equal(l, location);
                });
                if (index > -1) {
                  nextCursor = _cursor;
                  changed = true;
                  break;
                }
              }
            }
          }
          if (changed) {
            const nextState = { ...state, cursor: nextCursor };
            return nextState;
          } else {
            return state;
          }
        }
        default:
          return state;
      }
    }
    default:
      return state;
  }
};

const HistoryReducer = (state = initialState, action) => {
  const nextState = _HistoryReducer(state, action);
  const db = connectDB();
  save(db, nextState);
  return nextState;
};

export const getHistory = state => {
  return state.history;
};

export const getCursor = state => {
  return state.history.cursor;
};

export const getStackByCursor = (state, cursor) => {
  return state.history.stacks[cursor];
};

export default HistoryReducer;