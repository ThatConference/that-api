import debug from 'debug';

function configMissing(configKey) {
  throw new Error(`missing required .env setting for ${configKey}`);
}

function getConfig() {
  return {
    influx: {
      token: process.env.INFLUX_TOKEN || configMissing('INFLUX_TOKEN'),
      orgId: process.env.INFLUX_ORG_ID || configMissing('INFLUX_ORG_ID'),
      bucketId: process.env.INFLUX_BUCKET_ID || configMissing('INFLUX_HOST'),
      host: process.env.INFLUX_HOST || configMissing('INFLUX_BUCKET_ID'),
    },
  };
}

export default getConfig();
