import debug from 'debug';
import utility from '../../utility';

const dlog = debug('that:api:datasources:firebase:orders');
const allocationDateForge = utility.firestoreDateForge.orderAllocations;

const allocationCollectionName = 'orderAllocations';

const order = dbInstance => {
  dlog('order instance initiated');

  const allocationCollection = dbInstance.collection(allocationCollectionName);

  function findPin({ partnerPin, eventId }) {
    dlog('findPin called for PIN %s, in event %s', partnerPin, eventId);

    return allocationCollection
      .where('partnerPin', '==', partnerPin)
      .where('event', '==', eventId)
      .get()
      .then(querySnap => {
        if (querySnap.size > 1)
          throw new Error(`Multiple allocations found with PIN ${partnerPin}.`);
        return querySnap.docs.map(d => {
          const r = {
            id: d.id,
            ...d.data(),
          };

          return allocationDateForge(r);
        });
      });
  }

  return { findPin };
};

export default order;
