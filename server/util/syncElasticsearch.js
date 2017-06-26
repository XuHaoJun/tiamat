import Discussion from '../models/discussion';
import ForumBoard from '../models/forumBoard';

export default function syncElasticsearch() {
  const s1 = ForumBoard.synchronize();
  const s2 = Discussion.synchronize();
  [s1, s2].forEach((stream) => {
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
  });
}
