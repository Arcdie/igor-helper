import winston, { format, addColors, transports } from 'winston';

const { Console } = transports;
const { combine, colorize, label, timestamp, printf } = format;

const createConsoleTransport = () => {
  const consoleFormat = format.combine(
    colorize({ all: true }),
    label({ label: '[LOGGER]' }),
    timestamp({ format: 'YY-MM-DD HH:mm:ss.SSS' }),
    printf(
      (info) =>
        `${info.timestamp} ${info.level} : ${info.message}`
    )
  );

  addColors({
    info: 'bold blue',
    warn: 'italic yellow',
    error: 'bold red',
    debug: 'green',
  });

  return new Console({ format: combine(consoleFormat) });
};

winston.configure({
  transports: [createConsoleTransport()],
});

export default winston;
