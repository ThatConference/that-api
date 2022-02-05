import debug from 'debug';

const dlog = debug('that:api:config');

// eslint-disable-next-line no-unused-vars
function missingConfig(configKey) {
  throw new Error(`missing required .env setting in that-api for ${configKey}`);
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

  dlog('created that-api env config %O', config);

  return config;
}

function getGraphCdn() {
  return {
    token: process.env.GRAPHCDN_TOKEN || missingConfig('GRAPHCDN_TOKEN'),
    api: process.env.GRAPHCDN_API || 'https://admin.graphcdn.io/that',
  };
}

function getOrbitLove() {
  return {
    workspaceSlug: process.env.ORBIT_WS_SLUG || 'that-6460d1',
    token: process.env.ORBIT_TOKEN || missingConfig('ORBIT_TOKEN'),
    baseUrl: process.env.ORBIT_BASE_URL || 'https://app.orbit.love/api/v1',
  };
}

export default getConfig();
export { getGraphCdn, getOrbitLove };
