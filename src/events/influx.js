import { EventEmitter } from 'events';
import debug from 'debug';
import fetch from 'node-fetch';

import envConfig from '../envConfig';

const dlog = debug('that:api:events:influx:events');
const { influx } = envConfig;
const url = `${influx.host}/api/v2/write?org=${influx.orgId}&bucket=${influx.bucketId}&precision=ms`;

function influxEvents() {
  dlog('user event emitter created');
  const influxEventEmitter = new EventEmitter();

  function buildLineProtocol({ measurement, tags, fields }) {
    return `${measurement},${tags.toString()} ${fields.toString()}`;
  }

  function callFetch(payload) {
    return (
      fetch(url, {
        method: 'POST',
        body: payload,
        headers: { Authorization: `Token ${influx.token}` },
      })
        // .then(async r => {
        //   dlog('status code', r.status);
        //   dlog(`return %O`, await r.json());
        // })
        .catch(e => process.nextTick(() => influxEventEmitter.emit('error', e)))
    );
  }

  function capture({ measurement, tags, fields }) {
    dlog('capture %O', { measurement, tags, fields });

    callFetch(buildLineProtocol({ measurement, tags, fields }));
  }

  influxEventEmitter.on('error', err => {
    throw new Error(err);
  });

  influxEventEmitter.on('capture', capture);

  return influxEventEmitter;
}

export default influxEvents();
