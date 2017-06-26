import Discussion from '../models/discussion';
import ForumBoard from '../models/forumBoard';

export default function syncElasticsearch() {
  const models = [ForumBoard, Discussion];
  models.forEach((M) => {
    M.createMapping(undefined, (err) => {
      if (err) {
        console.log(err);
      } else {
        const stream = M.synchronize();
        let count = 0;
        stream.on('data', function(err, doc) {
          count += 1;
        });
        stream.on('close', function() {
          console.log('indexed ' + count + ' documents!');
        });
        stream.on('error', function(err) {
          console.log(err);
        });
      }
    });
  });
}
