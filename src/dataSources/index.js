import favorites from './cloudFirestore/favorite';
import slug from './cloudFirestore/slug';
import assets from './cloudFirestore/asset';
import order from './cloudFirestore/order';
import member from './cloudFirestore/memberExternal';
import product from './cloudFirestore/product';

export default {
  cloudFirestore: {
    favorites,
    slug,
    assets,
    order,
    member,
    product,
  },
};
