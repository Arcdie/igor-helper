const makeRequest = async ({
  url, method, query, body, settings,
}) => {
  if (!url) {
    alert('No url');
    return false;
  }

  if (!method) {
    alert('No method');
    return false;
  }

  const objRequest = {
    method,
  };

  if (method !== 'GET') {
    objRequest.headers = {
      'Content-Type': 'application/json',
    };
  }

  if (body && Object.keys(body).length > 0) {
    objRequest.body = JSON.stringify(body);
  }

  if (query && Object.keys(query).length > 0) {
    url += '?';

    Object.keys(query).forEach(key => {
      url += `${key}=${query[key]}&`;
    });

    url = url.substring(0, url.length - 1);
  }

  if (settings && Object.keys(settings).length > 0) {
    Object.keys(settings).forEach(key => {
      objRequest[key] = settings[key];
    });
  }

  const response = await fetch(url, objRequest);
  const result = await response.json();
  return result;
};