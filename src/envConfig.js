import debug from 'debug';

const dlog = debug('that:api:config');

function missingConfig(configKey) {
  throw new Error(`missing required .env setting for ${configKey}`);
}

function getConfig() {
  const config = {
    influx: {
      token: process.env.INFLUX_TOKEN || missingConfig('INFLUX_TOKEN'),
      orgId: process.env.INFLUX_ORG_ID || missingConfig('INFLUX_ORG_ID'),
      bucketId: process.env.INFLUX_BUCKET_ID || missingConfig('INFLUX_HOST'),
      host: process.env.INFLUX_HOST || missingConfig('INFLUX_BUCKET_ID'),
    },
  };

  dlog('created config %O', config);

  return config;
}

export default getConfig();
