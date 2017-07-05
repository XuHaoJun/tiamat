// Export Constants
export const SET_USER_AGENT = "SET_USER_AGENT";

export function setUserAgent(userAgent) {
  return { type: SET_USER_AGENT, userAgent };
}
