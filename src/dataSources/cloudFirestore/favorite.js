import debug from 'debug';
import dateForge from '../../utility/firestoreDateForge';
import memberStore from './member';

const dlog = debug('that:api:datasources:firebase:favorite');

const favoriteColName = 'favorites';
const favoriteTypes = [
  'members',
  'sessions',
  'communities',
  'events',
  'partners',
];

const favorite = dbInstance => {
  dlog('instance created');

  const favoritesCollection = dbInstance.collection(favoriteColName);

  async function findFavoriteForMember({ favoritedId, favoriteType, user }) {
    dlog('findFavoriteForMember %s, %s', favoritedId, user.sub);
    const { docs } = await favoritesCollection
      .where('favoritedId', '==', favoritedId)
      .where('memberId', '==', user.sub)
      .where('type', '==', favoriteType)
      .select()
      .get();

    if (docs.length > 1)
      throw new Error(
        `Multiple favorited ${favoriteType} for member ${user.sub} on ${favoritedId}`,
      );

    let result = null;
    const [f] = docs;
    if (f) result = { id: f.id };

    return result;
  }

  async function addFavoriteForMember({ favoritedId, favoriteType, user }) {
    dlog('add favorite %s of %s for %s', favoritedId, favoriteType, user.sub);
    const newFavorite = {
      memberId: user.sub,
      favoritedId,
      type: favoriteType,
      createdAt: new Date(),
    };
    const newDoc = await favoritesCollection.doc(newFavorite);

    return {
      id: newDoc.id,
      ...newFavorite,
    };
  }

  function removeFavorite({ favoritedId, user }) {
    dlog('Remove favorite %s', favoritedId);

    // Add check to verify it's this user's favorite?

    return favoritesCollection.doc(favoritedId).delete();
  }

  async function getFavoriteCount({ favoritedId, favoriteType }) {
    dlog('getFavoriteCount for %s of type %s', favoritedId, favoriteType);
    const { size } = await favoritesCollection
      .where('favoritedId', '==', favoritedId)
      .where('type', '==', favoriteType)
      .select()
      .get();

    return size;
  }

  async function getFollowersPaged({
    favoritedId,
    favoriteType,
    pageSize,
    cursor,
  }) {
    dlog(
      'getFollowersPaged id %s of type %s, pageSize %d, cursor %o',
      favoritedId,
      favoriteType,
      pageSize,
      cursor,
    );
    const limit = Math.min(pageSize || 10, 100);
    let query = favoritesCollection
      .where('favoritedId', '==', favoritedId)
      .where('type', '==', favoriteType)
      .orderBy('createdAt')
      .limit(limit);

    if (cursor) {
      let currentCursor = Buffer.from(cursor, 'base64').toString('utf8');
      currentCursor = JSON.parse(currentCursor);
      if (
        !currentCursor ||
        !currentCursor.createdAt ||
        currentCursor.type !== favoriteType
      )
        throw new Error('invalid cursor provided');

      query = query.startAfter(new Date(currentCursor.createdAt));
    }
    const { docs, size } = await query.get();

    if (size === 0) {
      return {
        cursor: cursor || '',
        members: [],
      };
    }

    const followers = docs.map(f => {
      const fav = {
        id: f.id,
        ...f.data(),
      };
      return {
        memberId: fav.memberId,
        favDoc: fav,
      };
    });

    const cur = followers[followers.length - 1];
    let newCursor = {
      createdAt: dateForge.dateForge(cur.favDoc.createdAt),
      pageSize,
      favoritedId,
      type: favoriteType,
    };
    newCursor = JSON.stringify(newCursor);
    newCursor = Buffer.from(newCursor, 'utf8').toString('base64');

    const allMembers = await memberStore(dbInstance).findBatch(
      followers.map(f => f.memberId),
    );

    const members = allMembers
      .filter(fm => fm && fm.canFeature && !fm.isDeactivated)
      .map(m => ({ id: m.id }));

    return {
      cursor: newCursor,
      members,
    };
  }

  return {
    findFavoriteForMember,
    addFavoriteForMember,
    removeFavorite,
    getFavoriteCount,
    getFollowersPaged,
  };
};

export default favorite;
