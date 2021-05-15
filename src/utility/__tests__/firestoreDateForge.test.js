import firestoreDateForge from '../firestoreDateForge';

describe('firestoreDateForge tests', () => {
  describe('dateForge tests', () => {
    describe('dateForge receives an unknown value', () => {
      it('throws on a non-date-parsable string', () => {
        expect(() => {
          const result = firestoreDateForge.dateForge('not a date');
        }).toThrow(
          'Date value, not a date, is not a parsible or convertable date',
        );
      });
      it('throws on an unknown object', () => {
        expect(() => {
          const result = firestoreDateForge.dateForge({});
        }).toThrow(
          'Date value, [object Object], is not a parsible or convertable date',
        );
      });
      it('throws on a valid formated invalid date value', () => {
        const testdate = '2020-12-04T24:54:07.747Z';
        expect(() => {
          const result = firestoreDateForge.dateForge(testdate);
        }).toThrow(
          'Date value, 2020-12-04T24:54:07.747Z, is not a parsible or convertable date',
        );
      });
      it('throws on empty string', () => {
        expect(() => {
          const result = firestoreDateForge.dateForge('');
        }).toThrow('Date value, , is not a parsible or convertable date');
      });
    });

    describe('dateforge receives null', () => {
      it('null value returned as null', () => {
        expect(firestoreDateForge.dateForge(null)).toBe(null);
      });
    });

    describe('dateForge receive Date type', () => {
      const testDate = new Date();
      const compareDate = new Date(testDate);
      const result = firestoreDateForge.dateForge(testDate);
      it('Result will be an inststanceof Date', () => {
        expect(result).toBeInstanceOf(Date);
      });
      it('Result will return the same date value if a date', () => {
        expect(result.getTime()).toBe(compareDate.getTime());
      });
    });

    describe('dateForge receives Timestamp type', () => {
      const datestring = '2020-12-02T20:50:59.043Z';
      const mockFsTimestamp = {
        toDate: () => {
          return new Date(datestring);
        },
      };
      const result = firestoreDateForge.dateForge(mockFsTimestamp);
      it('Result will be an instanceof Date', () => {
        expect(result).toBeInstanceOf(Date);
      });
      it('Result will return the same date value as datestring', () => {
        expect(result.getTime()).toBe(new Date(datestring).getTime());
      });
    });

    describe('dateForge receives ISO date string', () => {
      const isodatestring = '2020-12-02T20:33:59.111Z';
      const result = firestoreDateForge.dateForge(isodatestring);
      it('Result will be an instanceof Date', () => {
        expect(result).toBeInstanceOf(Date);
      });
      it('Result will return the same date value as datestring', () => {
        expect(result.getTime()).toBe(new Date(isodatestring).getTime());
      });
    });
  });

  describe('entityDateForge tests', () => {
    const { entityDateForge } = firestoreDateForge;
    const fields = [
      'createdAt',
      'startTime',
      'event.startDate',
      'event.endDate',
      'event.not.a.path',
      'event.nothinghere',
    ];
    let mockEntity;
    let mockEntityCopy;
    beforeEach(() => {
      mockEntity = {
        name: 'Our testing product',
        description: 'a product object used for testing',
        type: 'TICKET',
        createdAt: '2020-11-20T15:03:35.219Z',
        createdBy: 'auth0|0',
        lastUpdatedAt: '2020-11-20T15:03:35.219Z',
        lastUpdatedBy: 'auth0|01',
        startDate: '2021-02-26T01:19:27.579Z',
        endDate: '2021-02-26T01:19:27.579Z',
        event: {
          endDate: '2021-03-13T21:40:40.431Z',
          name: 'THAT Conference',
          startDate: '2021-03-12T21:40:40.431Z',
        },
      };
      mockEntityCopy = JSON.parse(JSON.stringify(mockEntity));
    });

    afterEach(() => {
      mockEntity = null;
      mockEntityCopy = null;
    });

    //jest.mock('dateForge');
    describe('entityDateForge receives incorrect values', () => {
      it('Will throw if not provided an array', () => {
        expect(() => {
          const forge = entityDateForge({ fields: 'myfields' });
          const result = forge({});
        }).toThrow();
      });
      it(`will not add field if it doesn't exist in entity`, () => {
        const forge = entityDateForge({ fields: ['foobar'] });
        const result = forge({});
        expect(Object.keys(result)).not.toContain('foobar');
        const forge2 = entityDateForge({ fields });
        const result2 = forge2(mockEntity);
        expect(Object.keys(result2).length).toBe(
          Object.keys(mockEntityCopy).length,
        );
      });
      it(`Will throw on invalid date string`, () => {
        expect(() => {
          const forge = entityDateForge({ fields: ['name'] });
          const result = forge(mockEntity);
        }).toThrow();
      });
    });

    describe('entityDateForge receives proper values', () => {
      it('Will not affect fields not in array list', () => {
        const forge = entityDateForge({ fields });
        const result = forge(mockEntity);
        expect(result.lastUpdatedAt).toBe(mockEntityCopy.lastUpdatedAt);
        expect(result.createdBy).toBe(mockEntityCopy.createdBy);
        expect(result.lastUpdatedBy).toBe(mockEntityCopy.lastUpdatedBy);
        expect(result.type).toBe(mockEntityCopy.type);
        expect(result.description).toBe(mockEntityCopy.description);
        expect(result.event.name).toBe(mockEntityCopy.event.name);
      });
      it('Forged fields will be an instanceof Date', () => {
        const forge = entityDateForge({ fields });
        const result = forge(mockEntity);
        expect(result.createdAt).toBeInstanceOf(Date);
      });
      it('Forged fields will be expected date value', () => {
        const forge = entityDateForge({ fields });
        const result = forge(mockEntity);
        const compare = new Date(mockEntityCopy.createdAt).getTime();
        expect(result.createdAt.getTime()).toBe(compare);
      });
    });

    describe('entity specific test', () => {
      it('will successfully parse events dates', () => {
        const eventDateForge = firestoreDateForge.events;
        const result = eventDateForge(mockEntity);
        expect(result.startDate).toBeInstanceOf(Date);
        expect(result.endDate).toBeInstanceOf(Date);
        expect(typeof result.createdAt).toBe('string');
        expect(result.createdAt).toBe(mockEntityCopy.createdAt);
      });
    });

    describe('entityDateForge deep path tests', () => {
      it('will succesfully parse dates deep in object', () => {
        const forge = entityDateForge({ fields });
        const result = forge(mockEntity);
        expect(result.event.endDate).toBeInstanceOf(Date);
        expect(result.event.endDate.getTime()).toBe(
          new Date(mockEntityCopy.event.endDate).getTime(),
        );
        expect(result.event.startDate).toBeInstanceOf(Date);
        expect(result.event.startDate.getTime()).toBe(
          new Date(mockEntityCopy.event.startDate).getTime(),
        );
      });
    });
  });
});
