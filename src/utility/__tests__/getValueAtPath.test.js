import getValueAtPath from '../getValueAtPath';

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

describe('getValueAtPath tests', () => {
  let clone = {};
  beforeEach(() => (clone = JSON.parse(JSON.stringify(baseObject))));

  afterEach(() => (clone = {}));

  describe('paths resolved correctly', () => {
    it('will find event name', () => {
      const result = getValueAtPath(clone, 'event.name');
      expect(result).toBe(baseObject.event.name);
    });
    it('will find member email', () => {
      const result = getValueAtPath(clone, 'member.email');
      expect(result).toBe(baseObject.member.email);
    });
    it('will find a deep path', () => {
      const result = getValueAtPath(
        clone,
        'event.secondlevel.thirdlevel.fourthlevel.data',
      );
      expect(result).toBe(
        baseObject.event.secondlevel.thirdlevel.fourthlevel.data,
      );
    });
    it('will find value at top level', () => {
      const result = getValueAtPath(clone, 'data');
      expect(result).toBe(baseObject.data);
    });
  });

  describe('incorrect paths will be handled', () => {
    it('will return undefined for unknown first level', () => {
      const result = getValueAtPath(clone, 'this.doesnt.exist');
      expect(result).toBe(undefined);
    });
    it('will return undefined for unknown later level', () => {
      const result = getValueAtPath(clone, 'purchasedBy.foo');
      expect(result).toBe(undefined);
    });
    it('will return undefined for an incorrect deep path', () => {
      const result = getValueAtPath(clone, 'member.firstName.foo.bar.data');
      expect(result).toBe(undefined);
    });
  });
});
