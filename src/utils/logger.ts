// ============================================
// LOGGER
// ============================================
// Logger centralisé : debug/info ne s'affichent qu'en développement,
// warn/error passent toujours par la console.

type LogArgs = unknown[];

const devLog = (...args: LogArgs): void => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

export const logger = {
  debug: (...args: LogArgs): void => devLog(...args),
  info: (...args: LogArgs): void => devLog(...args),
  warn: (...args: LogArgs): void => console.warn(...args),
  error: (...args: LogArgs): void => console.error(...args),
};

export default logger;
