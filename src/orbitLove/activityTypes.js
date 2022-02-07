// List of activity types THAT uses in Orbit.love integration

/**
 * **Property Key**
 * typeKey – Orbit Action Type key value used
 * action – The name of the action, same as function name called
 * actionText – Text to use in descriptions for action taken
 * title - Orbit Activty title to use. Values in `~` are replaced
 */

export default {
  session: {
    create: () => ({
      typeKey: 'that:session:create',
      action: 'create',
      actionText: 'created',
      title: '~name~ created new session ~title~',
    }),
    createOpenSpace: () => ({
      typeKey: 'that:session:create:openspace',
      action: 'createOpenSpace',
      actionText: 'Created open space',
      title: '~name~ created open space session ~title~',
    }),
    submit: () => ({
      typeKey: 'that:session:submit',
      action: 'submit',
      actionText: 'submitted',
      title: '~name~ submitted session for ~event~ ',
    }),
    attendAt: () => ({
      typeKey: 'that:session:attend:at',
      action: 'attendAt',
      actionText: 'attended AT',
      title: 'Attended AT session ~title~',
    }),
    attendOn: () => ({
      typeKey: 'that:session:attend:on',
      action: 'attendOn',
      actionText: 'attended ON',
      title: 'Attended ON session ~title~',
    }),
  },
  profile: {
    create: () => ({
      typeKey: 'that:profile:create',
      action: 'create',
      actionText: 'created',
      title: '~name~ created THAT Profile',
    }),
    update: () => ({
      typeKey: 'that:profile:update',
      action: 'update',
      actionText: 'updated',
      title: '~name~ updated THAT Profile',
    }),
  },
  speaker: {
    acceptedAtThat: () => ({
      typeKey: 'that:speaker:accept:at',
      action: 'acceptedAtThat',
      actionText: 'counselor AT THAT',
      title: '~name~ accepted to present AT THAT for ~event~',
    }),
    acceptedOnThat: () => ({
      typeKey: 'that:speaker:accept:on',
      action: 'acceptedOnThat',
      actionText: 'counselor ON THAT',
      title: '~name~ accepted to present ON THAT for ~event~',
    }),
    selectedAtThat: () => ({}),
    selectedOnThat: () => ({}),
  },
  // register or purchase?
  purchase: {
    onThat: () => ({
      typeKey: 'that:purchase:onticket',
      action: 'onThat',
      actionText: 'purchased ON THAT ticket',
      title: '~name~ purchased ON THAT ticket for ~event~',
    }),
    atThat: () => ({
      typeKey: 'that:purchase:atticket',
      action: 'atThat',
      actionText: 'purchased AT THAT ticket',
      title: '~name~ purchased AT THAT ticket for ~event~',
    }),
    membership: () => ({
      typeKey: 'that:purchase:membership',
      action: 'membership',
      actionText: 'purchased membership',
      title: `~name~ purchased membership on ~date~`,
    }),
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
  signups: {
    newsletter: () => ({
      typeKey: 'that:newsletter:signup',
      action: 'newsletter',
      actionText: 'newsletter',
      title: '~email~ signed-up for THAT Newsletter',
    }),
    slack: () => ({
      typeKey: 'that:slack:signup',
      action: 'slack',
      actionText: 'slackd',
      title: '~email~ signed-up for THAT Slack',
    }),
  },
  createAuth0Login: 'that:auth:create',
};
