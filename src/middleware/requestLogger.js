import debug from 'debug';
import rip from 'request-ip';
import events from '../events';

const dlog = debug('that:api:middleware:request');
const { influx } = events;

function requestLogger(service) {
  dlog('requestLogger', service);

  function handler(req, res, next) {
    const clientIp = rip.getClientIp(req);

    const log = {
      measurement: 'apiRequest',
      tags: [`ip=${clientIp},host=${req.headers.host},service=${service}`],
      fields: [`called=1`],
    };

    dlog('handler %O', log);
    influx.emit('capture', log);

    next();
  }

  return { handler };
}

export default requestLogger;
