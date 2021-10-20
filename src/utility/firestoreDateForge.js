// Date correction for Dates coming out of FireStore.
// Converts FireStore Timestamp to JavaScript Date type
import debug from 'debug';
import getValueAtPath from './getValueAtPath';
import setValueAtPath from './setValueAtPath';

const dlog = debug('that:api:firestoreDateforge');

function dateForge(date) {
  let result = '';

  if (date === null) return null;

  if (date && typeof date === 'object') {
    // either Date or Timestamp
    if (date.toDate) {
      // Firestore Timestamp type
      result = date.toDate();
    } else if (date instanceof Date) {
      // JS Date type
      result = date;
    } else {
      // unknown date type
      result = 'Invalid Date';
    }
  } else if (typeof date === 'string') {
    result = new Date(date);
  }
  if (result.toString() === 'Invalid Date')
    throw new Error(
      `Date value, ${date}, is not a parsible or convertable date`,
    );

  return result;
}

function entityDateForge({ fields }) {
  if (!Array.isArray(fields))
    throw new Error('Fields must be sent as an array');
  dlog('entityDateForge with %d fields', fields.length);

  return entity => {
    if (!entity) return entity;
    const allKeys = Object.keys(entity);
    const forgedEntity = entity;
    fields.forEach(field => {
      if (allKeys.includes(field)) {
        forgedEntity[field] = dateForge(entity[field]);
      }
      if (field.indexOf('.') > 0) {
        // . at first position not valid
        const v = getValueAtPath(entity, field);
        if (v) {
          setValueAtPath(forgedEntity, field, dateForge(v));
        }
      }
    });
    return forgedEntity;
  };
}

function sessions(session) {
  dlog('firestoreDateForge sessions');
  const fields = ['createdAt', 'lastUpdatedAt', 'startTime'];

  return entityDateForge({ fields })(session);
}

function members(member) {
  dlog('firestoreDateForge members');
  const fields = [
    'createdAt',
    'lastUpdatedAt',
    'membershipExpirationDate',
    'requestSlackInviteAt',
  ];

  return entityDateForge({ fields })(member);
}

function events(event) {
  dlog('firestoreDateForge events');
  const fields = [
    'startDate',
    'endDate',
    'voteOpenDate',
    'voteCloseDate',
    'callForSpeakersOpenDate',
    'callForSpeakersCloseDate',
  ];

  return entityDateForge({ fields })(event);
}

function votes(vote) {
  dlog('firestoreDateFroge votes');
  const fields = ['createdAt', 'lastUpdatedAt'];

  return entityDateForge({ fields })(vote);
}

function earnedMeritBadges(earnedBadge) {
  dlog('firestoreDateForge earnedMeritBadges');
  const fields = ['earnedAt'];

  return entityDateForge({ fields })(earnedBadge);
}

function partners(partner) {
  dlog('firestoreDateForge partners');
  const fields = ['createdAt', 'lastUpdatedAt'];

  return entityDateForge({ fields })(partner);
}

function communities(community) {
  dlog('firestoreDateForge communities');
  const fields = ['createdAt', 'lastUpdatedAt'];

  return entityDateForge({ fields })(community);
}

function orders(order) {
  dlog('firestoreDateForge orders');
  const fields = ['createdAt', 'lastUpdatedAt', 'orderDate'];

  return entityDateForge({ fields })(order);
}

function orderAllocations(allocation) {
  dlog('firestoreDateForge orderAllocations');
  const fields = ['createdAt', 'lastUpdatedAt', 'checkedInAt'];

  return entityDateForge({ fields })(allocation);
}

function products(product) {
  dlog('firestoreDateForge products');
  const fields = ['createdAt', 'lastUpdatedAt', 'onSaleFrom', 'onSaleUntil'];

  return entityDateForge({ fields })(product);
}

export default {
  dateForge,
  entityDateForge,
  sessions,
  members,
  events,
  votes,
  earnedMeritBadges,
  partners,
  communities,
  orders,
  orderAllocations,
  products,
};
