import setValueAtPath from '../setValueAtPath';

const baseObject = {
  data: 3,
  member: {
    firstName: 'Sally',
    lastName: 'Member',
    email: 'sally.member@example.com',
  },
  purchasedBy: {
    firstName: 'Susan',
    lastName: 'Member',
    email: 'susan.member@example.com',
  },
  event: {
    name: 'THAT Confrence',
    startDate: new Date('2021-03-12T21:40:40.431Z'),
    endDate: new Date('2021-03-13T21:40:40.431Z'),
    secondlevel: {
      data: 2,
      thirdlevel: {
        data: 3,
        name: 'thirdlevel',
        fourthlevel: {
          data: 4,
          name: 'no name here',
        },
      },
    },
  },
};

describe('setValueAtPath tests', () => {
  let clone = {};
  beforeEach(() => {
    clone = JSON.parse(JSON.stringify(baseObject));
  });

  afterEach(() => {
    clone = {};
  });

  describe('value updated at path', () => {
    it('will update data at top object level', () => {
      const r = setValueAtPath(clone, 'member', 'Dan Jones');
      expect(r.member).toBe('Dan Jones');
    });
    it('will update data at second object level', () => {
      const r = setValueAtPath(clone, 'member.firstName', 'Anna');
      expect(r.member.firstName).toBe('Anna');
    });
    it('will update data at some deep object', () => {
      const r = setValueAtPath(clone, 'event.secondlevel.thirdlevel.data', 99);
      expect(r.event.secondlevel.thirdlevel.data).toBe(99);
    });
    it('will set an object', () => {
      const r = setValueAtPath(clone, 'data', { count: 3, name: 'Jenni' });
      expect(r.data.count).toBe(3);
      expect(r.data.name).toBe('Jenni');
    });
  });

  describe(`handle paths which don't exist`, () => {
    it(`will create a single level property if it doesn't exist`, () => {
      const r = setValueAtPath(clone, 'member.hatSize', 12);
      expect(r.member.hatSize).toBe(12);
    });
    it(`will create a deep level property if it doesn't exist`, () => {
      const r = setValueAtPath(clone, 'event.stats.days', 4);
      expect(r.event.stats.days).toBe(4);
    });
  });

  describe(`don't mutate internal props`, () => {
    it(`will not insert value __proto__`, () => {
      const r = setValueAtPath(clone, 'member.firstName', '__proto__');
      expect(r.member.firstName).not.toBe('__proto__');
      expect(r.member.firstName).toBe('Sally');
    });
    it(`will not insert value constructor`, () => {
      const r = setValueAtPath(clone, 'member.lastName', 'constructor');
      expect(r.member.lastName).not.toBe('constructor');
      expect(r.member.lastName).toBe('Member');
    });
  });
});
