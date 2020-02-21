import { EventEmitter } from 'events';
import debug from 'debug';
import fetch from 'node-fetch';

import envConfig from '../../envConfig';

const dlog = debug('that:api:graphql:lifecycle:events');
const { influx } = envConfig;
const url = `${influx.host}/api/v2/write?org=${influx.orgId}&bucket=${influx.bucketId}&precision=ms`;

function lifecycleEvents() {
  dlog('user event emitter created');
  const lifecycleEventEmitter = new EventEmitter();

  function buildLineProtocol({ measurement, tags, fields }) {
    return `${measurement},${tags.toString()} ${fields.toString()}`;
  }

  function callFetch(payload) {
    return fetch(url, {
      method: 'POST',
      body: payload,
      headers: { Authorization: `Token ${influx.token}` },
    }).catch(e =>
      process.nextTick(() => lifecycleEventEmitter.emit('error', e)),
    );
  }

  function executionDidStart({ service, requestContext }) {
    dlog('executionDidStart');

    const { operation, context } = requestContext;
    const userId = context.user ? context.user.sub : 'ANON';

    const data = buildLineProtocol({
      measurement: 'executionDidStart',
      tags: [`service=${service}`, `operationKind=${operation.operation}`],
      fields: [`userId="${userId}"`, `queryHash="${requestContext.queryHash}"`],
    });

    callFetch(data);
  }

  lifecycleEventEmitter.on('error', err => {
    throw new Error(err);
  });

  lifecycleEventEmitter.on('executionDidStart', executionDidStart);

  return lifecycleEventEmitter;
}

export default lifecycleEvents();
