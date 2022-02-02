// List of activity types THAT uses in Orbit.love integration

export default {
  activity: {
    create: 'that:activity:create',
    attendAt: 'that:activity:attend:at',
    attendOn: 'that:activity:attend:on',
  },
  // register or purchase?
  purchase: {
    onthat: 'that:purchase:onticket',
    atthat: 'that:purchase:atticket',
  },
  favorite: {
    activity: 'that:favorite:activity',
    member: 'that:favorite:member',
    community: 'that:favorate:community',
    event: 'that:favorate:event',
  },
  leadGen: {
    scanMember: 'that:leadgen:scanmember',
    memberScanned: 'that:leadgen:memberscanned',
  },
  news: {
    create: 'that:news:create',
  },
  speaker: {
    atthat: 'that:speaker:at',
    onthat: 'that:speaker:on',
  },
  signups: {
    newsletter: 'that:newsletter:signup',
    slack: 'that:slack:signup',
  },
  profile: {
    create: 'that:profile:create',
    update: 'that:profile:update',
  },
  createAuth0Login: 'that:auth:create',
};
