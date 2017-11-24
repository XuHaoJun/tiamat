import elasticsearch from "elasticsearch";

const url = process.env.BONSAI_URL || "http://localhost:9200";

export default {
  esClient: elasticsearch.Client({ host: url })
};
