import passport from 'passport';
import { BasicStrategy } from 'passport-http';
import { Strategy as ClientPasswordStrategy } from 'passport-oauth2-client-password';
import BearerStrategy from 'passport-http-bearer';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// import models
import User, { genRandomPassword } from '../models/user';
import Client from '../models/oauth2Client';
import AccessToken from '../models/oauth2AccessToken';

// import third party oauth2 client app config
import facebookConfig from './oauth2/facebook';
import googleConfig from './oauth2/google';

function userAuth(emailOri, password, done) {
  const email = emailOri.toLowerCase();
  User.findOne(
    {
      email,
    },
    (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: `Email ${email} not found.` });
      }
      return user.comparePassword(password, (err2, isMatch) => {
        if (isMatch) {
          return done(null, user);
        }
        return done(null, false, { message: 'Invalid email or password.' });
      });
    }
  );
}

function clientAuth(id, secret, done) {
  Client.findOne(
    {
      _id: id,
    },
    (err, client) => {
      if (err) {
        return done(err);
      }
      if (!client) {
        return done(null, false);
      }
      if (client.secret !== secret) {
        return done(null, false);
      }
      return done(null, client);
    }
  );
}

// TODO
// support multi passport.
function findOrInsertUser(oauth2Info) {
  const { providerName, accessToken, refreshToken, profile, cb } = oauth2Info;
  const thirdUserId = profile.id;
  const query = {
    'passports.providerName': providerName,
    'passports.thirdUserId': thirdUserId,
  };
  const email = profile.emails[0].value.toLowerCase();
  const oauth2Passport = {
    providerName,
    thirdUserId,
    profile,
  };
  const userArgs = {
    email,
    password: genRandomPassword(),
    passports: [oauth2Passport],
  };
  const newUser = new User(userArgs);
  const update = { $setOnInsert: newUser };
  const opts = { new: true, upsert: true };
  return User.findOneAndUpdate(query, update, opts)
    .then(user => {
      cb(null, user);
    })
    .catch(err => {
      cb(err, null);
    });
}

export default function config() {
  // login by email and password
  passport.use('basic', new BasicStrategy(userAuth));

  passport.use('clientBasic', new BasicStrategy(clientAuth));

  passport.use(new ClientPasswordStrategy(clientAuth));

  if (facebookConfig.clientID && facebookConfig.clientSecret) {
    passport.use(
      new FacebookStrategy(facebookConfig, (accessToken, refreshToken, profile, cb) => {
        const oauth2Info = {
          providerName: 'facebook',
          accessToken,
          refreshToken,
          profile,
          cb,
        };
        findOrInsertUser(oauth2Info);
      })
    );
  }

  if (googleConfig.clientID && googleConfig.clientSecret) {
    passport.use(
      new GoogleStrategy(googleConfig, (accessToken, refreshToken, profile, cb) => {
        const oauth2Info = {
          providerName: 'google',
          accessToken,
          refreshToken,
          profile,
          cb,
        };
        findOrInsertUser(oauth2Info);
      })
    );
  }

  //   Don't need validate again token, just trust json web token(https://tools.ietf.org/html/rfc7519)
  // that will verify it, and either trust token's json payload(userid, clientid....) for auth.
  //   Token generally store in browser indexedDB(default) and it's follow same-origin policy,
  // that will protect your token from XSS attack.
  passport.use(
    'bearer-jwt',
    new BearerStrategy((tokenString, done) => {
      AccessToken.verify(tokenString, (err, payload) => {
        if (err) {
          done(err);
        } else {
          const { target, sub, scope } = payload;
          if (!target || !sub || !scope) {
            done(null, false);
          } else {
            if (target === 'client') {
              Client.findOne({ _id: sub })
                .exec()
                .then(client => {
                  if (!client) {
                    done(null, false);
                  } else {
                    done(null, client, scope);
                  }
                  return null;
                })
                .catch(er => {
                  done(er);
                  return er;
                });
            } else if (target === 'user') {
              User.findById(sub)
                .select({ password: 0 })
                .exec()
                .then(user => {
                  if (!user) {
                    done(null, false);
                  } else {
                    done(null, user, scope);
                  }
                  return null;
                })
                .catch(er => {
                  done(er);
                  return er;
                });
            } else {
              done(null, false);
            }
          }
        }
      });
    })
  );

  passport.use(
    'bearer',
    new BearerStrategy((tokenString, done) => {
      // TODO
      // improve performance by find user or client on demand
      return AccessToken.findOne({ token: tokenString })
        .populate('user')
        .populate('client')
        .exec((err, token) => {
          if (err) {
            return done(err);
          }
          if (!token) {
            return done(null, false);
          } else if (token.user) {
            return done(null, token.user, token.scope);
          } else if (token.client) {
            return done(null, token.client, token.scope);
          } else {
            return done(null, false);
          }
        });
    })
  );
}
