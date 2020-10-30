import debug from 'debug';

const dlog = debug('that:api:datasources:firebase:asset');

const assignmentColName = 'assetAssignments';

const assets = dbInstance => {
  dlog('Asset instance created');
  const assignmentCollection = dbInstance.collection(assignmentColName);

  async function findEntityAssets({ entityId, entityType }) {
    dlog('findEntityAsset %s, %s', entityId, entityType);
    const { docs } = await assignmentCollection
      .where('entityId', '==', entityId)
      .where('entityType', '==', entityType)
      .select('assetId')
      .get();

    return docs.map(doc => ({
      id: doc.get('assetId'),
    }));
  }

  return {
    findEntityAssets,
  };
};

export default assets;
