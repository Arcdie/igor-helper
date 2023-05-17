import axios from 'axios';

export const getCancelToken = (ms: number) => {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  setTimeout(() => source.cancel(), ms);

  return source.token;
};

export const makeRequest = <T>(method: string, url: string, settings = {}) => axios<T>({
  method,
  url,
  ...settings,
});
