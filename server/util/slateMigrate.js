import mongoose from "mongoose";
import Discussion from "../models/discussion";
import RootWiki from "../models/rootWiki";
import Wiki from "../models/wiki";
import appConfig from "../configs";
import RecursiveIterator from "recursive-iterator";
import Promise from "bluebird";
import Debug from "debug";
import semver from "semver";
import packageInfo from "../../package.json";

mongoose.Promise = Promise;

const debug = Debug("slateMigrate");

const Models = [Discussion, RootWiki, Wiki];

function migrate(Model) {
  return Model.find({})
    .exec()
    .then(ms => {
      const ps = [];
      for (const m of ms) {
        let change = false;
        const { content } = m;
        if (content) {
          for (const { node } of new RecursiveIterator(content)) {
            if (node.kind === "text" && node.ranges) {
              debug(m._id, "text ranges to leaves");
              node.leaves = node.ranges;
              delete node.ranges;
              change = true;
            }
          }
          if (change) {
            const updatePromise = Model.update(
              { _id: m._id, __v: m.__v },
              { $set: { content } }
            )
              .then(updatedM => {
                if (!updatedM) {
                  console.error(m._id, "not found");
                } else {
                  console.log(m._id, "sucess");
                }
              })
              .catch(err => {
                console.error(m._id, err);
              });
            ps.push(updatePromise);
          }
        }
      }
      return Promise.all(ps);
    });
}

mongoose.connection.on("connected", () => {
  let ps = [];
  for (const M of Models) {
    const updatePs = migrate(M);
    ps = ps.concat(updatePs);
  }
  Promise.all(ps).then(() => {
    mongoose.disconnect();
  });
});

if (semver.satisfies(packageInfo.version, ">= 0.1.0")) {
  debug("start", appConfig.mongoDB.url);
  console.log("start slate migrate");
  mongoose.connect(appConfig.mongoDB.url, { useMongoClient: true });
}
