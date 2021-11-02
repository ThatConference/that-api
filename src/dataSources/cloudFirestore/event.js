import debug from 'debug';
import utility from '../../utility';

const dlog = debug('that:api:datasources:firebase:event');
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

  async function findIdFromSlug(slug) {
    dlog('findIdFromSlug %s', slug);
    const slimslug = slug.trim().toLowerCase();
    const { size, docs } = await eventCollection
      .where('slug', '==', slimslug)
      .select()
      .get();

    dlog('size: %d', size);
    let result = null;
    if (size === 1) {
      const [e] = docs;
      result = {
        id: e.id,
      };
    } else if (size > 1) {
      throw new Error(
        `Mulitple Event records found for slug ${slimslug} - ${size}`,
      );
    }

    return result;
  }

  async function getSlug(id) {
    dlog('find slug from id %s', id);
    const docRef = await eventCollection.doc(id).get();
    let result = null;
    if (docRef.exists) {
      result = {
        id: docRef.id,
        slug: docRef.get('slug'),
      };
    }

    return result;
  }

  return { get, findIdFromSlug, getSlug };
};

export default event;
