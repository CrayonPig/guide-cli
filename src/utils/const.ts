import pkg from '../../package.json';

const LOWEST_NODE_VERSION = '12.0.0';
const PKG_NAME = Object.keys(pkg.bin)[0];
const NPM_PKG_NAME = pkg.name;
const PKG_VERSION = pkg.version;
const DEFAULT_CLI_HOME = `.${PKG_NAME}`;

export {
  LOWEST_NODE_VERSION,
  DEFAULT_CLI_HOME,
  PKG_NAME,
  PKG_VERSION,
  NPM_PKG_NAME
};
