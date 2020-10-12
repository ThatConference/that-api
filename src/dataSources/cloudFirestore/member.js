import debug from 'debug';

const dlog = debug('that:api:datasources:firebase:member');

const collectionName = 'members';

const member = dbInstance => {
  dlog('instance created');

  async function find(memberId) {
    dlog('find %s', memberId);
    const docRef = await dbInstance.doc(`${collectionName}/${memberId}`).get();
    let result = null;
    if (docRef.exists)
      result = {
        id: docRef.id,
        canFeature: docRef.get('canFeature'),
        isDeactivated: docRef.get('isDeactivated'),
      };

    return result;
  }

  function findBatch(memberIds) {
    dlog('findBatch of %d', memberIds.length);

    const docFuncs = memberIds.map(id => find(id));

    return Promise.all(docFuncs);
  }

  return { find, findBatch };
};

export default member;
