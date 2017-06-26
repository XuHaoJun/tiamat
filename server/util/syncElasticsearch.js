import Discussion from '../models/discussion';
import ForumBoard from '../models/forumBoard';

export default function syncElasticsearch() {
  const models = [ForumBoard, Discussion];
  models.forEach((M) => {
    M.createMapping(undefined, (err) => {
      if (err) {
        console.log(err);
      } else {
        M.synchronize();
      }
    });
  });
}
