/* eslint-disable arrow-body-style */
import { manualOrderEvent } from '../index';
import manualOrderJson from './data/manualThatOrderCreated.json';
import manualOrderJson2 from './data/manualThatOrder.json';

describe('Test manual order event object validation', () => {
  it('validates checkoutCompleteEvent.json correctly', () => {
    return manualOrderEvent(manualOrderJson).then(result => {
      expect(result).toBe(true);
    });
  });
  it('will pass without a status property', () => {
    delete manualOrderJson.order.status;
    return manualOrderEvent(manualOrderJson).then(result => {
      expect(result).toBe(true);
    });
  });
  it('throws on wrong isBulkPurchase quantity (> 1)', () => {
    manualOrderJson.order.lineItems[0].quantity = 3;
    return expect(manualOrderEvent(manualOrderJson)).rejects.toThrow(
      'order.lineItems[0].quantity must be less than or equal to 1',
    );
  });
  it('throws when order.event is too short', () => {
    manualOrderJson.order.lineItems[0].quantity = 1;
    manualOrderJson.order.event = 'short_id';
    return expect(manualOrderEvent(manualOrderJson)).rejects.toThrow(
      'order.event must be at least 12 characters',
    );
  });
  it('throws when eventId is too short', () => {
    manualOrderJson.order.lineItems[0].quantity = 1;
    manualOrderJson.order.event = 'eventId_@_12';
    manualOrderJson.eventId = 'short_id';
    return expect(manualOrderEvent(manualOrderJson)).rejects.toThrow(
      'eventId must be at least 12 characters',
    );
  });
  it('throws when order id format is incorrect', () => {
    return expect(manualOrderEvent(manualOrderJson2)).rejects.toThrow(
      'invalid THAT event id',
    );
  });
  it(`throws when livemode doesn't exist`, () => {
    delete manualOrderJson2.livemode;
    return expect(manualOrderEvent(manualOrderJson2)).rejects.toThrow(
      'livemode is a required field',
    );
  });
  it(`throws when type is too short`, () => {
    manualOrderJson2.livemode = false;
    manualOrderJson2.type = 'abcd';
    return expect(manualOrderEvent(manualOrderJson2)).rejects.toThrow(
      'type must be at least 5 characters',
    );
  });
  it(`throws when type is missing`, () => {
    delete manualOrderJson2.type;
    return expect(manualOrderEvent(manualOrderJson2)).rejects.toThrow(
      'type is a required field',
    );
  });
});

// these tests are a bit fragile
