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
  oauth2orize.grant.code(async (client, redirectURI, user, ares, done) => {
    try {
      const props = {
        redirectURI,
        client: client._id,
        user: user._id,
        scope: ares.scope,
      };
      const ac = new AuthorizationCode(props);
      const saved = await ac.save();
      return done(null, saved.code);
    } catch (err) {
      return done(err);
    }
  })
);

server.grant(
  oauth2orize.grant.token(async (client, user, ares, done) => {
    try {
      const { scope } = ares;
      const props = {
        user,
        scope,
      };
      const token = AccessToken.create(client, props);
      const saved = await token.save();
      return done(null, saved);
    } catch (err) {
      return done(err);
    }
  })
);

server.exchange(
  oauth2orize.exchange.code(async (clientForm, codeString, redirectURI, done) => {
    try {
      const code = await AuthorizationCode.findOne({ code: codeString })
        .populate('user')
        .populate('client')
        .exec();

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
      const saved = await token.save();
      return done(null, saved);
    } catch (err) {
      return done(err);
    }
  })
);

server.exchange(
  oauth2orize.exchange.password(async (reqClient, email, password, scope, done) => {
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
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, {
          message: 'Invalid email or password.',
        });
      }

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
    } catch (err) {
      return done(err);
    }
  })
);

server.exchange(
  oauth2orize.exchange.clientCredentials(async (reqClient, scope, done) => {
    try {
      const client = await Client.findById(reqClient._id).exec();
      
      if (!client) {
        return done(null, false);
      }
      
      if (client._id.toString() !== reqClient._id.toString()) {
        return done(null, false);
      }

      const accessToken = AccessToken.create(client);
      const saved = await accessToken.save();
      return done(null, saved);
    } catch (err) {
      return done(err);
    }
  })
);

async function deleteToken(req, res) {
  try {
    const { token } = req.params;
    await AccessToken.remove({ token }).exec();
    res.json(true);
  } catch (err) {
    res.status(403).send(err);
  }
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
