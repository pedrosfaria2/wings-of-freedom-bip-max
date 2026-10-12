const path = require('node:path');
const Module = require('node:module');
const cli = path.dirname(require.resolve('@zeppos/zeus-cli/package.json'));
require('module-alias').addAlias('zeppos-app-utils', path.join(cli, 'private-modules/zeppos-app-utils'));
const original = Module._load;
Module._load = function (name, ...args) {
  const value = original.call(this, name, ...args);
  if (name !== 'parse-gitignore') {
    return value;
  }
  return (...input) => {
    const parsed = value(...input);
    return Array.isArray(parsed) ? parsed : parsed.patterns;
  };
};
require(path.join(cli, 'bin/main.js'));
