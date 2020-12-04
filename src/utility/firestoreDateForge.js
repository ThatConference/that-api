// Date correction for Dates coming out of FireStore.
// Converts FireStore Timestamp to JavaScript Date type
import debug from 'debug';

const dlog = debug('that:api:firestoreDateforge');

function dateForge(date) {
  let result;

  if (typeof date === 'object') {
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
    const allKeys = Object.keys(entity);
    const forgedEntity = entity;
    fields.forEach(field => {
      if (allKeys.includes(field)) {
        forgedEntity[field] = dateForge(entity[field]);
      }
    });
    return forgedEntity;
  };
}

function sessions(session) {
  dlog('sessions');
  const sessionOut = session;
  if (session.createdAt) sessionOut.createdAt = dateForge(session.createdAt);
  if (session.lastUpdatedAt)
    sessionOut.lastUpdatedAt = dateForge(session.lastUpdatedAt);
  if (session.startTime) sessionOut.startTime = dateForge(session.startTime);

  return sessionOut;
}

function members(member) {
  dlog('members');
  const memberOut = member;
  if (member.createdAt) memberOut.createdAt = dateForge(member.createdAt);
  if (member.lastUpdatedAt)
    memberOut.lastUpdatedAt = dateForge(member.lastUpdatedAt);

  return memberOut;
}

function events(event) {
  dlog('events');
  const eventOut = event;
  if (event.startDate) eventOut.startDate = dateForge(event.startDate);
  if (event.endDate) eventOut.endDate = dateForge(event.endDate);

  return eventOut;
}

function votes(vote) {
  dlog('votes');
  const voteOut = vote;
  if (vote.createdAt) voteOut.createdAt = dateForge(vote.createdAt);
  if (vote.lastUpdatedAt) voteOut.lastUpdatedAt = dateForge(vote.lastUpdatedAt);

  return voteOut;
}

function earnedMeritBadges(earnedBadge) {
  dlog('earnedMeritBadges');
  const earnedBadgeOut = earnedBadge;
  if (earnedBadge.earnedAt)
    earnedBadgeOut.earnedAt = dateForge(earnedBadge.earnedAt);

  return earnedBadgeOut;
}

function partners(partner) {
  dlog('partners');
  const partnerOut = partner;
  if (partner.createdAt) partnerOut.createdAt = dateForge(partner.createdAt);
  if (partner.lastUpdatedAt)
    partnerOut.lastUpdatedAt = dateForge(partner.lastUpdatedAt);

  return partnerOut;
}

function communities(community) {
  dlog('communities');
  const communityOut = community;
  if (community.createdAt)
    communityOut.createdAt = dateForge(community.createdAt);
  if (community.lastUpdatedAt)
    communityOut.lastUpdatedAt = dateForge(community.lastUpdatedAt);

  return communityOut;
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
};
