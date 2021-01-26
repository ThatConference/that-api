import debug from 'debug';
import { Firestore } from '@google-cloud/firestore';
import { debounce } from 'lodash';
import utility from '../../utility';
import firestoreDateForge from '../../utility/firestoreDateForge';

const dlog = debug('that:api:datasources:firebase:history');
const { dateForge, entityDateForge } = utility.firestoreDateForge;
const forgeFields = ['createdAt', 'lastUpdatedAt', 'orderDate'];
const historyDateForge = entityDateForge({ fields: forgeFields });

const stripeEventcollectionName = 'stripeEventHistory';

const scrubHistory = ({ order, isNew, userId }) => {
  dlog('scrubProduct called');
  const scrubbedOrder = order;
  const thedate = new Date();
  if (isNew) {
    scrubbedOrder.createdAt = thedate;
    scrubbedOrder.createdBy = userId;
  }
  scrubbedOrder.lastUpdatedAt = thedate;
  scrubbedOrder.lastUpdatedBy = userId;

  return scrubbedOrder;
};

const history = dbInstance => {
  dlog('instance created');

  const stripeEventHistoryCollection = dbInstance.collection(
    stripeEventcollectionName,
  );

  // adds new history record, updates counter if already exists
  async function stripeEventSet(stripeEvent) {
    dlog('stripeEventSet called');

    const docReference = stripeEventHistoryCollection.doc(stripeEvent.id);
    const newRecord = {
      data: stripeEvent,
      eventType: stripeEvent.type,
      seenCount: Firestore.FieldValue.increment(1),
      lastSeenAt: new Date(),
    };

    return docReference.set(newRecord, { merge: true });
  }

  return { stripeEventSet };
};

export default history;
