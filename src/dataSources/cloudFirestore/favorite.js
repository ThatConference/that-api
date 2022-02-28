import debug from 'debug';
import dateForge from '../../utility/firestoreDateForge';
import memberStore from './member';

const dlog = debug('that:api:datasources:firebase:favorite');

const favoriteColName = 'favorites';
const favoriteTypes = ['member', 'session', 'community', 'event', 'partner'];

function validateFavoriteType(type) {
  if (!favoriteTypes.includes(type)) {
    throw new Error(
      `Favorite type ${type} not supported. supported types: ${favoriteTypes}`,
    );
  }
}

const favorite = dbInstance => {
  dlog('favorite cloudFirestore instance created');

  const favoriteCollection = dbInstance.collection(favoriteColName);

  async function findFavoriteForMember({ favoritedId, favoriteType, user }) {
    dlog('findFavoriteForMember %s, %s', favoritedId, user.sub);
    validateFavoriteType(favoriteType);
    const { docs } = await favoriteCollection
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
    validateFavoriteType(favoriteType);
    const newFavorite = {
      memberId: user.sub,
      favoritedId,
      type: favoriteType,
      createdAt: new Date(),
    };
    const newDoc = await favoriteCollection.add(newFavorite);

    return {
      id: newDoc.id,
      ...newFavorite,
    };
  }

  // Set's favorite, add if needed, leave alone if already set.
  function setFavoriteForMember({ favoritedId, favoriteType, user }) {
    dlog('set favorite %s of %s for %s', favoritedId, favoriteType, user.sub);

    return findFavoriteForMember({
      favoritedId,
      favoriteType,
      user,
    }).then(fav => {
      if (fav) return fav;

      return addFavoriteForMember({ favoritedId, favoriteType, user });
    });
  }

  async function removeFavorite({ favoriteId, user }) {
    dlog('Remove favorite %s', favoriteId);

    // Add check to verify it's this user's favorite?
    const fav = await favoriteCollection.doc(favoriteId).get();
    if (!fav.exists)
      throw new Error(`Provided favoriteId does not exist ${favoriteId}`);
    if (user.sub !== fav.get('memberId'))
      throw new Error(
        `Unable to remove favorite not owned by current member ${favoriteId}`,
      );

    return favoriteCollection.doc(favoriteId).delete();
  }

  async function getFavoriteCount({ favoritedId, favoriteType }) {
    dlog('getFavoriteCount for %s of type %s', favoritedId, favoriteType);
    validateFavoriteType(favoriteType);
    const { size } = await favoriteCollection
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
    validateFavoriteType(favoriteType);
    const limit = Math.min(pageSize || 10, 100);
    let query = favoriteCollection
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

  async function getFavoritedIdsForMember({ memberId, favoriteType }) {
    dlog('get FavoritedIds for member called %s, %s', memberId, favoriteType);
    validateFavoriteType(favoriteType);
    const { docs } = await favoriteCollection
      .where('memberId', '==', memberId)
      .where('type', '==', favoriteType)
      .get();

    return docs.map(r => ({
      favoritedId: r.get('favoritedId'),
      favoriteType: r.get('type'),
    }));
  }

  async function getFavoritedIdsForMemberPaged({
    memberId,
    favoriteType,
    pageSize,
    cursor,
  }) {
    dlog(
      'getFavoritedIdsForMemberPaged %s, %s, %d',
      memberId,
      favoriteType,
      pageSize,
    );
    validateFavoriteType(favoriteType);
    const truePSize = Math.min(pageSize || 20, 100);
    let query = favoriteCollection
      .where('memberId', '==', memberId)
      .where('type', '==', favoriteType)
      .orderBy('createdAt')
      .limit(truePSize);

    if (cursor) {
      const curObject = Buffer.from(cursor, 'base64').toString('utf8');
      dlog('cursor sent %s', curObject);
      const { curCreatedAt, curFavoriteType, curMemberId } =
        JSON.parse(curObject);
      if (
        !curCreatedAt ||
        curFavoriteType !== favoriteType ||
        curMemberId !== memberId
      )
        throw new Error('Invalid cursor provided, favrorites');

      query = query.startAfter(new Date(curCreatedAt));
    }

    const { docs } = await query.get();
    const favorites = docs.map(d => ({
      ...d.data(),
    }));

    const lastdoc = favorites[favorites.length - 1];
    let newCursor = '';
    if (lastdoc) {
      const cpieces = JSON.stringify({
        curCreatedAt: dateForge.dateForge(lastdoc.createdAt),
        curFavoriteType: favoriteType,
        curMemberId: memberId,
      });
      newCursor = Buffer.from(cpieces, 'utf8').toString('base64');
    }

    return {
      count: favorites.length,
      cursor: newCursor,
      favorites,
    };
  }

  return {
    findFavoriteForMember,
    addFavoriteForMember,
    setFavoriteForMember,
    removeFavorite,
    getFavoriteCount,
    getFollowersPaged,
    getFavoritedIdsForMember,
    getFavoritedIdsForMemberPaged,
  };
};

export default favorite;
