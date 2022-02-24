import constants from '../../../constants';
import purgeEntityMutations from '../purgeEntityMutations';

describe('validate purgeEntityMutations', () => {
  describe('All constant entries have an associated mutation', () => {
    const graphCdnPurge = constants.GRAPHCDN.PURGE;
    const keys = Object.keys(graphCdnPurge);
    const vals = Object.values(graphCdnPurge);

    vals.forEach((val, idx) => {
      it(`will find a mutation for key, ${keys[idx]}`, () => {
        const find = purgeEntityMutations[val];
        expect(find).not.toBeUndefined();
      });
    });
  });
});
