import oauth2orize from 'oauth2orize';
import Client from '../models/oauth2Client';
import AuthorizationCode from '../models/oauth2AuthorizationCode';
import AccessToken, {
  defaultExpiresDuration,
  defaultRefreshExpiresDuration,
} from '../models/oauth2AccessToken';
import User from '../models/user';

const server = oauth2orize.createServer();

server.grant(
  oauth2orize.grant.code((client, redirectURI, user, ares, done) => {
    const props = {
      redirectURI,
      client: client._id,
      user: user._id,
      scope: ares.scope,
    };
    const ac = new AuthorizationCode(props);
    ac.save(err => {
      if (err) {
        return done(err);
      }
      return done(null, ac.code);
    });
  })
);

server.grant(
  oauth2orize.grant.token((client, user, ares, done) => {
    const { scope } = ares;
    const props = {
      user,
      scope,
    };
    const token = AccessToken.create(client, props);
    return token.save(atErr => {
      if (atErr) {
        return done(atErr);
      }
      return done(null, token);
    });
  })
);

server.exchange(
  oauth2orize.exchange.code((clientForm, codeString, redirectURI, done) => {
    AuthorizationCode.findOne({ code: codeString })
      .populate('user')
      .populate('client')
      .exec()
      .then(code => {
        if (clientForm.id !== code.client._id.toString()) {
          return done(null, false);
        }
        if (redirectURI !== code.redirectURI) {
          return done(null, false);
        }
        const { user, client, scope } = code;
        const props = {
          user,
          scope,
        };
        const token = AccessToken.create(client, props);
        return token.save(atErr => {
          if (atErr) {
            return done(atErr);
          }
          return done(null, token);
        });
      })
      .catch(err => {
        return done(err);
      });
  })
);

server.exchange(
  oauth2orize.exchange.password(async (reqClient, email, password, scope, done) => {
    // TODO
    // validate by scope
    try {
      const [user, client] = await Promise.all([
        User.findOne({ email }).exec(),
        Client.findOne({
          _id: reqClient._id,
          secret: reqClient.secret,
        }).exec(),
      ]);
      if (!user || !client) {
        return done(null, false);
      } else {
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, {
            message: 'Invalid email or password.',
          });
        } else {
          const props = {
            user,
            scope,
          };
          const token = AccessToken.create(client, props);
          const saved = await token.save();
          return done(null, saved.token, {
            refresh_token: saved.refreshToken,
            expires_in: defaultExpiresDuration.asSeconds(),
            refresh_expires_in: defaultRefreshExpiresDuration.asSeconds(),
          });
        }
      }
    } catch (err) {
      // TODO
      // should handle comparePassword err or mongo err
      // throw other err
      return done(err);
    }
  })
);

server.exchange(
  oauth2orize.exchange.clientCredentials((reqClient, scope, done) => {
    // TODO
    // trust passport validated reqClient?
    // Validate the client
    Client.findById(reqClient._id)
      .exec()
      .then(client => {
        if (!client) {
          return done(null, false);
        }
        if (client._id.toString() !== reqClient._id.toString()) {
          return done(null, false);
        } else {
          const accessToken = AccessToken.create(client);
          accessToken.save((err, saved) => {
            if (err) {
              return done(err);
            } else {
              return done(null, saved);
            }
          });
          return undefined;
        }
      })
      .catch(err => {
        return done(err);
      });
  })
);

function deleteToken(req, res) {
  const { token } = req.params;
  AccessToken.remove({ token })
    .exec()
    .then(() => {
      res.json(true);
    })
    .catch(err => {
      res.status(403).send(err);
    });
}

import login from 'connect-ensure-login';

const decision = [login.ensureLoggedIn(), server.decision()];

import passport from 'passport';

const token = [
  passport.authenticate(['clientBasic', 'oauth2-client-password'], {
    session: false,
  }),
  server.token(),
  server.errorHandler(),
];

const addToken = token;

export { server as default, decision, token, addToken, deleteToken };
