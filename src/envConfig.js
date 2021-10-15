import debug from 'debug';

const dlog = debug('that:api:config');

// eslint-disable-next-line no-unused-vars
function missingConfig(configKey) {
  throw new Error(`missing required .env setting for ${configKey}`);
}

function getConfig() {
  const config = {
    influx: {
      token: process.env.INFLUX_TOKEN || null,
      orgId: process.env.INFLUX_ORG_ID || null,
      bucketId: process.env.INFLUX_BUCKET_ID || null,
      host: process.env.INFLUX_HOST || null,
    },
    socialsBuffer: {
      accessToken: process.env.BUFFER_ACCESS_TOKEN || null,
      baseUrl: process.env.BUFFER_BASE_URL || 'https://api.bufferapp.com/1',
    },
  };

  dlog('created config %O', config);

  return config;
}

export default getConfig();
