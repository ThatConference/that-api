import debug from 'debug';
import firestoreDateForge from '../../utility/firestoreDateForge';

const dlog = debug('that:api:datasources:firebase:slug');
const collectionName = 'slugs';
const { dateForge } = firestoreDateForge;

const slugTypes = ['member', 'session', 'partner', 'event', 'community'];

function validateSlugType(type) {
  if (!slugTypes.includes(type)) {
    throw new Error(
      `Slug type ${type} not supported. Supported types ${slugTypes}`,
    );
  }
}

function validateNewSlugArguments({ slugName, type, referenceId }) {
  if (!slugName)
    throw new Error(
      'create requires slugName, type, and referenceId. slugName is missing',
    );
  if (!type)
    throw new Error(
      'create requires slugName, type, and referenceId. type is missing',
    );
  if (!referenceId)
    throw new Error(
      'create requires slugName, type, and referenceId. referenceId is missing',
    );
}

const slug = dbInstance => {
  dlog('slug cloudFirestore instance created');

  const slugCollection = dbInstance.collection(collectionName);

  function makeSlugDoc({ slugName, type, referenceId }) {
    dlog('makeSlugDoc called %s, %s, %s', slugName, type, referenceId);
    validateSlugType(type);
    validateNewSlugArguments({ slugName, type, referenceId });

    return {
      slug: slugName,
      type,
      referenceId,
      createdAt: new Date(),
    };
  }

  // does not return a Promise
  function getSlugDocRef(slugName) {
    dlog('getSlugDocRef for %s', slugName);
    return slugCollection.doc(slugName);
  }

  async function create({ slugName, type, referenceId }) {
    dlog('create called %s, %s, %s', slugName, type, referenceId);
    validateSlugType(type);
    validateNewSlugArguments({ slugName, type, referenceId });

    const docRef = slugCollection.doc(slugName);
    const docSnapshot = await docRef.get();
    if (docSnapshot.exists)
      throw new Error(`Unable to create slug ${slugName} as it already exists`);

    const newDoc = {
      slug: slugName,
      type,
      referenceId,
      createdAt: new Date(),
    };
    const result = await docRef.set(newDoc);
    if (!result.updateTime)
      throw new Error(`Error writing slug record ${newDoc}`);

    return {
      id: slugName,
      ...newDoc,
    };
  }

  function isSlugTaken(slugName) {
    dlog('is slug taken %s', slugName);
    return slugCollection
      .doc(slugName)
      .get()
      .then(docSnapshot => docSnapshot.exists);
  }

  async function get(slugName) {
    dlog('get %s', slugName);
    const docSnapshot = slugCollection.doc(slugName).get();
    let result = null;
    if (docSnapshot.exists) {
      result = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      };
    }

    return result;
  }

  function getBatch(slugNames) {
    dlog('getBatch %d', slugNames.length);
    if (!Array.isArray(slugNames))
      throw new Error('slugNames sent to getBatch must be an array');
    return Promise.all(slugNames.map(sn => get(sn)));
  }

  async function findFromArray(slugNames) {
    dlog('findFromArray, array size %d', slugNames.length);
    if (!Array.isArray(slugNames))
      throw new Error('slugNames sent to findFromArray must be an arrray');
    if (slugNames.length > 10)
      throw new Error('Too large. slugNames must contain 10 or less eletments');

    const { docs } = await slugCollection.where('slug', 'in', slugNames).get();

    return docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: dateForge(doc.get('createdAt')),
    }));
  }

  return {
    makeSlugDoc,
    getSlugDocRef,
    create,
    isSlugTaken,
    get,
    getBatch,
    findFromArray,
  };
};

export default slug;
