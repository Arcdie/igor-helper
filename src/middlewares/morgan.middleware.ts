import chalk from 'chalk';
import morgan from 'morgan';

export default morgan((tokens, req, res) => [
  chalk.green.bold(tokens.method(req, res)),
  chalk.red.bold(tokens.status(req, res)),
  chalk.white(tokens.url(req, res)),
  chalk.yellow(`${tokens['response-time'](req, res) || 0} ms`),
].join(' '));
