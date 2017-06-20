// Export Constants
export const SET_OAUTH2_CLIENT = 'SET_OAUTH2_CLIENT';

export function setOauth2Client(oauth2Client, source = 'app') {
  return {type: SET_OAUTH2_CLIENT, oauth2Client, source};
}
