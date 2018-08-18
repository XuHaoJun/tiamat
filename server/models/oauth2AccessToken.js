import mongoose from 'mongoose';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import oauth2Config from '../configs/oauth2/app';
import Oauth2Client from './oauth2Client';

const jwtSecret = oauth2Config.jwtSecret;

const Schema = mongoose.Schema;

export const defaultExpiresDuration = moment.duration({ days: 7 });
export const defaultRefreshExpiresDuration = moment.duration({ days: 14 });

export const defaultExpiresInFunc = () =>
  moment()
    .add(defaultExpiresDuration)
    .toDate();
export const defaultRefreshExpiresInFunc = () =>
  moment()
    .add(defaultRefreshExpiresDuration)
    .toDate();

const oauth2AccessTokenSchema = new Schema({
  target: { type: String, enum: ['user', 'client'], required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Oauth2Client',
    required: true,
    index: true,
  },
  token: { type: String, required: true, index: true },
  refreshToken: { type: String, index: true },
  scope: { type: String, default: 'all' },
  redirectURI: { type: String },
  expiresIn: { type: Date, default: defaultExpiresInFunc },
  refreshExpiresIn: { type: Date, default: defaultRefreshExpiresInFunc },
  createdAt: { type: Date, default: Date.now },
});

export function createBearerToken(data = {}) {
  return jwt.sign(data, jwtSecret);
}

function getToken(accessToken) {
  let token;
  if (typeof accessToken === 'string') {
    token = accessToken;
  } else if (accessToken.token) {
    token = accessToken.token; // eslint-disable-line
  } else if (accessToken.access_token) {
    token = accessToken.access_token; // eslint-disable-line
  } else if (accessToken.get) {
    token = accessToken.get('token');
  }
  return token;
}

oauth2AccessTokenSchema.statics.verify = function(token = '', callback) {
  return jwt.verify(getToken(token), jwtSecret, callback);
};

oauth2AccessTokenSchema.statics.create = function(client, props = {}, opts = {}) {
  // FIXME
  // oauth2Config.name to appCLient.name
  const appClient = Oauth2Client.getAppClient();
  const user = props.user;
  const scope = props.scope || client.name === oauth2Config.name ? 'all' : 'public_profile';
  const now = moment();
  const expiresIn = moment(now).add(defaultExpiresDuration);
  const refreshExpiresIn = moment(now).add(defaultRefreshExpiresDuration);
  const tokenPayload = {
    iss: oauth2Config.name,
    target: 'client',
    sub: client._id,
    scope,
  };
  if (user) {
    tokenPayload.target = 'user';
    tokenPayload.sub = user._id;
  }
  const tokenString = createBearerToken(
    Object.assign({ accessTokenType: 'token', exp: expiresIn.unix() }, tokenPayload)
  );
  const refreshTokenString = createBearerToken(
    Object.assign(
      {
        accessTokenType: 'refresh',
        exp: refreshExpiresIn.unix(),
      },
      tokenPayload
    )
  );
  const overideProps = {
    target: 'client',
    client: client._id,
    token: tokenString,
    expiresIn: expiresIn.toDate(),
    refreshToken: refreshTokenString,
    refreshExpiresIn: refreshExpiresIn.toDate(),
    scope,
  };
  if (user) {
    overideProps.target = 'user';
    overideProps.user = user._id;
  } else {
    delete overideProps.refreshToken;
    delete overideProps.refreshExpiresIn;
  }
  if (opts.disableRefreshToken) {
    delete overideProps.refreshToken;
    delete overideProps.refreshExpiresIn;
  }
  const finalProps = Object.assign({}, props, overideProps);
  return new this(finalProps);
};

export default mongoose.model('Oauth2AccessToken', oauth2AccessTokenSchema);
