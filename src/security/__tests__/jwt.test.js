import jwt from '../jwt';

describe('jwt creation tests', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  it('can create jwt', () => {
    process.env.AUTH0_JWKS_URI = 'http://foo.bar';
    process.env.AUTH0_AUDIENCE = 'http://foo.bar';
    process.env.AUTH0_ISSUER = 'http://foo.bar';
    const x = jwt();

    expect(x).toBeDefined();
  });

  it('jwt creation will fail when JWKS_URI is missing', () => {
    process.env.AUTH0_AUDIENCE = 'http://foo.bar';
    process.env.AUTH0_ISSUER = 'http://foo.bar';

    expect(() => {
      jwt();
    }).toThrow();
  });

  it('jwt creation will fail when JWKS_AUDIENCE is missing', () => {
    process.env.AUTH0_JWKS_URI = 'http://foo.bar';
    process.env.AUTH0_ISSUER = 'http://foo.bar';

    expect(() => {
      jwt();
    }).toThrow();
  });

  it('jwt creation will fail when AUTH0_ISSUER is missing', () => {
    process.env.AUTH0_JWKS_URI = 'http://foo.bar';
    process.env.AUTH0_AUDIENCE = 'http://foo.bar';

    expect(() => {
      jwt();
    }).toThrow();
  });
});
