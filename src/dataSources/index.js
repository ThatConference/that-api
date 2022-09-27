import favorites from './cloudFirestore/favorite';
import slug from './cloudFirestore/slug';
import assets from './cloudFirestore/asset';
import member from './cloudFirestore/memberExternal';
import product from './cloudFirestore/product';
import history from './cloudFirestore/history';
import event from './cloudFirestore/event';
import eventSpeaker from './cloudFirestore/eventSpeaker';
import partner from './cloudFirestore/partner';

export default {
  cloudFirestore: {
    favorites,
    slug,
    assets,
    member,
    product,
    history,
    event,
    eventSpeaker,
    partner,
  },
};
