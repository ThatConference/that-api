import debug from 'debug';

const dlog = debug('that:api:utility');

export default function getValueAtPath(obj, path) {
  dlog('getValueAtPath (%s)', path);
  let data = obj;
  const pathParts = path.split('.');
  for (let i = 0; i < pathParts.length; i += 1) {
    data = data[pathParts[i]];
    if (!data) break;
  }
  return data;
}
