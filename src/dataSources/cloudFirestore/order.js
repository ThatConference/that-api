import debug from 'debug';
import utility from '../../utility';

const dlog = debug('that:api:datasources:firebase:order');
const { dateForge, entityDateForge } = utility.firestoreDateForge;
const forgeFields = ['createdAt', 'lastUpdatedAt', 'orderDate'];
const orderDateForge = entityDateForge({ fields: forgeFields });

const collectionName = 'orders';

const scrubOrder = ({ order, isNew, userId }) => {
  dlog('scrubProduct called');
  const scrubbedOrder = order;
  const thedate = new Date();
  if (isNew) {
    scrubbedOrder.createdAt = thedate;
    scrubbedOrder.createdBy = userId;
  }
  scrubbedOrder.lastUpdatedAt = thedate;
  scrubbedOrder.lastUpdatedBy = userId;

  return scrubbedOrder;
};

const order = dbInstance => {
  dlog('instance created');

  const orderCollection = dbInstance.collection(collectionName);

  function get(id) {
    dlog('get called %s', id);
    return orderCollection
      .doc(id)
      .get()
      .then(doc => {
        let result = null;
        if (doc.exists) {
          result = {
            id: doc.id,
            ...doc.data(),
          };
          result = orderDateForge(result);
        }
        return result;
      });
  }

  function getBatch(ids) {
    if (!Array.isArray(ids))
      throw new Error('getBatch must receive an array of ids');
    dlog('getBatch called %d ids', ids.length);
    return Promise.all(ids.map(id => get(id)));
  }

  async function getPaged({ pageSize, cursor }) {
    dlog('get page called');
    let query = orderCollection
      .orderBy('createdAt', 'desc')
      .limit(pageSize || 20);

    if (cursor) {
      const curObject = Buffer.from(cursor, 'base64').toString('utf8');
      const { curCreatedAt } = JSON.parse(curObject);
      if (!curCreatedAt) throw new Error('Invalid cursor provided');
      query = query.startAfter(new Date(curCreatedAt));
    }
    const { size, docs } = await query.get();
    dlog('found %d records', size);

    const orders = docs.map(doc => {
      const r = {
        id: doc.id,
        ...doc.data(),
      };
      return orderDateForge(r);
    });

    const lastdoc = orders[orders.length - 1];
    let newCursor = '';
    if (lastdoc) {
      const cpieces = JSON.stringify({
        curCreatedAt: dateForge(lastdoc.createdAt),
      });
      newCursor = Buffer.from(cpieces, 'utf8').toString('base64');
    }

    return {
      orders,
      cursor: newCursor,
      count: orders.length,
    };
  }

  function getMe({ user, orderId }) {
    dlog(`get ${orderId} for user ${user.sub}`);
    return orderCollection
      .doc(orderId)
      .get()
      .then(doc => {
        let result = null;
        if (doc.exists) {
          result = {
            id: doc.id,
            ...doc.data(),
          };
          result = orderDateForge(result);
          if (result.member !== user.sub) result = null;
        }
        return result;
      });
  }

  async function getPagedMe({ user, pageSize, cursor }) {
    dlog(`getPagedMe called with pagesize %d`, pageSize);
    if (pageSize > 100)
      throw new Error('Max page size of 100 exceeded, %d', pageSize);

    let query = orderCollection
      .orderBy('createdAt', 'desc')
      .where('member', '==', user.sub)
      .limit(pageSize || 20);

    if (cursor) {
      const curObject = Buffer.from(cursor, 'base64').toString('utf8');
      const { curCreatedAt, curMember } = JSON.parse(curObject);
      if (curMember !== user.sub) throw new Error('Invalid cursor profived');
      if (!curCreatedAt) throw new Error('Invalid cursor provided');
      query = query.startAfter(new Date(curCreatedAt));
    }
    const { size, docs } = await query.get();
    dlog('found %d records', size);

    const orders = docs.map(doc => {
      const r = {
        id: doc.id,
        ...doc.data(),
      };
      return orderDateForge(r);
    });

    const lastdoc = orders[orders.length - 1];
    let newCursor = '';
    if (lastdoc) {
      const cpieces = JSON.stringify({
        curCreatedAt: dateForge(lastdoc.createdAt),
        curMember: user.sub,
      });
      newCursor = Buffer.from(cpieces, 'utf8').toString('base64');
    }

    return {
      orders,
      cursor: newCursor,
      count: orders.length,
    };
  }

  async function create({ newOrder, user }) {
    dlog('create called');
    const scrubbedOrder = scrubOrder({
      order: newOrder,
      isNew: true,
      userId: user.sub,
    });
    const newDoc = await orderCollection.add(scrubbedOrder);

    return get(newDoc.id);
  }

  async function update({ orderId, upOrder, user }) {
    dlog(`updated called for %s by %s`, orderId, user.sub);
    const scrubbedOrder = scrubOrder({
      order: upOrder,
      userId: user.sub,
    });
    const docRef = orderCollection.doc(orderId);
    await docRef.update(scrubbedOrder);

    return get(docRef.id);
  }

  function findByStripeEvent(stripeEventId) {
    dlog(`findByStripeEvent called for ${stripeEventId}`);
    return orderCollection
      .where('stripeEventIds', 'array-contains', stripeEventId)
      .get()
      .then(docSnapshot => {
        let result = null;
        if (docSnapshot.size > 0) result = docSnapshot.doc[0].id;

        return result;
      });
  }

  return {
    get,
    getBatch,
    getPaged,
    getMe,
    getPagedMe,
    create,
    update,
    findByStripeEvent,
  };
};

export default order;
