// Sign and validate request payloads
// SHA256 (256 bits)
import crypto from 'crypto';
import debug from 'debug';

const dlog = debug('that:api:signReqest');

function requestSignature({ signingKey, ttl = 30000 }) {
  const MAX_TTL = 300000;
  const MIN_TTL = 30000;
  if (!signingKey) {
    throw new Error('Request Signing Key value is required to sign requests');
  }
  if (signingKey?.length < 20) {
    throw new Error('Signing key must be at least 20 characters in length');
  }
  if (ttl > MAX_TTL) {
    throw new Error(
      `Signing request ttl must be ${MAX_TTL / 1000} seconds or less`,
    );
  }
  if (ttl < MIN_TTL) {
    throw new Error(
      `Signing request ttl must be at least ${MIN_TTL / 1000} seconds`,
    );
  }
  dlog('signingKey length: %d, ttl: %d', signingKey?.length, ttl);

  function signRequest(payload) {
    dlog('sign payload: %o', payload);
    const validTo = new Date().getTime() + ttl;
    const data = `${validTo}.${JSON.stringify(payload)}`;
    const hash = crypto
      .createHmac('sha256', signingKey)
      .update(data, 'utf-8')
      .digest('hex');

    const output = {
      isOk: false,
      thatSig: null,
      message: '',
    };

    if (hash?.length < 64) {
      output.message = 'failed to create signature (result too small)';
      return output;
    }

    const thatSig = `t=${validTo},v1=${hash}`;

    output.isOk = true;
    output.thatSig = thatSig;
    output.message = 'signature successful';

    return output;
  }

  function verifyRequest({ thatSig, payload }) {
    dlog('verify signature: %o', thatSig);
    if (!thatSig) throw new Error('thatSig is a required parameter');
    if (!payload) throw new Error('payload is a required parameter');
    const now = new Date().getTime();
    const output = {
      isValid: false,
      message: 'Invalid Signature.',
    };
    if (!thatSig?.includes('t')) {
      output.message = 'invalid signature presented. (1)';
      return output;
    }
    if (!thatSig?.includes('v1')) {
      output.message = 'invalid signature presented. (2)';
      return output;
    }
    const { t, sig } = thatSig.split(',').reduce(
      (acc, cur) => {
        const [key, value] = cur.split('=');

        if (key === 't') {
          acc.t = value;
        }
        if (key === 'v1') {
          acc.sig = value;
        }
        return acc;
      },
      {
        t: '',
        sig: '',
      },
    );

    if (!t || !sig) {
      output.message = 'invalid signature presented. (3)';
      return output;
    }
    const tInt = parseInt(t, 10);
    if (Number.isNaN(tInt)) {
      output.message = 'invalide Signature presented. (4)';
      return output;
    }
    if (now > t || t > now + MAX_TTL) {
      output.message = 'invalid signature. expired. (5)';
      return output;
    }

    const data = `${t}.${JSON.stringify(payload)}`;
    const calcSignature = crypto
      .createHmac('sha256', signingKey)
      .update(data, 'utf-8')
      .digest('hex');

    if (calcSignature === sig) {
      output.isValid = true;
      output.message = `valid signature`;
    }

    return output;
  }

  return { signRequest, verifyRequest };
}

export default requestSignature;
