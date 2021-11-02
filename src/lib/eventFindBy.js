import debug from 'debug';
import eventStore from '../dataSources/cloudFirestore/event';

const dlog = debug('that:api:eventFindBy');

export default function eventFindBy(findBy, firestore) {
  // parses findBy parameter and looks up id/slug ad needed
  // id takes precidence if both are provided
  if (!findBy.slug && !findBy.id)
    throw new Error(
      'event findBy requires an id or slug. Neither was provided',
    );

  let result = null;
  if (findBy.slug && !findBy.id) {
    dlog('find event id by slug');
    return eventStore(firestore)
      .findIdFromSlug(findBy.slug)
      .then(d => {
        if (d) {
          result = {
            eventId: d.id,
            slug: findBy.slug,
          };
        }
        dlog('slug/id %o', result);
        return result;
      });
  }
  dlog('event by id');
  // id only or id and slug sent
  // get slug/verify slug-id relationship
  return eventStore(firestore)
    .getSlug(findBy.id)
    .then(e => {
      if (e) {
        if (findBy.slug && findBy.slug !== e.slug)
          throw new Error('Event slug and id provided do not match.');
        result = {
          eventId: e.id,
          slug: e.slug,
        };
      }
      dlog('slug/id result %o', result);
      return result;
    });
}
