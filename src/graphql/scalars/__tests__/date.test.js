import dateScalar from '../date';

const invalidDates = [
  // General
  'Invalid date',
  // Datetime with hours
  // '2016-02-01T00Z',
  // Datetime with hours and minutes
  // '2016-02-01T00:00Z',
  // Datetime with hours, minutes and seconds
  '2016-02-01T000059Z',
  // Datetime with hours, minutes, seconds and fractional seconds
  '2016-02-01T00:00:00.Z',
  // Datetime with hours, minutes, seconds, fractional seconds and timezone.
  // '2015-02-24T00:00:00.000+0100',
];

const validDates = [
  // Datetime with hours, minutes and seconds
  ['2016-02-01T00:00:15Z', new Date(Date.UTC(2016, 1, 1, 0, 0, 15))],
  ['2016-02-01T00:00:00-11:00', new Date(Date.UTC(2016, 1, 1, 11))],
  ['2017-01-07T11:25:00+01:00', new Date(Date.UTC(2017, 0, 7, 10, 25))],
  ['2017-01-07T00:00:00+01:20', new Date(Date.UTC(2017, 0, 6, 22, 40))],
  // Datetime with hours, minutes, seconds and fractional seconds
  ['2016-02-01T00:00:00.1Z', new Date(Date.UTC(2016, 1, 1, 0, 0, 0, 100))],
  ['2016-02-01T00:00:00.000Z', new Date(Date.UTC(2016, 1, 1, 0, 0, 0, 0))],
  ['2016-02-01T00:00:00.990Z', new Date(Date.UTC(2016, 1, 1, 0, 0, 0, 990))],
  ['2016-02-01T00:00:00.23498Z', new Date(Date.UTC(2016, 1, 1, 0, 0, 0, 234))],
  [
    '2017-01-07T11:25:00.450+01:00',
    new Date(Date.UTC(2017, 0, 7, 10, 25, 0, 450)),
  ],
  ['2016-02-01t00:00:00.000z', new Date(Date.UTC(2016, 1, 1, 0, 0, 0, 0))],
];

describe('Date scalar tests for validating datatime', () => {
  describe('thow on invalid dates', () => {
    invalidDates.forEach(dateString => {
      it(`throws an error when parsing invalid date-string ${dateString}`, () => {
        expect(() => dateScalar.Date.parseValue(dateString)).toThrow();
      });
    });

    it(`throws on an object value (non-string)`, () => {
      expect(() => dateScalar.Date.parseValue({ k: '2021' })).toThrow(
        'Value is not string',
      );
    });
    it(`throws on a number value (non-string)`, () => {
      expect(() => dateScalar.Date.parseValue(2021)).toThrow(
        'Value is not string',
      );
    });
  });

  describe('Serialize dates with invalid values', () => {
    it('serializes empty string', () => {
      expect(() => dateScalar.Date.serialize('')).toThrow(
        'Value is not Date or Moment Object',
      );
    });
    it('serializes null', () => {
      expect(() => dateScalar.Date.serialize(null)).toThrow(
        'Value is not Date or Moment Object',
      );
    });
  });
});
