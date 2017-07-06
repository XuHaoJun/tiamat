const serverConfig = {
  port: process.env.PORT || 8000,
  callbackURLPrefix: "https://yoursite.com"
};

const { port, callbackURLPrefix } = serverConfig;

export { serverConfig as default, port, callbackURLPrefix };
