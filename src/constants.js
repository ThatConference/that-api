const constants = {
  THAT: {
    FAVORITING: {
      TYPE: {
        EVENT: 'event',
        PARTNER: 'partner',
        COMMUNITY: 'community',
        MEMBER: 'member',
      },
    },
    PRODUCT_TYPE: {
      TICKET: 'TICKET',
      MEMBERSHIP: 'MEMBERSHIP',
      PARTNERSHIP: 'PARTNERSHIP',
      FOOD: 'FOOD',
      COUPON: 'COUPON',
      TRAINING: 'TRAINING',
      FAMILY: 'FAMILY',
    },
    MESSAGING: {
      WRITE_QUEUE_RATE: 100,
      READ_QUEUE_RATE: 100,
    },
  },
  STRIPE: {
    CHECKOUT_MODE: {
      PAYMENT: 'payment',
      SUBSCRIPTION: 'subscription',
    },
    SUBSCRIPTION_STATUS: {
      ACTIVE: 'active',
      CANCELLED: 'canceled',
      PAST_DUE: 'past_due',
      UNPAID: 'unpaid',
      INCOMPLETE: 'incomplete',
      INCOMPLETE_EXPIRED: 'incomplete_expired',
    },
  },
  GRAPHCDN: {
    EVENT_NAME: {
      PURGE: 'purgeEntity',
      CREATED_SESSION: 'createdSession',
      CREATED_PRODUCT: 'createdProduct',
    },
    PURGE: {
      MEMBER: 'purgeMembers',
      SESSION: 'purgeSessions',
      PRODUCT: 'purgeProducts',
      ORDER_ALLOCATION: 'purgeOrderAllocation',
    },
  },
};

export default constants;
