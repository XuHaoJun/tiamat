import { connect } from "react-redux";

import { getCurrentAccessToken } from "../UserReducer";
import { logOutRequest } from "../UserActions";

export default function logOutRequestComposeEvent(
  WrappedComponent,
  _eventNames = []
) {
  let eventNames = _eventNames;
  if (typeof eventNames === "string") {
    eventNames = [eventNames];
  }
  if (!eventNames || eventNames.length === 0) {
    return WrappedComponent;
  }
  const ConnectedComponent = connect(
    state => {
      const accessToken = getCurrentAccessToken(state);
      return { accessToken };
    },
    null,
    (stateProps, dispatchProps, ownProps) => {
      const { accessToken } = stateProps;
      const { dispatch } = dispatchProps;
      const injectedEvents = {};
      for (const eventName of eventNames) {
        const oldEventCallback = ownProps[eventName];
        const eventCallback = (...args) => {
          dispatch(logOutRequest(accessToken));
          if (oldEventCallback) {
            oldEventCallback(...args);
          }
        };
        injectedEvents[eventName] = eventCallback;
      }
      return {
        ...ownProps,
        ...injectedEvents
      };
    }
  )(WrappedComponent);
  ConnectedComponent.defaultProps = WrappedComponent.defaultProps;
  return ConnectedComponent;
}
