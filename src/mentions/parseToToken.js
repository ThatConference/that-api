/*
 * Parse to token parses mentions from a string returning and array of values.
 * isKeepSymbol: true will retain '@' symbol used to denote the mention
 */
const matchMention = /\B[@＠][a-z0-9_-]+/gi;

export default (text, isKeepSymbol) => {
  let result = [];
  if (text && typeof text === 'string') result = text.match(matchMention) || [];
  if (!isKeepSymbol) {
    result = result.map(r => r.substring(1));
  }
  return result;
};
