import favorites from './cloudFirestore/favorite';
import slug from './cloudFirestore/slug';
import assets from './cloudFirestore/asset';
import member from './cloudFirestore/memberExternal';
import product from './cloudFirestore/product';
import history from './cloudFirestore/history';

export default {
  cloudFirestore: {
    favorites,
    slug,
    assets,
    member,
    product,
    history,
  },
};
