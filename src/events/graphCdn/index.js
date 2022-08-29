import 'dotenv/config';
import { EventEmitter } from 'events';
import debug from 'debug';
import fetch from '@adobe/node-fetch-retry';

import { getGraphCdn } from '../../envConfig';
import { GraphCdnError } from '../../lib/errors';
import constants from '../../constants';
import entityMutations from './purgeEntityMutations';

const dlog = debug('that:api:graphCdn:event');

export default function graphCdnEvents(Sentry) {
  const graphCdnEmitter = new EventEmitter();
  const graphCdn = getGraphCdn();
  dlog('graphCDN emitter created');

  if (Sentry?.SDK_VERSION?.length < 2) {
    throw new Error(
      'A valid, initialized `@sentry/node` object is required to instantiate emitter',
    );
  }

  function sendReqToGraphCdn(payload) {
    Sentry.addBreadcrumb({
      category: 'graphCdn',
      message: 'post purge request',
      level: 'info',
      data: payload,
    });
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'graphcdn-token': graphCdn.token,
    };

    return fetch(graphCdn.api, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers,
      retryInitialDelay: 250,
      retryBackoff: 2.0,
    })
      .then(res => {
        if (res.ok) return res.json();
        Sentry.setContext('response error', JSON.stringify(res));
        throw new GraphCdnError(`Non-200 request result: ${res.statusText}`);
      })
      .then(json => {
        dlog('purge result: %o', json);
        // TODO: validate this?
      });
  }

  /**
   * entityType values defined in constants
   */
  function purgeEntityType(entityType, id) {
    dlog('purge entity type %s, id(s): %o', entityType, id);
    const vals = Object.values(constants.GRAPHCDN.PURGE);
    if (!vals.includes(entityType)) {
      process.nextTick(() =>
        graphCdnEmitter.emit(
          'error',
          new Error(
            `Entity provided doesn't match defined constants. Ensure constants are used from 'that-api'`,
          ),
        ),
      );
      return false;
    }

    const payload = {
      query: entityMutations[entityType],
      variables: {
        id,
      },
    };

    return sendReqToGraphCdn(payload).catch(err =>
      process.nextTick(() => {
        dlog('Error making purge call:\n%O', err);
        graphCdnEmitter.emit('error', err);
      }),
    );
  }

  function purgeOnCreateSession({ eventId, memberIds }) {
    // On creating a session we need to purge entities which reference it
    // events, and members (speakers)
    const payload = {
      query: entityMutations.onCreatedSession,
      variables: {
        eventId,
        memberIds,
      },
    };

    return sendReqToGraphCdn(payload).catch(err =>
      process.nextTick(() => {
        dlog('Error making purge call:\n%O', err);
        graphCdnEmitter.emit('error', err);
      }),
    );
  }

  function purgeOnCreateProduct({ eventId }) {
    const payload = {
      query: entityMutations.onCreateProduct,
      variables: {
        eventId,
      },
    };

    return sendReqToGraphCdn(payload).catch(err =>
      process.nextTick(() => {
        dlog('Error making purge call:\n%O', err);
        graphCdnEmitter.emit('error', err);
      }),
    );
  }

  graphCdnEmitter.on(constants.GRAPHCDN.EVENT_NAME.PURGE, purgeEntityType);
  graphCdnEmitter.on(
    constants.GRAPHCDN.EVENT_NAME.CREATED_SESSION,
    purgeOnCreateSession,
  );
  graphCdnEmitter.on(
    constants.GRAPHCDN.EVENT_NAME.CREATED_PRODUCT,
    purgeOnCreateProduct,
  );

  graphCdnEmitter.on('error', err => {
    dlog('error: %O', err);
    Sentry.setTag('section', 'cdnEventEmitter');
    Sentry.captureException(err);
  });

  return graphCdnEmitter;
}
