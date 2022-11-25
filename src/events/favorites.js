import { EventEmitter } from 'events';
import debug from 'debug';
// import { dataSources } from '@thatconference/api';
import favCacheFn from '../dataSources/cloudFirestore/favoritesCache';

const dlog = debug('that:api:sessions:events:favorites');

export default function favoritesEvent({ firestore, sentry }) {
  const favEventEmitter = new EventEmitter();
  dlog('favorites event emitter created');

  function purgeFavoritesCache(memberId) {
    dlog('purging/deleting cache for %s', memberId);
    try {
      const favCacheStore = favCacheFn(firestore);
      return favCacheStore.delete(memberId);
    } catch (err) {
      return process.nextTick(() => favEventEmitter.emit('error', err));
    }
  }

  function cacheFavorites({ memberId, data }) {
    dlog('caching favoites for %s. data size: %d', memberId, data.length);

    try {
      const favCacheStore = favCacheFn(firestore);
      return favCacheStore.addFavoritesCache({ memberId, icsData: data });
    } catch (err) {
      return process.nextTick(() => favEventEmitter.emit('error', err));
    }
  }

  // ****************************
  // initalize emitters
  favEventEmitter.on('editFavorite', purgeFavoritesCache);
  favEventEmitter.on('newFavorite', cacheFavorites);

  favEventEmitter.on('error', err => {
    sentry.setTag('section', 'favoritesEventEmitter');
    sentry.captureException(err);
  });

  return favEventEmitter;
}
