import debug from 'debug';

const dlog = debug('that:api:utility');

export default function setValueAtPath(obj, path, value) {
  dlog('setValueAtPath (%s) (%s)', value, path);
  let data = obj;
  const pathParts = path.split('.');
  if (pathParts.length === 1) {
    data[path] = value;
  } else {
    const setPathLength = pathParts.length - 1;
    let i;
    for (i = 0; i < setPathLength; i += 1) {
      if (data[pathParts[i]] === undefined) {
        data[pathParts[i]] = {};
      }
      data = data[pathParts[i]];
    }
    data[pathParts[i]] = value;
  }

  return obj;
}
