import mentions from '../index';

describe('mentions tests', () => {
  describe('parsing mentions from string', () => {
    it('will not parse email addresses', () => {
      const text = 'email me at brett@thatconference.com for more info.';
      const tokens = mentions.parseToToken(text);
      expect(tokens.length).toBe(0);
    });

    it('will find 3 raw tokens', () => {
      const text = 'This @string contains 3 @tokens within @it';
      const tokens = mentions.parseToToken(text);
      expect(tokens.length).toBe(3);
      expect(tokens).toContain('string');
      expect(tokens.includes('@string')).toBeFalsy();
      expect(tokens).toContain('tokens');
      expect(tokens).toContain('it');
    });

    it('will find 2 tokens with symbols included', () => {
      const text = 'Only @two tokens in @this string';
      const tokens = mentions.parseToToken(text, true);
      expect(tokens.length).toBe(2);
      expect(tokens).toContain('@two');
      expect(tokens.includes('two')).toBeFalsy();
      expect(tokens).toContain('@this');
    });

    it('will match on "other" at type', () => {
      const text = 'this is the ＠other at type we support.';
      const tokens = mentions.parseToToken(text);
      expect(tokens.length).toBe(1);
      expect(tokens).toContain('other');
    });
  });
});
