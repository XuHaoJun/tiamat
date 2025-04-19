import User from '../models/user';

/**
 * Validate signup form
 * @param req
 * @param res
 * @returns void
 */
export async function validateUser(req, res) {
  try {
    const { emailExists } = req.query;
    const user = await User.findOne({ email: emailExists.toLowerCase() })
      .select({ email: 1 })
      .exec();
    
    if (user) {
      res.json(true);
    } else {
      res.status(403).send(new Error('duplicate email'));
    }
  } catch (err) {
    res.status(403).send(err);
  }
}

/**
 * Get a user
 * @param req
 * @param res
 * @returns void
 */
// TODO
// imple scope system and verify oauth2Client.
export async function getUser(req, res) {
  try {
    const { id } = req.params;
    const reqUser = req.user;
    const defaultScope = 'public_profile';
    let scope;
    
    if (req.authInfo) {
      scope = req.authInfo.scope || defaultScope;
    } else if (reqUser._id.toString() === id) {
      scope = 'all';
    } else {
      scope = defaultScope;
    }
    
    if (reqUser._id.toString() === id) {
      // TODO
      // process user data by scope.
      // may be request db again for more user info not only get user from auth middleware?
      return res.json({ user: reqUser.toJSON() });
    } else {
      // TODO
      // authed user try get another user's data.
      // may be imple permission and scope system for check which filed viable?
      const user = await User.findById(id)
        .select({ password: 0 })
        .exec();
        
      if (!user) {
        return res.status(403).send(new Error(`Not found user ${id}`));
      }
      
      return res.json({ user: user.toJSON() });
    }
  } catch (err) {
    res.status(403).send(err);
  }
}

/**
 * Save a user
 * @param req
 * @param res
 * @returns void
 */
export async function addUser(req, res) {
  try {
    const newUser = new User(req.body.user);
    const saved = await newUser.save();
    const user = saved.toJSON();
    delete user.password;
    res.json({ user });
  } catch (err) {
    res.status(403).send(err);
  }
}
