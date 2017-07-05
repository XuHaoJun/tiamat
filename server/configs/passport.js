import passport from "passport";
import { BasicStrategy } from "passport-http";
import { Strategy as ClientPasswordStrategy } from "passport-oauth2-client-password";
import BearerStrategy from "passport-http-bearer";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// import models
import User, { genRandomPassword } from "../models/user";
import Client from "../models/oauth2Client";
import AccessToken from "../models/oauth2AccessToken";

// import third party oauth2 client app config
import facebookConfig from "./oauth2/facebook";
import googleConfig from "./oauth2/google";

function userAuth(emailOri, password, done) {
  const email = emailOri.toLowerCase();
  User.findOne(
    {
      email
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
        return done(null, false, { message: "Invalid email or password." });
      });
    }
  );
}

function clientAuth(id, secret, done) {
  Client.findOne(
    {
      _id: id
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

function oauth2(providerName, accessToken, refreshToken, profile, cb) {
  const thirdUserId = profile.id;
  const query = {
    "passports.providerName": providerName,
    "passports.thirdUserId": thirdUserId
  };
  User.findOne(query)
    .exec()
    .then(user => {
      if (!user) {
        const email = profile.emails[0].value;
        const props = {
          email,
          password: genRandomPassword(),
          passports: [
            {
              providerName,
              thirdUserId,
              profile
            }
          ]
        };
        const newUser = new User(props);
        // TODO check email duplicate.
        newUser.save(err => {
          if (err) {
            return cb(err, null);
          }
          return cb(null, newUser);
        });
      } else {
        cb(null, user);
      }
    })
    .catch(err => {
      cb(err, null);
    });
}

export default function config() {
  passport.use("basic", new BasicStrategy(userAuth));

  passport.use("clientBasic", new BasicStrategy(clientAuth));

  passport.use(new ClientPasswordStrategy(clientAuth));

  if (facebookConfig.clientID && facebookConfig.clientSecret) {
    passport.use(
      new FacebookStrategy(
        facebookConfig,
        (accessToken, refreshToken, profile, cb) => {
          oauth2("facebook", accessToken, refreshToken, profile, cb);
        }
      )
    );
  }

  if (googleConfig.clientID && googleConfig.clientSecret) {
    passport.use(
      new GoogleStrategy(
        googleConfig,
        (accessToken, refreshToken, profile, cb) => {
          oauth2("google", accessToken, refreshToken, profile, cb);
        }
      )
    );
  }

  passport.use(
    new BearerStrategy((tokenString, done) => {
      AccessToken.findOne({ token: tokenString })
        .populate("user")
        .exec((err, token) => {
          if (err) {
            return done(err);
          }
          if (!token) {
            return done(null, false);
          }
          return done(null, token.user, token);
        });
    })
  );
}
