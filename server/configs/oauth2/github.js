import {callbackURLPrefix} from '../server';

const callbackURL = process.env.NODE_ENV === 'production'
  ? `${callbackURLPrefix}/api/oauth2/github/callback`
  : 'http://localhost:8000/api/oauth2/github/callback';

const githubApp = {
  clientID: '',
  clientSecret: '',
  callbackURL
};

export default githubApp;
