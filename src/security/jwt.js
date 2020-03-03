import jsonwebtoken from 'jsonwebtoken';
import debug from 'debug';
import jwksClient from 'jwks-rsa';
import { AuthenticationError } from 'apollo-server';

const dlog = debug('that:api:jwt');

function configMissing(configKey) {
  throw new Error(`missing required .env setting for ${configKey}`);
}

function jwt() {
  const requiredConfig = {
    jwksUri: process.env.AUTH0_JWKS_URI || configMissing('AUTH0_JWKS_URI'),
    audience: process.env.AUTH0_AUDIENCE || configMissing('AUTH0_AUDIENCE'),
    issuer: process.env.AUTH0_ISSUER || configMissing('AUTH0_ISSUER'),
  };

  const client = jwksClient({
    rateLimit: JSON.parse(process.env.JWKS_RATE_LIMIT || true),
    jwksRequestsPerMinute: process.env.JWKS_RPM || 5,
    jwksUri: requiredConfig.jwksUri,
  });

  function verify(bearerToken) {
    return new Promise((resolve, reject) => {
      const options = {
        audience: requiredConfig.audience,
        issuer: requiredConfig.issuer,
        algorithms: ['RS256'],
      };

      dlog('jwt verify called');

      if (!bearerToken) {
        reject(new AuthenticationError('credentials_required'));
      }

      let token;
      const parts = bearerToken.split(' ');

      if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        } else {
          reject(new AuthenticationError('credentials_bad_scheme'));
        }
      } else {
        reject(new AuthenticationError('credentials_bad_format'));
      }

      function getKey(header, callback) {
        client.getSigningKey(header.kid, (err, key) => {
          const signingKey = key.publicKey || key.rsaPublicKey;
          callback(null, signingKey);
        });
      }

      jsonwebtoken.verify(token, getKey, options, (e, t) => {
        dlog('decoded token %o', t);
        if (e) reject(e);

        resolve(t);
      });
    });
  }

  return { verify };
}

export default jwt;
