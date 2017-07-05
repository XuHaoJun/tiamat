import { Router } from "express";
import passport from "passport";
import server from "../controllers/oauth2orize.controller";

const router = new Router();

router.route("/oauth2/password/token").post(
  passport.authenticate(["clientBasic", "oauth2-client-password"], {
    session: false
  }),
  server.token(),
  server.errorHandler()
);

router.route("/oauth2/facebook").get(
  passport.authenticate("facebook", {
    scope: ["email", "public_profile"],
    session: false
  })
);

router
  .route("/oauth2/facebook/callback")
  .get(
    passport.authenticate("facebook", {
      session: false,
      failureRedirect: "/login"
    }),
    (req, res, next) => {
      // create accessToken and inject to req.user
      next();
    }
  );

router.route("/oauth2/google").get(
  passport.authenticate("google", {
    scope: ["email", "profile"],
    session: false
  })
);

router.route("/oauth2/google/callback").get(passport.authenticate("google", {
  session: false,
  failureRedirect: "/login"
}), (req, res, next) => {
  // create accessToken and inject to req.user
  next();
});

export default router;
