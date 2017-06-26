import Url from 'url';

const developmentUrlString = 'http://localhost:9200';
const developmentUrl = Url.parse(developmentUrlString);

const productionUrlString = (process.env.BONSAI_URL || developmentUrlString);
const productionUrl = Url.parse(productionUrlString);

// FIX
// can't directly pass url because mongoosastic overide elasticsearch constructor params.
function urlToConfig(url) {
  const {hostname, port, auth} = url;
  const protocol = url
    .protocol
    .replace(':', '');
  return {
    host: hostname,
    port: parseInt(port, 10) || (protocol === 'https'
      ? 443
      : 80),
    auth: auth || undefined,
    protocol: protocol || 'http'
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
