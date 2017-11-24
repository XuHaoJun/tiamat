import Discussion from "../models/discussion";
import ForumBoard from "../models/forumBoard";
import Debug from "debug";

export default function syncElasticsearch() {
  const models = [ForumBoard, Discussion];
  models.forEach(M => {
    const settings = {
      analysis: {
        analyzer: {
          default: {
            type: "smartcn"
          }
        }
      }
    };
    const debug = Debug("app:elasticsearch");
    M.createMapping(settings, err => {
      if (err) {
        debug(err);
      } else {
        const stream = M.synchronize();
        let count = 0;
        stream.on("data", (err, doc) => {
          count += 1;
        });
        stream.on("close", () => {
          debug(`indexed ${count} documents!`);
        });
        stream.on("error", err => {
          debug(err);
        });
      }
    });
  });
}
