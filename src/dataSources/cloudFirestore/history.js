import debug from 'debug';
import { Firestore } from '@google-cloud/firestore';

const dlog = debug('that:api:datasources:firebase:history');

const stripeEventCollectionName = 'stripeEventHistory';
const thatEventCollectionName = 'thatEventHistory';

const history = dbInstance => {
  dlog('instance created');

  const stripeEventHistoryCollection = dbInstance.collection(
    stripeEventCollectionName,
  );
  const thatEventHistoryCollection = dbInstance.collection(
    thatEventCollectionName,
  );

  // adds new history record, updates counter if already exists
  async function stripeEventSet(stripeEvent) {
    dlog('stripeEventSet called, eventId: %s', stripeEvent.id);

    const docReference = stripeEventHistoryCollection.doc(stripeEvent.id);
    const newRecord = {
      data: stripeEvent,
      eventType: stripeEvent.type,
      seenCount: Firestore.FieldValue.increment(1),
      lastSeenAt: new Date(),
    };
    dlog('writing record %o', newRecord);

    return docReference.set(newRecord, { merge: true });
  }

  // adds new history record, updates counter if already exists
  async function thatEventSet(thatEvent) {
    dlog('thatEventSet called, eventId: %s', thatEvent.id);

    const docReference = thatEventHistoryCollection.doc(thatEvent.id);
    const newRecord = {
      data: thatEvent,
      eventType: thatEvent.type,
      seenCount: Firestore.FieldValue.increment(1),
      lastSeenAt: new Date(),
    };
    dlog('writing record %o', newRecord);

    return docReference.set(newRecord, { merge: true });
  }

  return { stripeEventSet, thatEventSet };
};

export default history;
