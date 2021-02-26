import debug from 'debug';
import utility from '../../utility';

const dlog = debug('that:api:datasources:firebase:member');
const eventDateForge = utility.firestoreDateForge.events;

const collectionName = 'events';

const event = dbInstance => {
  dlog('event instance created');

  const eventCollection = dbInstance.collection(collectionName);

  function get(eventId) {
    dlog('get %s', eventId);
    return eventCollection
      .doc(eventId)
      .get()
      .then(docSnap => {
        let result = null;
        if (docSnap.exists) {
          result = {
            id: docSnap.id,
            ...docSnap.data(),
          };
          result = eventDateForge(result);
        }

        return result;
      });
  }

  return { get };
};

export default event;
