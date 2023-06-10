const getUnix = targetDate =>
  parseInt((targetDate ? new Date(targetDate) : new Date()).getTime() / 1000, 10);

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

const sendRequest = async (method, url, data) => {
  const settings = {
    url,
    method,
  };

  if (method === 'GET' && data) {
    settings.query = data;
  } else if (['POST', 'PUT'].includes(method) && data) {
    settings.body = data;
  }

  const response = await makeRequest(settings);

  if (!response) {
    addAlert('error', `Не можу виконати запит ${url}`);
    return false;
  }

  if (!response.status) {
    addAlert('error', response.message || `Не можу виконати запит ${url}`);
    return false;
  }

  return response.result;
};

const sendGetRequest = (url, query = {}) => sendRequest('GET', url, query);
const sendPutRequest = (url, body) => sendRequest('PUT', url, body);
const sendPostRequest = (url, body) => sendRequest('POST', url, body);
