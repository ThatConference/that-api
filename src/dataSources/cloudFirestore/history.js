import debug from 'debug';
import * as fbAdmin from 'firebase-admin';

const dlog = debug('that:api:datasources:firebase:history');

const stripeEventcollectionName = 'stripeEventHistory';

const history = dbInstance => {
  dlog('instance created');

  const stripeEventHistoryCollection = dbInstance.collection(
    stripeEventcollectionName,
  );

  // adds new history record, updates counter if already exists
  async function stripeEventSet(stripeEvent) {
    dlog('stripeEventSet called, eventId: %s', stripeEvent.id);

    const docReference = stripeEventHistoryCollection.doc(stripeEvent.id);
    const newRecord = {
      data: stripeEvent,
      eventType: stripeEvent.type,
      seenCount: fbAdmin.firestore.FieldValue.increment(1),
      lastSeenAt: new Date(),
    };
    dlog('writing record %o', newRecord);

    return docReference.set(newRecord, { merge: true });
  }

  return { stripeEventSet };
};

export default history;
