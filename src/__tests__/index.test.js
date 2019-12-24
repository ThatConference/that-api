import { security } from '../index';

describe('client import tests', () => {
  it('can import security namespace', () => {
    expect(security).toBeDefined();
  });
});
