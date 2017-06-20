import oauth2orize from 'oauth2orize';
// import {Exchange as jwtBearer} from 'oauth2orize-jwt-bearer';
import AuthorizationCode from '../models/oauth2AuthorizationCode';
import AccessToken from '../models/oauth2AccessToken';
import User from '../models/user';

const server = oauth2orize.createServer();

server.grant(oauth2orize.grant.code((client, redirectURI, user, ares, done) => {
  const props = {
    redirectURI,
    client: client._id,
    user: user._id,
    scope: ares.scope
  };
  const ac = new AuthorizationCode(props);
  ac.save((err) => {
    if (err) {
      return done(err);
    }
    return done(null, ac.code);
  });
}));

server.exchange(oauth2orize.exchange.code((clientForm, codeString, redirectURI, done) => {
  AuthorizationCode
    .findOne({codeString})
    .populate('user')
    .populate('client')
    .exec()
    .then((code) => {
      if (clientForm.id !== code.client._id.toString()) {
        return done(null, false);
      }
      if (redirectURI !== code.redirectURI) {
        return done(null, false);
      }
      const user = code.user;
      const client = code.client;
      const scope = code.scope;
      const props = {
        scope
      };
      const token = AccessToken.create(user, client, props);
      return token.save((atErr) => {
        if (atErr) {
          return done(atErr);
        }
        return done(null, token);
      });
    })
    .catch((err) => {
      return done(err);
    });
}));

server.exchange(oauth2orize.exchange.password((client, email, password, scope, done) => {
  User.findOne({
    email
  }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false);
    }
    return user.comparePassword(password, (err2, isMatch) => {
      if (isMatch) {
        const props = {
          scope
        };
        const token = AccessToken.create(user, client, props);
        token.save((err3) => {
          if (err3) {
            return done(err3);
          }
          return done(null, token.token, token.refreshToken);
        });
      } else {
        return done(null, false, {message: 'Invalid email or password.'});
      }
      return isMatch;
    });
  });
}));

// server.exchange('urn:ietf:params:oauth:grant-type:jwt-bearer', jwtBearer((client, data,
// signature, done) => {    console.log('server jwt', client, data, signature); }));

export default server;
