import User from "../models/user";

/**
 * Validate signup form
 * @param req
 * @param res
 * @returns void
 */
export function validateUser(req, res) {
  const { emailExists } = req.query;
  User.findOne({ email: emailExists.toLowerCase() })
    .select({ email: 1 })
    .exec()
    .then(user => {
      if (user) {
        res.json(true);
      } else {
        res.status(403).send(new Error("duplicate email"));
      }
    })
    .catch(err => {
      res.status(403).send(err);
    });
}

/**
 * Get a user
 * @param req
 * @param res
 * @returns void
 */
// TODO
// imple scope system and verify oauth2Client.
export function getUser(req, res) {
  const { id } = req.params;
  const reqUser = req.user;
  const defaultScope = "public_profile";
  let scope;
  if (req.authInfo) {
    scope = req.authInfo.scope || defaultScope;
  } else if (reqUser._id.toString() === id) {
    scope = "all";
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
    return User.findById(id)
      .select({ password: 0 })
      .exec()
      .then(user => {
        if (!user) {
          return res.status(403).send(new Error(`Not found user ${id}`));
        } else {
          return res.json({ user: user.toJSON() });
        }
      })
      .catch(err => {
        res.status(403).send(err);
      });
  }
}

/**
 * Save a user
 * @param req
 * @param res
 * @returns void
 */
export function addUser(req, res) {
  const newUser = new User(req.body.user);
  newUser.save((err, saved) => {
    if (err) {
      res.status(403).send(err);
    } else {
      const user = saved.toJSON();
      delete user.password;
      res.json({ user });
    }
  });
}
