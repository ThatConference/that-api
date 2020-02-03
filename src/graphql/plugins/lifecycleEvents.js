import { EventEmitter } from 'events';
import debug from 'debug';
import fetch from 'node-fetch';

import envConfig from '../../envConfig';

const dlog = debug('that:api:graphql:lifecycle:events');
const { influx } = envConfig;

function lifecycleEvents() {
  dlog('user event emitter created');
  const lifecycleEventEmitter = new EventEmitter();

  function executionDidStart({ service, requestContext }) {
    dlog('executionDidStart');

    const { operation, context } = requestContext;
    const userId = context.user ? context.user.sub : 'ANON';

    const data = `executionDidStart,service=${service},operation=${operation.kind},operationKind=${operation.operation} userId="${userId}",queryHash="${requestContext.queryHash}",operationName="${requestContext.operationName}"`;
    const url = `${influx.host}/api/v2/write?org=${influx.orgId}&bucket=${influx.bucketId}&precision=ms`;

    return (
      fetch(url, {
        method: 'POST',
        body: data,
        headers: { Authorization: `Token ${influx.token}` },
      })
        // .then(res => res.json())
        // .then(json => console.log(json))
        .catch(e => console.error(e))
    );
  }

  lifecycleEventEmitter.on('executionDidStart', executionDidStart);

  return lifecycleEventEmitter;
}

export default lifecycleEvents();
