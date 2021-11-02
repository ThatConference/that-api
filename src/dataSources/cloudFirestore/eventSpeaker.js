/* eslint-disable no-underscore-dangle */
import debug from 'debug';
import utility from '../../utility';

const dlog = debug('that:api:datasources:firebase:eventSpeaker');
const { entityDateForge } = utility.firestoreDateForge;
const forgeFields = ['rsvpAt'];
const eventSpeakerDateForge = entityDateForge({ fields: forgeFields });

const eventSpeaker = dbInstance => {
  dlog('instance created');

  const collectionName = 'events';
  const subCollectionName = 'acceptedSpeakers';
  const eventCollection = dbInstance.collection(collectionName);
  const ACCEPT_ROOM_BENEFIT = 'acceptRoomBenefit';

  async function validatedUpdate({ eventId, memberId, newValues }) {
    dlog('update eventSpeaker collection');

    const acceptedSpeakerDocRef = eventCollection
      .doc(eventId)
      .collection(subCollectionName)
      .doc(memberId);
    const acceptedSpeaker = await acceptedSpeakerDocRef.get();

    const result = {
      success: false,
      message: '',
    };

    if (acceptedSpeaker.exists) {
      const asRecord = {
        ...acceptedSpeaker.data(),
      };
      if (asRecord.status === 'COMPLETE') {
        result.message = `Speaker enrollment proccess already marked complete. No action taken`;
      } else if (!asRecord.platform) {
        result.message = `Platform (AT or ON) for speaker is not set. No action taken.`;
      } else if (
        asRecord.platform === 'ON' &&
        Object.keys(newValues).includes(ACCEPT_ROOM_BENEFIT)
      ) {
        result.message = `Room benefit only applies to AT speakers.`;
      } else {
        await acceptedSpeakerDocRef.update(newValues);
        result.success = true;
      }
    } else {
      result.message = `Member not listed as accepted speaker`;
    }

    return result;
  }

  function setAcceptToSpeak({ eventId, memberId, isAccepting, reason }) {
    dlog(
      'setAcceptToSpeak on event %s, for member: %s, result: %o',
      eventId,
      memberId,
      isAccepting,
    );
    const newValues = {
      agreeToSpeak: isAccepting,
      status: 'IN_PROGRESS',
      rsvpAt: new Date(),
      reason: reason || null,
    };
    return validatedUpdate({ eventId, memberId, newValues }).then(r => {
      const result = r;
      if (result?.success === true) {
        result.message = `Marked as accepted to speak, ${isAccepting}`;
      }
      return result;
    });
  }

  function setAcceptRoomBenefit({ eventId, memberId, acceptRoom }) {
    dlog(
      'setAcceptRoomBenefit called on event %s, for member %s, accept %o',
      eventId,
      memberId,
      acceptRoom,
    );

    const newValues = {};
    newValues[ACCEPT_ROOM_BENEFIT] = acceptRoom;

    return validatedUpdate({ eventId, memberId, newValues }).then(r => {
      const result = r;
      if (result?.success === true) {
        result.message = `Marked accept room benefit as ${acceptRoom}`;
      }

      return result;
    });
  }

  function setEnrollmentComplete({ eventId, memberId }) {
    dlog(
      'setEnrollmentComplete called on event %s for member %s',
      eventId,
      memberId,
    );

    const newValues = {
      status: 'COMPLETE',
    };

    return validatedUpdate({ eventId, memberId, newValues }).then(r => {
      const result = r;
      if (result?.success === true) {
        result.message = `Marked speaker enrollment as complete.`;
      }

      return result;
    });
  }

  function get({ eventId, memberId }) {
    dlog('get for %s in event %s', memberId, eventId);

    return eventCollection
      .doc(eventId)
      .collection(subCollectionName)
      .doc(memberId)
      .get()
      .then(docSnap => {
        let r = {
          memberId,
          eventId,
          isAcceptedSpeaker: false,
          agreeToSpeak: false,
          status: null,
        };
        if (docSnap.exists) {
          const _eventSpeaker = docSnap.data();
          r = {
            ...r,
            ..._eventSpeaker,
            isAcceptedSpeaker: true,
            agreeToSpeak: _eventSpeaker.agreeToSpeak || false,
            status: _eventSpeaker.status || 'NOT_STARTED',
            platform: _eventSpeaker.platform || null,
            rsvpAt: _eventSpeaker.rsvpAt || null,
            orderId: _eventSpeaker.orderId || null,
          };
        }

        return eventSpeakerDateForge(r);
      });
  }

  function update({ eventId, memberId, updateObj }) {
    dlog('update called for %s in event %s', memberId, eventId);
    return eventCollection
      .doc(eventId)
      .collection(subCollectionName)
      .doc(memberId)
      .update(updateObj)
      .then(() => get({ eventId, memberId }));
  }

  return {
    setAcceptToSpeak,
    setAcceptRoomBenefit,
    setEnrollmentComplete,
    get,
    update,
  };
};

export default eventSpeaker;
