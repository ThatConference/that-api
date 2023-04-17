/* Member firestore function for sharing externally */
import debug from 'debug';
import utility from '../../utility';

const dlog = debug('that:api:datasources:firebase:member');
const { members: memberDateForge } = utility.firestoreDateForge;

const collectionName = 'members';

const member = dbInstance => {
  dlog('instance created');

  const memberCollection = dbInstance.collection(collectionName);

  function get(memberId) {
    dlog('get %s', memberId);
    return memberCollection
      .doc(memberId)
      .get()
      .then(docRef => {
        let result = null;
        if (docRef.exists) {
          result = {
            id: docRef.id,
            ...docRef.data(),
          };
          result = memberDateForge(result);
        }

        return result;
      });
  }

  function batchFind(memberIds) {
    if (!Array.isArray(memberIds))
      throw new Error('getBatch parmeter, memberIds, must be an array');
    dlog('get many members (batch),  %d', memberIds.length);
    const docRefs = memberIds.map(id =>
      dbInstance.doc(`${collectionName}/${id}`),
    );
    return dbInstance.getAll(...docRefs).then(docSnaps =>
      docSnaps.map(docSnap => {
        let result = null;
        if (docSnap.exists) {
          result = {
            id: docSnap.id,
            ...docSnap.data(),
          };
          result = memberDateForge(result);
        }
        return result;
      }),
    );
  }

  async function update({ memberId, profile, updatedBy }) {
    dlog('update %s', memberId);
    const docRef = memberCollection.doc(memberId);
    const moddedProfile = profile;
    moddedProfile.lastUpdatedAt = new Date();
    if (updatedBy) moddedProfile.lastUpdatedBy = updatedBy;
    await docRef.update(moddedProfile);

    return get(memberId);
  }

  function findMemberByStripeCustId(stripeCustId) {
    return memberCollection
      .where('stripeCustomerId', '==', stripeCustId)
      .get()
      .then(querySnap =>
        querySnap.docs.map(m => {
          const r = {
            id: m.id,
            ...m.data(),
          };
          return memberDateForge(r);
        }),
      );
  }

  function getIdType(memberId) {
    return get(memberId).then(m => {
      let typename = 'PrivateProfile';
      if (m.canFeature) typename = 'PublicProfile';
      return {
        id: m.id,
        __typename: typename,
      };
    });
  }

  function getSecureBatch(ids) {
    dlog('getBatch called %d ids', ids.length);
    if (!Array.isArray(ids))
      throw new Error('getBatch must receive an array of ids');
    return Promise.all(ids.map(id => getIdType(id)));
  }

  function getNotificationPreferenceFor({ preferenceName, preferenceValue }) {
    dlog(
      'getNotificationPreferenceFor called for preference %s with value %o',
      preferenceName,
      preferenceValue,
    );
    if (
      preferenceName === null ||
      preferenceName === undefined ||
      typeof preferenceName !== 'string' ||
      preferenceName.includes('.')
    ) {
      throw new Error('preferenceName must be and alpha string value');
    }
    if (
      preferenceValue === null ||
      preferenceValue === undefined ||
      typeof preferenceValue !== 'boolean'
    ) {
      throw new Error('preferenceValue must be a boolean value');
    }
    return memberCollection
      .where(`notificationPreferences.${preferenceName}`, '==', preferenceValue)
      .get()
      .then(querySnap =>
        querySnap.docs.map(m => {
          const r = {
            id: m.id,
            ...m.data(),
          };
          return memberDateForge(r);
        }),
      );
  }

  return {
    get,
    batchFind,
    update,
    findMemberByStripeCustId,
    getSecureBatch,
    getNotificationPreferenceFor,
  };
};

export default member;
