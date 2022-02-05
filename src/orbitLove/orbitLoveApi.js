// our  Orbit.love api sdk
import 'dotenv/config';
import debug from 'debug';
import fetch from 'node-fetch';
import { getOrbitLove } from '../envConfig';
import dataSources from '../dataSources';
import activityTypesSrc from './activityTypes';

const { cloudFirestore } = dataSources;
const memberStore = cloudFirestore.member;
const eventStore = cloudFirestore.event;
const dlog = debug('that:api:orbit-love');
const thatusbase = 'https://that.us';

export const activityTypes = activityTypesSrc;

export default function orbitLoveApi({ firestore }) {
  dlog('Orbit.love api instance created');
  const { workspaceSlug, token: orbitToken, baseUrl } = getOrbitLove();

  function getThatMemberData(user) {
    return memberStore(firestore).find(user.sub);
  }
  function getThatEventData(eventId) {
    return eventStore(firestore).get(eventId);
  }

  function sendOrbitPostRequest({ payload, uriAction = 'activities' }) {
    dlog('Orbit post request');
    const headers = {
      Authorization: `Bearer ${orbitToken}`,
      'Content-type': 'application/json',
    };
    const url = `${baseUrl}/${workspaceSlug}/${uriAction}`;

    return fetch(url, {
      method: 'post',
      body: JSON.stringify(payload),
      headers,
    })
      .then(res => {
        if (res.ok) return res.json();
        if (res.status === 422)
          return {
            statusText: res.statusText,
            status: 422,
            err: res.json(),
          };
        throw new Error('Request Error:', res.statusText);
      })
      .then(json => {
        if (json.err)
          throw new Error(`${json.status}:${json.statusText}:${json.err}`);
        return json;
      });
  }

  // API Functions
  return {
    async addSessionActivity({ activityType, user, session, event }) {
      dlog('addSessionActivity called for %s', user.sub);

      let thatMember = user;
      if (!thatMember.email) {
        thatMember = await getThatMemberData(user.sub);
      }
      const { firstName, lastName, profileSlug, email } = thatMember;
      const title = activityType.title
        .replace('~name~', `${firstName} ${lastName}`)
        .replace('~title~', session.title || 'N/A')
        .replace('~event~', event.slug);
      let description = `${activityType.actionText} session "${session.title}" of type ${session.type}`;
      if (event?.slug) description += ` for ${event.slug}.`;
      const payload = {
        identity: {
          source: 'email',
          email,
        },
        activity: {
          title,
          description,
          activity_type_key: activityType.typeKey,
          link: `${thatusbase}/activities/${session.id}`,
          link_text: 'activity',
          properties: {
            sessionType: session.type,
            event: event?.slug || 'not available',
            firstName,
            lastName,
            profileSlug,
          },
        },
      };

      return sendOrbitPostRequest({ payload });
    },
    addProfileActivity({ activityType, member }) {
      dlog('addProfileActivty called for %s', member.id);

      const { firstName, lastName, profileSlug, email, canFeature } = member;
      const title = activityType.title.replace(
        '~name~',
        `${firstName} ${lastName}`,
      );
      const description = `${firstName} ${lastName} ${activityType.actionText} their THAT profile. (canFeature: ${canFeature})`;
      const payload = {
        identity: {
          source: 'email',
          email,
        },
        activity: {
          title,
          description,
          activity_type_key: activityType.typeKey,
          link: `${thatusbase}/members/${profileSlug}`,
          link_text: 'Profile',
        },
        member: {
          name: `${firstName} ${lastName}`,
        },
        properties: {
          profileSlug: profileSlug || '',
          canFeature: canFeature || '',
        },
      };

      return sendOrbitPostRequest({ payload });
    },
    async addPurchaseActivity({ activityType, member, order }) {
      // Purchases handled in Brinks.
      // This will be called from an event handler there.
      dlog('addPurchaseActivity called for %s', member.id);
      throw new Error('addPurchaseActivity not implemented');
    },
    async addSpeakerActivity({ activityType, member, order }) {
      // We identify speakers at two points
      // 1. When they accept to speak and receive ticket (order.type>speaker)
      // 2. When they create a THAT Activity??
      dlog('addSpeakerActivity called for %s', member.id);

      const { email, firstName, lastName, profileSlug } = member;
      const thatEvent = await getThatEventData(order.event);
      const title = activityType.title
        .replace('~name~', `${firstName} ${lastName}`)
        .replace('~event~', thatEvent.slug);

      const payload = {
        identity: {
          source: 'email',
          email,
        },
        activity: {
          title,
          description: title,
          activity_type_key: activityType.typeKey,
          link: `${thatusbase}/members/${profileSlug}`,
          link_text: 'Profile',
        },
        member: {
          name: `${firstName} ${lastName}`,
          tags_to_add: 'speaker',
        },
        properties: {
          eventSlug: thatEvent.slug,
          event: thatEvent.name,
          firstName,
          lastName,
          profileSlug,
        },
      };

      return sendOrbitPostRequest({ payload });
    },
    addFavoriteActivity({ activityType, user, favorite }) {
      dlog('addFavoriteActivity called');
      throw new Error('addFavoriteActivity not implemented');
    },
    addSignUpActivity({ activityType, email }) {
      // Sign-up activity isn't really done through our api so the
      // thought here is that we will use a webhook (e.g. that-api-webhooks)
      dlog('addSignUpActivity called for %s', email);
      if (!email) throw new Error('email parameter is required');
      if (!['newsletter', 'slack'].includes(activityType.action))
        throw new Error(
          `incorrect activityType, ${activityType.action}, provided`,
        );
      const title = activityType.title.replace('~email~', email);
      const description = title;
      const payload = {
        identity: {
          source: 'email',
          email,
        },
        activity: {
          title,
          description,
          activity_type_key: activityType.typeKey,
        },
      };

      return sendOrbitPostRequest({ payload });
    },
    addLeadGenActivity({ activityType, user }) {
      dlog('addLeadGenActivity called');
      throw new Error('addLeadGenActivity is not implemented');
    },
    addNewsActivity({ activityType, user }) {
      dlog('addNewsActivity called');
      throw new Error('addNewsActicity is not implemented');
    },
  };
}
