/*
 * Parse to slug parses mentions from string returning an array of
 * slug objects.
 * Mentions not found in slug collection are not returned at all.
 */
import dataSources from '../dataSources';
import parseToToken from './parseToToken';

const slugStore = dataSources.cloudFirestore.slug;

export default async ({ text, firestore, isRetainCase }) => {
  if (typeof text !== 'string') return [];
  const tokens = parseToToken(text);
  let mentions = [...new Set(tokens)];

  if (mentions.length > 10)
    throw new Error(
      `A maximum of 10 mentions can be parsed. total ${mentions.length}`,
    );

  let result = [];
  if (mentions.length > 0) {
    if (!isRetainCase) mentions = mentions.map(m => m.toLowerCase());
    const slugs = await slugStore(firestore).findFromArray(mentions);
    result = slugs.filter(slug => slug && slug.slug);
  }

  return result;
};
