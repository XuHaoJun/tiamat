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

async function userAuth(emailOri, password, done) {
  const email = emailOri.toLowerCase();
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return done(null, false, { message: `Email ${email} not found.` });
    }
    const isMatch = await user.comparePassword(password);
    if (isMatch) {
      return done(null, user);
    }
    return done(null, false, { message: 'Invalid email or password.' });
  } catch (err) {
    return done(err);
  }
}

async function clientAuth(id, secret, done) {
  try {
    const client = await Client.findOne({ _id: id });
    if (!client || client.secret !== secret) {
      return done(null, false);
    }
    return done(null, client);
  } catch (err) {
    return done(err);
  }
}

// TODO
// support multi passport.
async function findOrInsertUser(oauth2Info) {
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
  
  try {
    const user = await User.findOneAndUpdate(query, update, opts);
    cb(null, user);
  } catch (err) {
    cb(err, null);
  }
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

  passport.use(
    'bearer-jwt',
    new BearerStrategy(async (tokenString, done) => {
      try {
        const payload = await AccessToken.verify(tokenString);
        const { target, sub, scope } = payload;
        
        if (!target || !sub || !scope) {
          return done(null, false);
        }
        
        if (target === 'client') {
          const client = await Client.findOne({ _id: sub });
          if (!client) {
            return done(null, false);
          }
          return done(null, client, scope);
        } else if (target === 'user') {
          const user = await User.findById(sub).select({ password: 0 });
          if (!user) {
            return done(null, false);
          }
          return done(null, user, scope);
        }
        return done(null, false);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.use(
    'bearer',
    new BearerStrategy(async (tokenString, done) => {
      try {
        const token = await AccessToken.findOne({ token: tokenString })
          .populate('user')
          .populate('client')
          .exec();
          
        if (!token) {
          return done(null, false);
        }
        
        if (token.user) {
          return done(null, token.user, token.scope);
        }
        
        if (token.client) {
          return done(null, token.client, token.scope);
        }
        
        return done(null, false);
      } catch (err) {
        return done(err);
      }
    })
  );
}
