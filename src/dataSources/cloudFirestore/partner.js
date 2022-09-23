import debug from 'debug';
import utility from '../../utility';

const dlog = debug('that:api:datasources:firebase:partner');
const { partners: partnerDateForge } = utility.firestoreDateForge;

const collectionName = 'partners';

const partner = dbInstance => {
  dlog('instance created');

  const partnerCollection = dbInstance.collection(collectionName);

  function get(partnerId) {
    dlog('get partner %s', partnerId);
    return partnerCollection
      .doc(partnerId)
      .get()
      .then(docRef => {
        let result = null;
        if (docRef.exists) {
          result = {
            id: docRef.id,
            ...docRef.data(),
          };
          result = partnerDateForge(result);
        }

        return result;
      });
  }

  function getBatch(partnerIds) {
    if (!Array.isArray(partnerIds))
      throw new Error('getBatch parameter, partnerIds, must be an array');
    dlog('get many partners (batch), %d', partnerIds.length);
    const docRefs = partnerIds.map(id =>
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
          result = partnerDateForge(result);
        }
        return result;
      }),
    );
  }

  // returns memberIds of contacts
  function findPartnerPrimaryContacts(partnerId) {
    dlog('findPartnerCompanyContacts, %s', partnerId);
    const subCollectionName = 'members';
    return partnerCollection
      .doc(partnerId)
      .collection(subCollectionName)
      .where('isPrimaryContact', '==', true)
      .get()
      .then(querySnap => querySnap.docs.map(doc => doc.id));
  }

  // returns full partner-member records for partner
  function getAllPartnerMembers(partnerId) {
    dlog('getAllPartnerMembers for %s', partnerId);
    const subCollectionName = 'members';
    return partnerCollection
      .doc(partnerId)
      .collection(subCollectionName)
      .get()
      .then(querySnap =>
        querySnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
  }

  return {
    get,
    getBatch,
    findPartnerPrimaryContacts,
    getAllPartnerMembers,
  };
};

export default partner;
