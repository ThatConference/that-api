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
      throw new Error('getBatch parmeter, memberIds, must be in an array');
    dlog('get many members (batch),  %d', memberIds.length);
    const getFuncs = memberIds.map(m => get(m));
    return Promise.all(getFuncs);
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

  return { get, batchFind, update, findMemberByStripeCustId };
};

export default member;
