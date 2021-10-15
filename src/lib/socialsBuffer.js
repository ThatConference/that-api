// Buffer.com socials queuing library
import debug from 'debug';
import fetch from 'node-fetch';
import envConfig from '../envConfig';

const dlog = debug('that:api:socialsBuffer');
const socials = {
  TWITTER: '5321c72d5a05ad0b19254e13',
  FACEBOOK: '5347ec78237e9bd960f0bd35',
  LINKEDIN: '59bc1f97a73330820939cc72',
};
const socialsBuffer = () => {
  dlog('socialsBuffer created');
  const bufferToken = envConfig.socialsBuffer.accessToken;
  if (!bufferToken)
    throw new Error('BUFFER_ACCESS_TOKEN environemnt variable not provided');
  const { baseUrl } = envConfig.socialsBuffer;
  const headers = {
    'User-Agent': 'that-api socialsBuffer',
    Authorization: `Bearer ${bufferToken}`,
  };

  async function createPost({
    postText,
    socialsArray,
    link,
    scheduleAt,
    shortenLinks = false,
  }) {
    dlog('createPost');
    if (!Array.isArray(socialsArray))
      throw new Error(
        `socialsArray must be an array of enum socials to post to`,
      );
    socialsArray.forEach(sa => {
      if (!Object.values(socials).includes(sa))
        throw new Error(`Social value ${sa} is unknown.`);
    });
    const formParams = new URLSearchParams();
    formParams.append('shorten', shortenLinks);
    formParams.append('text', `${postText} ${link}`);
    socialsArray.forEach(sa => formParams.append('profile_ids[]', sa));
    formParams.append('media[link]', link);
    formParams.append('scheduled_at', new Date(scheduleAt).toISOString());
    const options = {
      headers: { ...headers },
      method: 'POST',
      body: formParams,
    };

    const res = await fetch(`${baseUrl}/updates/create.json`, options);
    const response = {
      isOk: res.ok,
      status: res.status,
      statusText: res.statusText,
    };
    if (res.ok) {
      response.data = await res.json();
    } else {
      response.data = {};
    }

    return response;
  }

  async function getPendingBySocial({ socialBufferId }) {
    dlog('getPendingBySocial called on social: %d', socialBufferId);
    if (!socialBufferId)
      throw new Error(
        'socialBufferId is a required parameter. use socialsBuffer value',
      );
    const options = {
      headers: { ...headers },
      method: 'GET',
    };

    const res = await fetch(
      `${baseUrl}/profiles/${socialBufferId}/updates/pending.json`,
      options,
    );
    const response = {
      isOk: res.ok,
      status: res.status,
      statusText: res.statusText,
    };
    if (res.ok) {
      response.data = await res.json();
    } else {
      response.data = {};
    }

    return response;
  }

  return {
    createPost,
    getPendingBySocial,
  };
};

// export socialsBuffer;

export default { socialsBuffer, socials };
