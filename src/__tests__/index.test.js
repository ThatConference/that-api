import 'dotenv/config';
import { security } from '../index';

describe('namespace tests', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };

    process.env.AUTH0_JWKS_URI = 'http://foo.bar';
    process.env.AUTH0_AUDIENCE = 'http://foo.bar';
    process.env.AUTH0_ISSUER = 'http://foo.bar';
  });

  describe('can import root', () => {
    it('can import security namespace', () => {
      expect(security).toBeDefined();
    });
  });

  describe('can import children', () => {
    it('can create jwt', () => {
      const jwt = security.jwt();
      expect(jwt).toBeDefined();
    });
  });
});
