import crypto from 'crypto';

export const sleep = (ms: number) => new Promise(resolve => { setTimeout(resolve, ms); });

export const isDefined = <T>(argument: T | null | undefined): argument is T => argument !== null && argument !== undefined;

export const isEmptyObject = <T extends object>(obj: T) => Object.keys(obj).length === 0;

export const getEnv = () => process.env.NODE_ENV || 'development';

export const toUTF8 = (str: string) => Buffer.from(str, 'latin1').toString('utf8');

export const getRadians = (x: number) => x * Math.PI / 180;

export const getUniqueArray = <T>(arr: T[]) => [...new Set(arr)];

export const getUnix = (targetDate?: number) => {
  const time = (targetDate ? new Date(targetDate) : new Date()).getTime();
  return parseInt((time / 1000).toString(), 10);
};

export const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;
export const getRandomString = (limit: number) => crypto.randomBytes(20).toString('hex').substring(0, limit);

export const getQueue = <T>(arr: T[], limiter: number) => {
  const queues = [];
  const lArr = arr.length;

  let targetIndex = 0;
  const numberIterations = Math.ceil(lArr / limiter);

  for (let i = 0; i < numberIterations; i += 1) {
    const newQueue = [];

    let conditionValue = limiter;

    if (i === (numberIterations - 1)) {
      conditionValue = lArr - targetIndex;
    }

    for (let j = 0; j < conditionValue; j += 1) {
      newQueue.push(arr[targetIndex]);
      targetIndex += 1;
    }

    queues.push(newQueue);
  }

  return queues;
};

export const clearObjectByTargetKeys = <B>(requiredFields: string[], body: B) => {
  const clearRequiredFields = requiredFields.map(f => f.replace('?', ''));
  const decomposed = Object.entries(body as any)
    .filter(e => clearRequiredFields.includes(e[0]));
  return Object.fromEntries(decomposed) as B;
};

export const checkBody = <B>(requiredFields: string[], body: B) => {
  const decomposedBody = Object.entries(body as any);

  return requiredFields.filter(key => {
    if (key.includes('?')) return false;

    const elem = decomposedBody.find(e => e[0] === key);
    return (!elem || !elem[1]);
  });
};
