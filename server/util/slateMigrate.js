import mongoose from 'mongoose';
import RecursiveIterator from 'recursive-iterator';
import Debug from 'debug';
import semver from 'semver';
import packageInfo from '../../package.json';

import Discussion from '../models/discussion';
import RootWiki from '../models/rootWiki';
import Wiki from '../models/wiki';
import appConfig from '../configs';

mongoose.Promise = Promise;

const debug = Debug('slateMigrate');

const Models = [Discussion, RootWiki, Wiki];

async function migrate(Model) {
  try {
    const documents = await Model.find({}).exec();
    const updatePromises = [];

    for (const doc of documents) {
      let change = false;
      const { content } = doc;
      
      if (content) {
        if (content.kind) {
          delete content.kind;
          change = true;
        }

        for (const { node } of new RecursiveIterator(content)) {
          let kindName = 'kind';
          
          if (semver.satisfies(semver.coerce(packageInfo.dependencies.slate), '>= 0.32.0')) {
            if (node.kind) {
              node.object = node.kind;
              delete node.kind;
              change = true;
            }
            kindName = 'object';
          }

          if (semver.satisfies(semver.coerce(packageInfo.dependencies.slate), '>= 0.27.0')) {
            if (node[kindName] === 'text' && node.ranges) {
              debug(doc._id, 'text ranges to leaves');
              node.leaves = node.ranges;
              delete node.ranges;
              change = true;
            }
          }
        }

        if (change) {
          const updatePromise = Model.update({ _id: doc._id, __v: doc.__v }, { $set: { content } })
            .then(updatedDoc => {
              if (!updatedDoc) {
                console.error(doc._id, 'not found');
              } else {
                console.log(doc._id, 'success');
              }
            })
            .catch(err => {
              console.error(doc._id, err);
            });
          
          updatePromises.push(updatePromise);
        }
      }
    }

    await Promise.all(updatePromises);
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  }
}

mongoose.connection.on('connected', () => {
  let ps = [];
  for (const M of Models) {
    const updatePs = migrate(M);
    ps = ps.concat(updatePs);
  }
  Promise.all(ps).then(() => {
    mongoose.disconnect();
  });
});

if (semver.satisfies(packageInfo.version, '>= 0.1.0')) {
  debug('start', appConfig.mongoDB.url);
  console.log('start slate migrate');
  mongoose.connect(
    appConfig.mongoDB.url,
    { useMongoClient: true }
  );
}
