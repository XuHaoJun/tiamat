import Discussion from '../models/discussion';
import ForumBoard from '../models/forumBoard';

export default function syncElasticsearch() {
  ForumBoard.synchronize();
  Discussion.synchronize();
}
