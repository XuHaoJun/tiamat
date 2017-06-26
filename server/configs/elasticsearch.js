import Url from 'url';

const developmentUrlString = 'http://localhost:9200';
const developmentUrl = Url.parse(developmentUrlString);

const productionUrlString = (process.env.BONSAI_URL || developmentUrlString);
const productionUrl = Url.parse(productionUrlString);

function urlToConfig(url) {
  const {hostname, port, auth, protocol} = url;
  return {
    host: hostname,
    port: parseInt(port, 10) || undefined,
    auth: auth || undefined,
    protocol: protocol
      ? protocol.replace(':', '')
      : 'http'
  };
}

const elasticsearchConfigs = {
  development: urlToConfig(developmentUrl),
  production: urlToConfig(productionUrl)
};

const elasticsearchConfig = (() => {
  if (process.env.NODE_ENV === 'production') {
    return elasticsearchConfigs.production;
  } else {
    return elasticsearchConfigs.development;
  }
})();

export default elasticsearchConfig;
