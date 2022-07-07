import crypto from 'crypto';
import requestSignature from '../requestSignature';

describe(`Request Signature tests`, () => {
  function getTandV1(theSig) {
    return theSig.split(',').reduce(
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
  }

  describe(`instantiate function tests`, () => {
    it('throws when key not provided during creation', () => {
      expect(() => {
        const result = requestSignature();
      }).toThrow(
        `Cannot destructure property 'signingKey' of 'undefined' as it is undefined.`,
      );
      expect(() => {
        const result = requestSignature({});
      }).toThrow(`Request Signing Key value is required to sign requests`);
      expect(() => {
        const result = requestSignature({ signingkey: '' });
      }).toThrow(`Request Signing Key value is required to sign requests`);
    });

    it('throws if key is too short', () => {
      expect(() => {
        const result = requestSignature({ signingKey: '1234' });
      }).toThrow(`Signing key must be at least 20 characters in length`);
      expect(() => {
        const signingKey = '1234567890123456789';
        const result = requestSignature({ signingKey });
      }).toThrow(`Signing key must be at least 20 characters in length`);
      // minimum size
      expect(() => {
        const signingKey = '12345678901234567890';
        const result = requestSignature({ signingKey });
      }).not.toThrow(`Signing key must be at least 20 characters in length`);
    });
    it('ttl parameter must be 5 min or less', () => {
      expect(() => {
        const signingKey = '12345678901234567890';
        requestSignature({ signingKey, ttl: 300001 });
      }).toThrow('Signing request ttl must be 300 seconds or less');
    });
    it('ttl parameter must greater than 30 seconds', () => {
      expect(() => {
        const signingKey = '12345678901234567890';
        requestSignature({ signingKey, ttl: 29999 });
      }).toThrow('Signing request ttl must be at least 30 seconds');
    });
  });

  describe(`signRequest tests`, () => {
    let test_key;
    let payload;
    let reqSig;
    let signValue;
    let t;
    let sig;
    beforeEach(() => {
      test_key = 'tEst_hVmYq3t6w9z$C&F)J@NcRfTjWnZ';
      payload = { value: 'Some not realistic payload text' };
      reqSig = requestSignature({ signingKey: test_key });
      signValue = reqSig.signRequest(payload);
      const { thatSig } = signValue;
      ({ t, sig } = getTandV1(thatSig));
    });

    afterEach(() => {
      reqSig = null;
      signValue = null;
      t = null;
      sig = null;
    });
    it('responds not okay with message on no payload', () => {
      const r = reqSig.signRequest();
      expect(r.isOk).toBe(false);
      expect((r.message = 'no payload provided'));
    });
    it('responds as ok on successful signing', () => {
      const { isOk } = signValue;
      expect(isOk).toBe(true);
    });
    it('THAT Signatures contain t and v1 values', () => {
      const { thatSig } = signValue;
      expect(thatSig).toContain('t=');
      expect(thatSig).toContain('v1=');
    });
    it('t is in the future', () => {
      const tt = parseInt(t);
      const now = new Date().getTime();
      expect(tt).toBeGreaterThan(now);
    });
    it('v1 is at least 64 characters', () => {
      expect(sig.length).toBeGreaterThanOrEqual(64);
    });
  });

  describe(`verifyRequest tests`, () => {
    let test_key;
    let payload;
    let reqSig;
    let testSignature;
    beforeEach(() => {
      test_key = 'tEst_hVmYq3t6w9z$C&F)J@NcRfTjWnZ';
      payload = { value: 'Some not realistic payload text' };
      reqSig = requestSignature({ signingKey: test_key });
      testSignature =
        't=1657050844008,v1=2bbbffc1049e63651bdba876a8e4ed6f79f7930d443ad39ccae2caa6e4cc2083';
    });

    it('throws when thatSig is not provided', () => {
      expect(() => {
        reqSig.verifyRequest({});
      }).toThrow();
      expect(() => {
        reqSig.verifyRequest({ payload: { hi: 'payload' } });
      }).toThrow('thatSig is a required parameter');
    });
    it('throws when payload is not provided', () => {
      expect(() => {
        reqSig.verifyRequest({ thatSig: '123' });
      }).toThrow('payload is a required parameter');
    });
    it('returns invalid if signature is missing t', () => {
      const thatSig = 'v1=abc';
      const payload = '{pl:1}';
      const result = reqSig.verifyRequest({ thatSig, payload });
      expect(result?.isValid).toBe(false);
      expect(result?.message).toBe('invalid signature presented. (1)');
    });
    it('returns invalid if signature is missing v1', () => {
      const thatSig = 't=abc';
      const payload = '{pl:1}';
      const result = reqSig.verifyRequest({ thatSig, payload });
      expect(result?.isValid).toBe(false);
      expect(result?.message).toBe('invalid signature presented. (2)');
    });
    it('returns invalid if t is empty', () => {
      const thatSig = 't=,v1=123abc';
      const payload = '{pl:1}';
      const result = reqSig.verifyRequest({ thatSig, payload });
      expect(result?.isValid).toBe(false);
      expect(result?.message).toBe('invalid signature presented. (3)');
    });
    it('returns invalid if v1 is empty', () => {
      const thatSig = 't=123abc,v1=';
      const payload = '{pl:1}';
      const result = reqSig.verifyRequest({ thatSig, payload });
      expect(result?.isValid).toBe(false);
      expect(result?.message).toBe('invalid signature presented. (3)');
    });
    it('returns invalid if t is NaN', () => {
      const thatSig = 't=d123abc,v1=nothingofvalue';
      const payload = '{pl:1}';
      const result = reqSig.verifyRequest({ thatSig, payload });
      expect(result?.isValid).toBe(false);
      expect(result?.message).toBe('invalide Signature presented. (4)');
    });
    it('returns invalid, expired, if t is less than now', () => {
      const thatSig = 't=1583020800000,v1=nothingofvalue';
      const payload = '{pl:1}';
      const result = reqSig.verifyRequest({ thatSig, payload });
      expect(result?.isValid).toBe(false);
      expect(result?.message).toBe('invalid signature. expired. (5)');
    });
    it('returns invalid, expired, if t is too far in the future', () => {
      const nowish = new Date().getTime() + 500000;
      const thatSig = `t=${nowish},v1=nothingofvalue`;
      const payload = '{pl:1}';
      const result = reqSig.verifyRequest({ thatSig, payload });
      expect(result?.isValid).toBe(false);
      expect(result?.message).toBe('invalid signature. expired. (5)');
    });
  });

  describe('validate sigRequest function', () => {
    const ourTestingSecret = 'bPeShVmYp3s6v9y$B&E)H@McQfTjWnZr';
    const payload = {
      id: 1,
      name: 'THAT Conference',
    };
    const nowms = new Date().getTime();
    it(`generates the proper request signature`, () => {
      const reqSig = requestSignature({ signingKey: ourTestingSecret });
      const { thatSig: thatSignature } = reqSig.signRequest(payload);
      const { t, sig } = getTandV1(thatSignature);
      const data = `${t}.${JSON.stringify(payload)}`;
      const expectSig = crypto
        .createHmac('sha256', ourTestingSecret)
        .update(data, 'utf-8')
        .digest('hex');
      expect(parseInt(t, 10)).toBeGreaterThan(nowms);
      expect(sig).toBe(expectSig);
    });
  });

  describe('validate verify request function', () => {
    const ourTestingSecret = 'u7x!A%D*G-KaPdSgVkYp3s6v8y/B?E(H';
    const newT = new Date().getTime() + 30000;
    const payload = {
      id: 1,
      name: 'THAT Conference',
    };
    const data = `${newT}.${JSON.stringify(payload)}`;
    const knownHash = crypto
      .createHmac('sha256', ourTestingSecret)
      .update(data, 'utf-8')
      .digest('hex');
    const knownGoodSig = `t=${newT},v1=${knownHash}`;
    it('validate known good hash', () => {
      const reqSig = requestSignature({ signingKey: ourTestingSecret });
      const result = reqSig.verifyRequest({ thatSig: knownGoodSig, payload });
      expect(result?.isValid).toBe(true);
      expect(result?.message).toBe('valid signature');
    });
  });
});
