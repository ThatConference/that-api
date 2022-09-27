import debug from 'debug';
import utility from '../../utility';

const dlog = debug('that:api:datasources:firebase:product');
const { entityDateForge } = utility.firestoreDateForge;
const forgeFields = ['createdAt', 'lastUpdateAt'];
const productDateForge = entityDateForge({ fields: forgeFields });

const collectionName = 'products';

const product = dbInstance => {
  dlog('instance created');

  const productCollection = dbInstance.collection(collectionName);

  function get(id) {
    dlog('get called %s', id);
    return productCollection
      .doc(id)
      .get()
      .then(doc => {
        let result = null;
        if (doc.exists) {
          result = {
            id: doc.id,
            ...doc.data(),
          };
          result = productDateForge(result);
        }
        return result;
      });
  }

  function getBatch(ids) {
    dlog('getBatch called %d ids', ids.length);
    if (!Array.isArray(ids))
      throw new Error('getBatch must receive an array of ids');
    const docRefs = ids.map(id => productCollection.doc(id));
    return dbInstance.getAll(...docRefs).then(docSnaps =>
      docSnaps.map(docSnap => {
        let result = null;
        if (docSnap.exists) {
          result = {
            id: docSnap.id,
            ...docSnap.data(),
          };
          result = productDateForge(result);
        }
        return result;
      }),
    );
  }

  return { get, getBatch };
};

export default product;
