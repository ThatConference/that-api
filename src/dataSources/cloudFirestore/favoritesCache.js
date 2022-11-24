import debug from 'debug';
import dateForge from '../../utility/firestoreDateForge';

const dlog = debug('that:api:datasources:firebase:favoritesCache');

const collectionName = 'favoritesCache';
const { entityDateForge } = dateForge;
const forgeFields = ['cachedAt'];

const favoritesCache = dbInstance => {
  dlog('favorite cloudFirestore instance created');

  const favCacheCollection = dbInstance.collection(collectionName);
  const favCacheDateForge = entityDateForge({ fields: forgeFields });

  // returns cache entry
  function findFavoritesCache(memberId) {
    dlog('find favoritesCache for %s', memberId);
    return favCacheCollection
      .doc(memberId)
      .get()
      .then(docSnap => {
        let r = null;
        if (docSnap.exists) {
          r = {
            id: docSnap.id,
            ...docSnap.data(),
          };
        }

        return favCacheDateForge(r);
      });
  }

  // Adds or updates cache entry
  function addFavoritesCache({ memberId, icsData }) {
    dlog('add favorites cache for %s, ics size: %d', memberId, icsData.length);
    const data = {
      memberId,
      icsData,
      favoriteType: 'session',
      cachedAt: new Date(),
    };

    return favCacheCollection
      .doc(memberId)
      .set(data, { merge: false })
      .then(() => true);
  }

  function deleteFavoritesCache(memberId) {
    dlog('delete favorite cache for %s', memberId);

    return favCacheCollection
      .doc(memberId)
      .delete()
      .then(() => true);
  }

  return {
    findFavoritesCache,
    addFavoritesCache,
    deleteFavoritesCache,
  };
};

export default favoritesCache;
