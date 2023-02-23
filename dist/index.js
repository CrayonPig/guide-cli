#!/usr/bin/env node
'use strict';

var require$$0 = require('path');
var require$$1$1 = require('url');
var require$$1 = require('module');
var require$$0$1 = require('fs');
var require$$0$2 = require('util');
var require$$2 = require('events');
var require$$0$3 = require('stream');
var require$$4 = require('buffer');
var require$$13 = require('string_decoder');
var require$$0$4 = require('os');
var require$$0$5 = require('assert');

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var resolveCwdExports = {};
var resolveCwd$1 = {
  get exports(){ return resolveCwdExports; },
  set exports(v){ resolveCwdExports = v; },
};

var resolveFromExports = {};
var resolveFrom$2 = {
  get exports(){ return resolveFromExports; },
  set exports(v){ resolveFromExports = v; },
};

const path$3 = require$$0;
const Module = require$$1;
const fs$2 = require$$0$1;
const resolveFrom$1 = (fromDirectory, moduleId, silent) => {
  if (typeof fromDirectory !== 'string') {
    throw new TypeError(`Expected \`fromDir\` to be of type \`string\`, got \`${typeof fromDirectory}\``);
  }
  if (typeof moduleId !== 'string') {
    throw new TypeError(`Expected \`moduleId\` to be of type \`string\`, got \`${typeof moduleId}\``);
  }
  try {
    fromDirectory = fs$2.realpathSync(fromDirectory);
  } catch (error) {
    if (error.code === 'ENOENT') {
      fromDirectory = path$3.resolve(fromDirectory);
    } else if (silent) {
      return;
    } else {
      throw error;
    }
  }
  const fromFile = path$3.join(fromDirectory, 'noop.js');
  const resolveFileName = () => Module._resolveFilename(moduleId, {
    id: fromFile,
    filename: fromFile,
    paths: Module._nodeModulePaths(fromDirectory)
  });
  if (silent) {
    try {
      return resolveFileName();
    } catch (error) {
      return;
    }
  }
  return resolveFileName();
};
resolveFrom$2.exports = (fromDirectory, moduleId) => resolveFrom$1(fromDirectory, moduleId);
resolveFromExports.silent = (fromDirectory, moduleId) => resolveFrom$1(fromDirectory, moduleId, true);

const resolveFrom = resolveFromExports;
resolveCwd$1.exports = moduleId => resolveFrom(process.cwd(), moduleId);
resolveCwdExports.silent = moduleId => resolveFrom.silent(process.cwd(), moduleId);

var pkgDirExports = {};
var pkgDir$2 = {
  get exports(){ return pkgDirExports; },
  set exports(v){ pkgDirExports = v; },
};

var findUpExports = {};
var findUp$1 = {
  get exports(){ return findUpExports; },
  set exports(v){ findUpExports = v; },
};

var locatePathExports = {};
var locatePath = {
  get exports(){ return locatePathExports; },
  set exports(v){ locatePathExports = v; },
};

var pLocateExports = {};
var pLocate$2 = {
  get exports(){ return pLocateExports; },
  set exports(v){ pLocateExports = v; },
};

var pLimitExports = {};
var pLimit$2 = {
  get exports(){ return pLimitExports; },
  set exports(v){ pLimitExports = v; },
};

var pTryExports = {};
var pTry$2 = {
  get exports(){ return pTryExports; },
  set exports(v){ pTryExports = v; },
};

const pTry$1 = (fn, ...arguments_) => new Promise(resolve => {
  resolve(fn(...arguments_));
});
pTry$2.exports = pTry$1;
// TODO: remove this in the next major version
pTryExports.default = pTry$1;

const pTry = pTryExports;
const pLimit$1 = concurrency => {
  if (!((Number.isInteger(concurrency) || concurrency === Infinity) && concurrency > 0)) {
    return Promise.reject(new TypeError('Expected `concurrency` to be a number from 1 and up'));
  }
  const queue = [];
  let activeCount = 0;
  const next = () => {
    activeCount--;
    if (queue.length > 0) {
      queue.shift()();
    }
  };
  const run = (fn, resolve, ...args) => {
    activeCount++;
    const result = pTry(fn, ...args);
    resolve(result);
    result.then(next, next);
  };
  const enqueue = (fn, resolve, ...args) => {
    if (activeCount < concurrency) {
      run(fn, resolve, ...args);
    } else {
      queue.push(run.bind(null, fn, resolve, ...args));
    }
  };
  const generator = (fn, ...args) => new Promise(resolve => enqueue(fn, resolve, ...args));
  Object.defineProperties(generator, {
    activeCount: {
      get: () => activeCount
    },
    pendingCount: {
      get: () => queue.length
    },
    clearQueue: {
      value: () => {
        queue.length = 0;
      }
    }
  });
  return generator;
};
pLimit$2.exports = pLimit$1;
pLimitExports.default = pLimit$1;

const pLimit = pLimitExports;
class EndError extends Error {
  constructor(value) {
    super();
    this.value = value;
  }
}

// The input can also be a promise, so we await it
const testElement = async (element, tester) => tester(await element);

// The input can also be a promise, so we `Promise.all()` them both
const finder = async element => {
  const values = await Promise.all(element);
  if (values[1] === true) {
    throw new EndError(values[0]);
  }
  return false;
};
const pLocate$1 = async (iterable, tester, options) => {
  options = {
    concurrency: Infinity,
    preserveOrder: true,
    ...options
  };
  const limit = pLimit(options.concurrency);

  // Start all the promises concurrently with optional limit
  const items = [...iterable].map(element => [element, limit(testElement, element, tester)]);

  // Check the promises either serially or concurrently
  const checkLimit = pLimit(options.preserveOrder ? 1 : Infinity);
  try {
    await Promise.all(items.map(element => checkLimit(finder, element)));
  } catch (error) {
    if (error instanceof EndError) {
      return error.value;
    }
    throw error;
  }
};
pLocate$2.exports = pLocate$1;
// TODO: Remove this for the next major release
pLocateExports.default = pLocate$1;

const path$2 = require$$0;
const fs$1 = require$$0$1;
const {
  promisify: promisify$1
} = require$$0$2;
const pLocate = pLocateExports;
const fsStat = promisify$1(fs$1.stat);
const fsLStat = promisify$1(fs$1.lstat);
const typeMappings = {
  directory: 'isDirectory',
  file: 'isFile'
};
function checkType({
  type
}) {
  if (type in typeMappings) {
    return;
  }
  throw new Error(`Invalid type specified: ${type}`);
}
const matchType = (type, stat) => type === undefined || stat[typeMappings[type]]();
locatePath.exports = async (paths, options) => {
  options = {
    cwd: process.cwd(),
    type: 'file',
    allowSymlinks: true,
    ...options
  };
  checkType(options);
  const statFn = options.allowSymlinks ? fsStat : fsLStat;
  return pLocate(paths, async path_ => {
    try {
      const stat = await statFn(path$2.resolve(options.cwd, path_));
      return matchType(options.type, stat);
    } catch (_) {
      return false;
    }
  }, options);
};
locatePathExports.sync = (paths, options) => {
  options = {
    cwd: process.cwd(),
    allowSymlinks: true,
    type: 'file',
    ...options
  };
  checkType(options);
  const statFn = options.allowSymlinks ? fs$1.statSync : fs$1.lstatSync;
  for (const path_ of paths) {
    try {
      const stat = statFn(path$2.resolve(options.cwd, path_));
      if (matchType(options.type, stat)) {
        return path_;
      }
    } catch (_) {}
  }
};

var pathExistsExports = {};
var pathExists = {
  get exports(){ return pathExistsExports; },
  set exports(v){ pathExistsExports = v; },
};

const fs = require$$0$1;
const {
  promisify
} = require$$0$2;
const pAccess = promisify(fs.access);
pathExists.exports = async path => {
  try {
    await pAccess(path);
    return true;
  } catch (_) {
    return false;
  }
};
pathExistsExports.sync = path => {
  try {
    fs.accessSync(path);
    return true;
  } catch (_) {
    return false;
  }
};

(function (module) {

  const path = require$$0;
  const locatePath = locatePathExports;
  const pathExists = pathExistsExports;
  const stop = Symbol('findUp.stop');
  module.exports = async (name, options = {}) => {
    let directory = path.resolve(options.cwd || '');
    const {
      root
    } = path.parse(directory);
    const paths = [].concat(name);
    const runMatcher = async locateOptions => {
      if (typeof name !== 'function') {
        return locatePath(paths, locateOptions);
      }
      const foundPath = await name(locateOptions.cwd);
      if (typeof foundPath === 'string') {
        return locatePath([foundPath], locateOptions);
      }
      return foundPath;
    };

    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const foundPath = await runMatcher({
        ...options,
        cwd: directory
      });
      if (foundPath === stop) {
        return;
      }
      if (foundPath) {
        return path.resolve(directory, foundPath);
      }
      if (directory === root) {
        return;
      }
      directory = path.dirname(directory);
    }
  };
  module.exports.sync = (name, options = {}) => {
    let directory = path.resolve(options.cwd || '');
    const {
      root
    } = path.parse(directory);
    const paths = [].concat(name);
    const runMatcher = locateOptions => {
      if (typeof name !== 'function') {
        return locatePath.sync(paths, locateOptions);
      }
      const foundPath = name(locateOptions.cwd);
      if (typeof foundPath === 'string') {
        return locatePath.sync([foundPath], locateOptions);
      }
      return foundPath;
    };

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const foundPath = runMatcher({
        ...options,
        cwd: directory
      });
      if (foundPath === stop) {
        return;
      }
      if (foundPath) {
        return path.resolve(directory, foundPath);
      }
      if (directory === root) {
        return;
      }
      directory = path.dirname(directory);
    }
  };
  module.exports.exists = pathExists;
  module.exports.sync.exists = pathExists.sync;
  module.exports.stop = stop;
})(findUp$1);

const path$1 = require$$0;
const findUp = findUpExports;
const pkgDir$1 = async cwd => {
  const filePath = await findUp('package.json', {
    cwd
  });
  return filePath && path$1.dirname(filePath);
};
pkgDir$2.exports = pkgDir$1;
// TODO: Remove this for the next major release
pkgDirExports.default = pkgDir$1;
pkgDirExports.sync = cwd => {
  const filePath = findUp.sync('package.json', {
    cwd
  });
  return filePath && path$1.dirname(filePath);
};

const path = require$$0;
const {
  fileURLToPath
} = require$$1$1;
const resolveCwd = resolveCwdExports;
const pkgDir = pkgDirExports;
var importLocal = filename => {
  const normalizedFilename = filename.startsWith('file://') ? fileURLToPath(filename) : filename;
  const globalDir = pkgDir.sync(path.dirname(normalizedFilename));
  const relativePath = path.relative(globalDir, normalizedFilename);
  const pkg = require(path.join(globalDir, 'package.json'));
  const localFile = resolveCwd.silent(path.join(pkg.name, relativePath));
  const localNodeModules = path.join(process.cwd(), 'node_modules');
  const filenameInLocalNodeModules = !path.relative(localNodeModules, normalizedFilename).startsWith('..') &&
  // On Windows, if `localNodeModules` and `normalizedFilename` are on different partitions, `path.relative()` returns the value of `normalizedFilename`, resulting in `filenameInLocalNodeModules` incorrectly becoming `true`.
  path.parse(localNodeModules).root === path.parse(normalizedFilename).root;

  // Use `path.relative()` to detect local package installation,
  // because __filename's case is inconsistent on Windows
  // Can use `===` when targeting Node.js 8
  // See https://github.com/nodejs/node/issues/6624
  return !filenameInLocalNodeModules && localFile && path.relative(localFile, normalizedFilename) !== '' && require(localFile);
};

var logExports = {};
var log$1 = {
  get exports(){ return logExports; },
  set exports(v){ logExports = v; },
};

var lib$1 = {};

var trackerGroupExports = {};
var trackerGroup = {
  get exports(){ return trackerGroupExports; },
  set exports(v){ trackerGroupExports = v; },
};

var trackerBaseExports = {};
var trackerBase = {
  get exports(){ return trackerBaseExports; },
  set exports(v){ trackerBaseExports = v; },
};

var EventEmitter = require$$2.EventEmitter;
var util$5 = require$$0$2;
var trackerId = 0;
var TrackerBase$2 = trackerBase.exports = function (name) {
  EventEmitter.call(this);
  this.id = ++trackerId;
  this.name = name;
};
util$5.inherits(TrackerBase$2, EventEmitter);

var trackerExports = {};
var tracker = {
  get exports(){ return trackerExports; },
  set exports(v){ trackerExports = v; },
};

var util$4 = require$$0$2;
var TrackerBase$1 = trackerBaseExports;
var Tracker$2 = tracker.exports = function (name, todo) {
  TrackerBase$1.call(this, name);
  this.workDone = 0;
  this.workTodo = todo || 0;
};
util$4.inherits(Tracker$2, TrackerBase$1);
Tracker$2.prototype.completed = function () {
  return this.workTodo === 0 ? 0 : this.workDone / this.workTodo;
};
Tracker$2.prototype.addWork = function (work) {
  this.workTodo += work;
  this.emit('change', this.name, this.completed(), this);
};
Tracker$2.prototype.completeWork = function (work) {
  this.workDone += work;
  if (this.workDone > this.workTodo) {
    this.workDone = this.workTodo;
  }
  this.emit('change', this.name, this.completed(), this);
};
Tracker$2.prototype.finish = function () {
  this.workTodo = this.workDone = 1;
  this.emit('change', this.name, 1, this);
};

var trackerStreamExports = {};
var trackerStream = {
  get exports(){ return trackerStreamExports; },
  set exports(v){ trackerStreamExports = v; },
};

var oursExports = {};
var ours = {
  get exports(){ return oursExports; },
  set exports(v){ oursExports = v; },
};

var streamExports = {};
var stream$1 = {
  get exports(){ return streamExports; },
  set exports(v){ streamExports = v; },
};

var primordials;
var hasRequiredPrimordials;
function requirePrimordials() {
  if (hasRequiredPrimordials) return primordials;
  hasRequiredPrimordials = 1;

  /*
    This file is a reduced and adapted version of the main lib/internal/per_context/primordials.js file defined at
  	  https://github.com/nodejs/node/blob/master/lib/internal/per_context/primordials.js
  	  Don't try to replace with the original file and keep it up to date with the upstream file.
  */
  primordials = {
    ArrayIsArray(self) {
      return Array.isArray(self);
    },
    ArrayPrototypeIncludes(self, el) {
      return self.includes(el);
    },
    ArrayPrototypeIndexOf(self, el) {
      return self.indexOf(el);
    },
    ArrayPrototypeJoin(self, sep) {
      return self.join(sep);
    },
    ArrayPrototypeMap(self, fn) {
      return self.map(fn);
    },
    ArrayPrototypePop(self, el) {
      return self.pop(el);
    },
    ArrayPrototypePush(self, el) {
      return self.push(el);
    },
    ArrayPrototypeSlice(self, start, end) {
      return self.slice(start, end);
    },
    Error,
    FunctionPrototypeCall(fn, thisArgs, ...args) {
      return fn.call(thisArgs, ...args);
    },
    FunctionPrototypeSymbolHasInstance(self, instance) {
      return Function.prototype[Symbol.hasInstance].call(self, instance);
    },
    MathFloor: Math.floor,
    Number,
    NumberIsInteger: Number.isInteger,
    NumberIsNaN: Number.isNaN,
    NumberMAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
    NumberMIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
    NumberParseInt: Number.parseInt,
    ObjectDefineProperties(self, props) {
      return Object.defineProperties(self, props);
    },
    ObjectDefineProperty(self, name, prop) {
      return Object.defineProperty(self, name, prop);
    },
    ObjectGetOwnPropertyDescriptor(self, name) {
      return Object.getOwnPropertyDescriptor(self, name);
    },
    ObjectKeys(obj) {
      return Object.keys(obj);
    },
    ObjectSetPrototypeOf(target, proto) {
      return Object.setPrototypeOf(target, proto);
    },
    Promise,
    PromisePrototypeCatch(self, fn) {
      return self.catch(fn);
    },
    PromisePrototypeThen(self, thenFn, catchFn) {
      return self.then(thenFn, catchFn);
    },
    PromiseReject(err) {
      return Promise.reject(err);
    },
    ReflectApply: Reflect.apply,
    RegExpPrototypeTest(self, value) {
      return self.test(value);
    },
    SafeSet: Set,
    String,
    StringPrototypeSlice(self, start, end) {
      return self.slice(start, end);
    },
    StringPrototypeToLowerCase(self) {
      return self.toLowerCase();
    },
    StringPrototypeToUpperCase(self) {
      return self.toUpperCase();
    },
    StringPrototypeTrim(self) {
      return self.trim();
    },
    Symbol,
    SymbolAsyncIterator: Symbol.asyncIterator,
    SymbolHasInstance: Symbol.hasInstance,
    SymbolIterator: Symbol.iterator,
    TypedArrayPrototypeSet(self, buf, len) {
      return self.set(buf, len);
    },
    Uint8Array
  };
  return primordials;
}

var utilExports = {};
var util$3 = {
  get exports(){ return utilExports; },
  set exports(v){ utilExports = v; },
};

var hasRequiredUtil;
function requireUtil() {
  if (hasRequiredUtil) return utilExports;
  hasRequiredUtil = 1;
  (function (module) {

    const bufferModule = require$$4;
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const Blob = globalThis.Blob || bufferModule.Blob;
    /* eslint-disable indent */
    const isBlob = typeof Blob !== 'undefined' ? function isBlob(b) {
      // eslint-disable-next-line indent
      return b instanceof Blob;
    } : function isBlob(b) {
      return false;
    };
    /* eslint-enable indent */

    // This is a simplified version of AggregateError
    class AggregateError extends Error {
      constructor(errors) {
        if (!Array.isArray(errors)) {
          throw new TypeError(`Expected input to be an Array, got ${typeof errors}`);
        }
        let message = '';
        for (let i = 0; i < errors.length; i++) {
          message += `    ${errors[i].stack}\n`;
        }
        super(message);
        this.name = 'AggregateError';
        this.errors = errors;
      }
    }
    module.exports = {
      AggregateError,
      kEmptyObject: Object.freeze({}),
      once(callback) {
        let called = false;
        return function (...args) {
          if (called) {
            return;
          }
          called = true;
          callback.apply(this, args);
        };
      },
      createDeferredPromise: function () {
        let resolve;
        let reject;

        // eslint-disable-next-line promise/param-names
        const promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        return {
          promise,
          resolve,
          reject
        };
      },
      promisify(fn) {
        return new Promise((resolve, reject) => {
          fn((err, ...args) => {
            if (err) {
              return reject(err);
            }
            return resolve(...args);
          });
        });
      },
      debuglog() {
        return function () {};
      },
      format(format, ...args) {
        // Simplified version of https://nodejs.org/api/util.html#utilformatformat-args
        return format.replace(/%([sdifj])/g, function (...[_unused, type]) {
          const replacement = args.shift();
          if (type === 'f') {
            return replacement.toFixed(6);
          } else if (type === 'j') {
            return JSON.stringify(replacement);
          } else if (type === 's' && typeof replacement === 'object') {
            const ctor = replacement.constructor !== Object ? replacement.constructor.name : '';
            return `${ctor} {}`.trim();
          } else {
            return replacement.toString();
          }
        });
      },
      inspect(value) {
        // Vastly simplified version of https://nodejs.org/api/util.html#utilinspectobject-options
        switch (typeof value) {
          case 'string':
            if (value.includes("'")) {
              if (!value.includes('"')) {
                return `"${value}"`;
              } else if (!value.includes('`') && !value.includes('${')) {
                return `\`${value}\``;
              }
            }
            return `'${value}'`;
          case 'number':
            if (isNaN(value)) {
              return 'NaN';
            } else if (Object.is(value, -0)) {
              return String(value);
            }
            return value;
          case 'bigint':
            return `${String(value)}n`;
          case 'boolean':
          case 'undefined':
            return String(value);
          case 'object':
            return '{}';
        }
      },
      types: {
        isAsyncFunction(fn) {
          return fn instanceof AsyncFunction;
        },
        isArrayBufferView(arr) {
          return ArrayBuffer.isView(arr);
        }
      },
      isBlob
    };
    module.exports.promisify.custom = Symbol.for('nodejs.util.promisify.custom');
  })(util$3);
  return utilExports;
}

var operators = {};

var abortControllerExports = {};
var abortController = {
  get exports(){ return abortControllerExports; },
  set exports(v){ abortControllerExports = v; },
};

var eventTargetShimExports = {};
var eventTargetShim = {
  get exports(){ return eventTargetShimExports; },
  set exports(v){ eventTargetShimExports = v; },
};

/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
var hasRequiredEventTargetShim;
function requireEventTargetShim() {
  if (hasRequiredEventTargetShim) return eventTargetShimExports;
  hasRequiredEventTargetShim = 1;
  (function (module, exports) {

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    /**
     * @typedef {object} PrivateData
     * @property {EventTarget} eventTarget The event target.
     * @property {{type:string}} event The original event object.
     * @property {number} eventPhase The current event phase.
     * @property {EventTarget|null} currentTarget The current event target.
     * @property {boolean} canceled The flag to prevent default.
     * @property {boolean} stopped The flag to stop propagation.
     * @property {boolean} immediateStopped The flag to stop propagation immediately.
     * @property {Function|null} passiveListener The listener if the current listener is passive. Otherwise this is null.
     * @property {number} timeStamp The unix time.
     * @private
     */

    /**
     * Private data for event wrappers.
     * @type {WeakMap<Event, PrivateData>}
     * @private
     */
    const privateData = new WeakMap();

    /**
     * Cache for wrapper classes.
     * @type {WeakMap<Object, Function>}
     * @private
     */
    const wrappers = new WeakMap();

    /**
     * Get private data.
     * @param {Event} event The event object to get private data.
     * @returns {PrivateData} The private data of the event.
     * @private
     */
    function pd(event) {
      const retv = privateData.get(event);
      console.assert(retv != null, "'this' is expected an Event object, but got", event);
      return retv;
    }

    /**
     * https://dom.spec.whatwg.org/#set-the-canceled-flag
     * @param data {PrivateData} private data.
     */
    function setCancelFlag(data) {
      if (data.passiveListener != null) {
        if (typeof console !== "undefined" && typeof console.error === "function") {
          console.error("Unable to preventDefault inside passive event listener invocation.", data.passiveListener);
        }
        return;
      }
      if (!data.event.cancelable) {
        return;
      }
      data.canceled = true;
      if (typeof data.event.preventDefault === "function") {
        data.event.preventDefault();
      }
    }

    /**
     * @see https://dom.spec.whatwg.org/#interface-event
     * @private
     */
    /**
     * The event wrapper.
     * @constructor
     * @param {EventTarget} eventTarget The event target of this dispatching.
     * @param {Event|{type:string}} event The original event to wrap.
     */
    function Event(eventTarget, event) {
      privateData.set(this, {
        eventTarget,
        event,
        eventPhase: 2,
        currentTarget: eventTarget,
        canceled: false,
        stopped: false,
        immediateStopped: false,
        passiveListener: null,
        timeStamp: event.timeStamp || Date.now()
      });

      // https://heycam.github.io/webidl/#Unforgeable
      Object.defineProperty(this, "isTrusted", {
        value: false,
        enumerable: true
      });

      // Define accessors
      const keys = Object.keys(event);
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (!(key in this)) {
          Object.defineProperty(this, key, defineRedirectDescriptor(key));
        }
      }
    }

    // Should be enumerable, but class methods are not enumerable.
    Event.prototype = {
      /**
       * The type of this event.
       * @type {string}
       */
      get type() {
        return pd(this).event.type;
      },
      /**
       * The target of this event.
       * @type {EventTarget}
       */
      get target() {
        return pd(this).eventTarget;
      },
      /**
       * The target of this event.
       * @type {EventTarget}
       */
      get currentTarget() {
        return pd(this).currentTarget;
      },
      /**
       * @returns {EventTarget[]} The composed path of this event.
       */
      composedPath() {
        const currentTarget = pd(this).currentTarget;
        if (currentTarget == null) {
          return [];
        }
        return [currentTarget];
      },
      /**
       * Constant of NONE.
       * @type {number}
       */
      get NONE() {
        return 0;
      },
      /**
       * Constant of CAPTURING_PHASE.
       * @type {number}
       */
      get CAPTURING_PHASE() {
        return 1;
      },
      /**
       * Constant of AT_TARGET.
       * @type {number}
       */
      get AT_TARGET() {
        return 2;
      },
      /**
       * Constant of BUBBLING_PHASE.
       * @type {number}
       */
      get BUBBLING_PHASE() {
        return 3;
      },
      /**
       * The target of this event.
       * @type {number}
       */
      get eventPhase() {
        return pd(this).eventPhase;
      },
      /**
       * Stop event bubbling.
       * @returns {void}
       */
      stopPropagation() {
        const data = pd(this);
        data.stopped = true;
        if (typeof data.event.stopPropagation === "function") {
          data.event.stopPropagation();
        }
      },
      /**
       * Stop event bubbling.
       * @returns {void}
       */
      stopImmediatePropagation() {
        const data = pd(this);
        data.stopped = true;
        data.immediateStopped = true;
        if (typeof data.event.stopImmediatePropagation === "function") {
          data.event.stopImmediatePropagation();
        }
      },
      /**
       * The flag to be bubbling.
       * @type {boolean}
       */
      get bubbles() {
        return Boolean(pd(this).event.bubbles);
      },
      /**
       * The flag to be cancelable.
       * @type {boolean}
       */
      get cancelable() {
        return Boolean(pd(this).event.cancelable);
      },
      /**
       * Cancel this event.
       * @returns {void}
       */
      preventDefault() {
        setCancelFlag(pd(this));
      },
      /**
       * The flag to indicate cancellation state.
       * @type {boolean}
       */
      get defaultPrevented() {
        return pd(this).canceled;
      },
      /**
       * The flag to be composed.
       * @type {boolean}
       */
      get composed() {
        return Boolean(pd(this).event.composed);
      },
      /**
       * The unix time of this event.
       * @type {number}
       */
      get timeStamp() {
        return pd(this).timeStamp;
      },
      /**
       * The target of this event.
       * @type {EventTarget}
       * @deprecated
       */
      get srcElement() {
        return pd(this).eventTarget;
      },
      /**
       * The flag to stop event bubbling.
       * @type {boolean}
       * @deprecated
       */
      get cancelBubble() {
        return pd(this).stopped;
      },
      set cancelBubble(value) {
        if (!value) {
          return;
        }
        const data = pd(this);
        data.stopped = true;
        if (typeof data.event.cancelBubble === "boolean") {
          data.event.cancelBubble = true;
        }
      },
      /**
       * The flag to indicate cancellation state.
       * @type {boolean}
       * @deprecated
       */
      get returnValue() {
        return !pd(this).canceled;
      },
      set returnValue(value) {
        if (!value) {
          setCancelFlag(pd(this));
        }
      },
      /**
       * Initialize this event object. But do nothing under event dispatching.
       * @param {string} type The event type.
       * @param {boolean} [bubbles=false] The flag to be possible to bubble up.
       * @param {boolean} [cancelable=false] The flag to be possible to cancel.
       * @deprecated
       */
      initEvent() {
        // Do nothing.
      }
    };

    // `constructor` is not enumerable.
    Object.defineProperty(Event.prototype, "constructor", {
      value: Event,
      configurable: true,
      writable: true
    });

    // Ensure `event instanceof window.Event` is `true`.
    if (typeof window !== "undefined" && typeof window.Event !== "undefined") {
      Object.setPrototypeOf(Event.prototype, window.Event.prototype);

      // Make association for wrappers.
      wrappers.set(window.Event.prototype, Event);
    }

    /**
     * Get the property descriptor to redirect a given property.
     * @param {string} key Property name to define property descriptor.
     * @returns {PropertyDescriptor} The property descriptor to redirect the property.
     * @private
     */
    function defineRedirectDescriptor(key) {
      return {
        get() {
          return pd(this).event[key];
        },
        set(value) {
          pd(this).event[key] = value;
        },
        configurable: true,
        enumerable: true
      };
    }

    /**
     * Get the property descriptor to call a given method property.
     * @param {string} key Property name to define property descriptor.
     * @returns {PropertyDescriptor} The property descriptor to call the method property.
     * @private
     */
    function defineCallDescriptor(key) {
      return {
        value() {
          const event = pd(this).event;
          return event[key].apply(event, arguments);
        },
        configurable: true,
        enumerable: true
      };
    }

    /**
     * Define new wrapper class.
     * @param {Function} BaseEvent The base wrapper class.
     * @param {Object} proto The prototype of the original event.
     * @returns {Function} The defined wrapper class.
     * @private
     */
    function defineWrapper(BaseEvent, proto) {
      const keys = Object.keys(proto);
      if (keys.length === 0) {
        return BaseEvent;
      }

      /** CustomEvent */
      function CustomEvent(eventTarget, event) {
        BaseEvent.call(this, eventTarget, event);
      }
      CustomEvent.prototype = Object.create(BaseEvent.prototype, {
        constructor: {
          value: CustomEvent,
          configurable: true,
          writable: true
        }
      });

      // Define accessors.
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (!(key in BaseEvent.prototype)) {
          const descriptor = Object.getOwnPropertyDescriptor(proto, key);
          const isFunc = typeof descriptor.value === "function";
          Object.defineProperty(CustomEvent.prototype, key, isFunc ? defineCallDescriptor(key) : defineRedirectDescriptor(key));
        }
      }
      return CustomEvent;
    }

    /**
     * Get the wrapper class of a given prototype.
     * @param {Object} proto The prototype of the original event to get its wrapper.
     * @returns {Function} The wrapper class.
     * @private
     */
    function getWrapper(proto) {
      if (proto == null || proto === Object.prototype) {
        return Event;
      }
      let wrapper = wrappers.get(proto);
      if (wrapper == null) {
        wrapper = defineWrapper(getWrapper(Object.getPrototypeOf(proto)), proto);
        wrappers.set(proto, wrapper);
      }
      return wrapper;
    }

    /**
     * Wrap a given event to management a dispatching.
     * @param {EventTarget} eventTarget The event target of this dispatching.
     * @param {Object} event The event to wrap.
     * @returns {Event} The wrapper instance.
     * @private
     */
    function wrapEvent(eventTarget, event) {
      const Wrapper = getWrapper(Object.getPrototypeOf(event));
      return new Wrapper(eventTarget, event);
    }

    /**
     * Get the immediateStopped flag of a given event.
     * @param {Event} event The event to get.
     * @returns {boolean} The flag to stop propagation immediately.
     * @private
     */
    function isStopped(event) {
      return pd(event).immediateStopped;
    }

    /**
     * Set the current event phase of a given event.
     * @param {Event} event The event to set current target.
     * @param {number} eventPhase New event phase.
     * @returns {void}
     * @private
     */
    function setEventPhase(event, eventPhase) {
      pd(event).eventPhase = eventPhase;
    }

    /**
     * Set the current target of a given event.
     * @param {Event} event The event to set current target.
     * @param {EventTarget|null} currentTarget New current target.
     * @returns {void}
     * @private
     */
    function setCurrentTarget(event, currentTarget) {
      pd(event).currentTarget = currentTarget;
    }

    /**
     * Set a passive listener of a given event.
     * @param {Event} event The event to set current target.
     * @param {Function|null} passiveListener New passive listener.
     * @returns {void}
     * @private
     */
    function setPassiveListener(event, passiveListener) {
      pd(event).passiveListener = passiveListener;
    }

    /**
     * @typedef {object} ListenerNode
     * @property {Function} listener
     * @property {1|2|3} listenerType
     * @property {boolean} passive
     * @property {boolean} once
     * @property {ListenerNode|null} next
     * @private
     */

    /**
     * @type {WeakMap<object, Map<string, ListenerNode>>}
     * @private
     */
    const listenersMap = new WeakMap();

    // Listener types
    const CAPTURE = 1;
    const BUBBLE = 2;
    const ATTRIBUTE = 3;

    /**
     * Check whether a given value is an object or not.
     * @param {any} x The value to check.
     * @returns {boolean} `true` if the value is an object.
     */
    function isObject(x) {
      return x !== null && typeof x === "object"; //eslint-disable-line no-restricted-syntax
    }

    /**
     * Get listeners.
     * @param {EventTarget} eventTarget The event target to get.
     * @returns {Map<string, ListenerNode>} The listeners.
     * @private
     */
    function getListeners(eventTarget) {
      const listeners = listenersMap.get(eventTarget);
      if (listeners == null) {
        throw new TypeError("'this' is expected an EventTarget object, but got another value.");
      }
      return listeners;
    }

    /**
     * Get the property descriptor for the event attribute of a given event.
     * @param {string} eventName The event name to get property descriptor.
     * @returns {PropertyDescriptor} The property descriptor.
     * @private
     */
    function defineEventAttributeDescriptor(eventName) {
      return {
        get() {
          const listeners = getListeners(this);
          let node = listeners.get(eventName);
          while (node != null) {
            if (node.listenerType === ATTRIBUTE) {
              return node.listener;
            }
            node = node.next;
          }
          return null;
        },
        set(listener) {
          if (typeof listener !== "function" && !isObject(listener)) {
            listener = null; // eslint-disable-line no-param-reassign
          }

          const listeners = getListeners(this);

          // Traverse to the tail while removing old value.
          let prev = null;
          let node = listeners.get(eventName);
          while (node != null) {
            if (node.listenerType === ATTRIBUTE) {
              // Remove old value.
              if (prev !== null) {
                prev.next = node.next;
              } else if (node.next !== null) {
                listeners.set(eventName, node.next);
              } else {
                listeners.delete(eventName);
              }
            } else {
              prev = node;
            }
            node = node.next;
          }

          // Add new value.
          if (listener !== null) {
            const newNode = {
              listener,
              listenerType: ATTRIBUTE,
              passive: false,
              once: false,
              next: null
            };
            if (prev === null) {
              listeners.set(eventName, newNode);
            } else {
              prev.next = newNode;
            }
          }
        },
        configurable: true,
        enumerable: true
      };
    }

    /**
     * Define an event attribute (e.g. `eventTarget.onclick`).
     * @param {Object} eventTargetPrototype The event target prototype to define an event attrbite.
     * @param {string} eventName The event name to define.
     * @returns {void}
     */
    function defineEventAttribute(eventTargetPrototype, eventName) {
      Object.defineProperty(eventTargetPrototype, `on${eventName}`, defineEventAttributeDescriptor(eventName));
    }

    /**
     * Define a custom EventTarget with event attributes.
     * @param {string[]} eventNames Event names for event attributes.
     * @returns {EventTarget} The custom EventTarget.
     * @private
     */
    function defineCustomEventTarget(eventNames) {
      /** CustomEventTarget */
      function CustomEventTarget() {
        EventTarget.call(this);
      }
      CustomEventTarget.prototype = Object.create(EventTarget.prototype, {
        constructor: {
          value: CustomEventTarget,
          configurable: true,
          writable: true
        }
      });
      for (let i = 0; i < eventNames.length; ++i) {
        defineEventAttribute(CustomEventTarget.prototype, eventNames[i]);
      }
      return CustomEventTarget;
    }

    /**
     * EventTarget.
     *
     * - This is constructor if no arguments.
     * - This is a function which returns a CustomEventTarget constructor if there are arguments.
     *
     * For example:
     *
     *     class A extends EventTarget {}
     *     class B extends EventTarget("message") {}
     *     class C extends EventTarget("message", "error") {}
     *     class D extends EventTarget(["message", "error"]) {}
     */
    function EventTarget() {
      /*eslint-disable consistent-return */
      if (this instanceof EventTarget) {
        listenersMap.set(this, new Map());
        return;
      }
      if (arguments.length === 1 && Array.isArray(arguments[0])) {
        return defineCustomEventTarget(arguments[0]);
      }
      if (arguments.length > 0) {
        const types = new Array(arguments.length);
        for (let i = 0; i < arguments.length; ++i) {
          types[i] = arguments[i];
        }
        return defineCustomEventTarget(types);
      }
      throw new TypeError("Cannot call a class as a function");
      /*eslint-enable consistent-return */
    }

    // Should be enumerable, but class methods are not enumerable.
    EventTarget.prototype = {
      /**
       * Add a given listener to this event target.
       * @param {string} eventName The event name to add.
       * @param {Function} listener The listener to add.
       * @param {boolean|{capture?:boolean,passive?:boolean,once?:boolean}} [options] The options for this listener.
       * @returns {void}
       */
      addEventListener(eventName, listener, options) {
        if (listener == null) {
          return;
        }
        if (typeof listener !== "function" && !isObject(listener)) {
          throw new TypeError("'listener' should be a function or an object.");
        }
        const listeners = getListeners(this);
        const optionsIsObj = isObject(options);
        const capture = optionsIsObj ? Boolean(options.capture) : Boolean(options);
        const listenerType = capture ? CAPTURE : BUBBLE;
        const newNode = {
          listener,
          listenerType,
          passive: optionsIsObj && Boolean(options.passive),
          once: optionsIsObj && Boolean(options.once),
          next: null
        };

        // Set it as the first node if the first node is null.
        let node = listeners.get(eventName);
        if (node === undefined) {
          listeners.set(eventName, newNode);
          return;
        }

        // Traverse to the tail while checking duplication..
        let prev = null;
        while (node != null) {
          if (node.listener === listener && node.listenerType === listenerType) {
            // Should ignore duplication.
            return;
          }
          prev = node;
          node = node.next;
        }

        // Add it.
        prev.next = newNode;
      },
      /**
       * Remove a given listener from this event target.
       * @param {string} eventName The event name to remove.
       * @param {Function} listener The listener to remove.
       * @param {boolean|{capture?:boolean,passive?:boolean,once?:boolean}} [options] The options for this listener.
       * @returns {void}
       */
      removeEventListener(eventName, listener, options) {
        if (listener == null) {
          return;
        }
        const listeners = getListeners(this);
        const capture = isObject(options) ? Boolean(options.capture) : Boolean(options);
        const listenerType = capture ? CAPTURE : BUBBLE;
        let prev = null;
        let node = listeners.get(eventName);
        while (node != null) {
          if (node.listener === listener && node.listenerType === listenerType) {
            if (prev !== null) {
              prev.next = node.next;
            } else if (node.next !== null) {
              listeners.set(eventName, node.next);
            } else {
              listeners.delete(eventName);
            }
            return;
          }
          prev = node;
          node = node.next;
        }
      },
      /**
       * Dispatch a given event.
       * @param {Event|{type:string}} event The event to dispatch.
       * @returns {boolean} `false` if canceled.
       */
      dispatchEvent(event) {
        if (event == null || typeof event.type !== "string") {
          throw new TypeError('"event.type" should be a string.');
        }

        // If listeners aren't registered, terminate.
        const listeners = getListeners(this);
        const eventName = event.type;
        let node = listeners.get(eventName);
        if (node == null) {
          return true;
        }

        // Since we cannot rewrite several properties, so wrap object.
        const wrappedEvent = wrapEvent(this, event);

        // This doesn't process capturing phase and bubbling phase.
        // This isn't participating in a tree.
        let prev = null;
        while (node != null) {
          // Remove this listener if it's once
          if (node.once) {
            if (prev !== null) {
              prev.next = node.next;
            } else if (node.next !== null) {
              listeners.set(eventName, node.next);
            } else {
              listeners.delete(eventName);
            }
          } else {
            prev = node;
          }

          // Call this listener
          setPassiveListener(wrappedEvent, node.passive ? node.listener : null);
          if (typeof node.listener === "function") {
            try {
              node.listener.call(this, wrappedEvent);
            } catch (err) {
              if (typeof console !== "undefined" && typeof console.error === "function") {
                console.error(err);
              }
            }
          } else if (node.listenerType !== ATTRIBUTE && typeof node.listener.handleEvent === "function") {
            node.listener.handleEvent(wrappedEvent);
          }

          // Break if `event.stopImmediatePropagation` was called.
          if (isStopped(wrappedEvent)) {
            break;
          }
          node = node.next;
        }
        setPassiveListener(wrappedEvent, null);
        setEventPhase(wrappedEvent, 0);
        setCurrentTarget(wrappedEvent, null);
        return !wrappedEvent.defaultPrevented;
      }
    };

    // `constructor` is not enumerable.
    Object.defineProperty(EventTarget.prototype, "constructor", {
      value: EventTarget,
      configurable: true,
      writable: true
    });

    // Ensure `eventTarget instanceof window.EventTarget` is `true`.
    if (typeof window !== "undefined" && typeof window.EventTarget !== "undefined") {
      Object.setPrototypeOf(EventTarget.prototype, window.EventTarget.prototype);
    }
    exports.defineEventAttribute = defineEventAttribute;
    exports.EventTarget = EventTarget;
    exports.default = EventTarget;
    module.exports = EventTarget;
    module.exports.EventTarget = module.exports["default"] = EventTarget;
    module.exports.defineEventAttribute = defineEventAttribute;
  })(eventTargetShim, eventTargetShimExports);
  return eventTargetShimExports;
}

/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
var hasRequiredAbortController;
function requireAbortController() {
  if (hasRequiredAbortController) return abortControllerExports;
  hasRequiredAbortController = 1;
  (function (module, exports) {

    Object.defineProperty(exports, '__esModule', {
      value: true
    });
    var eventTargetShim = requireEventTargetShim();

    /**
     * The signal class.
     * @see https://dom.spec.whatwg.org/#abortsignal
     */
    class AbortSignal extends eventTargetShim.EventTarget {
      /**
       * AbortSignal cannot be constructed directly.
       */
      constructor() {
        super();
        throw new TypeError("AbortSignal cannot be constructed directly");
      }
      /**
       * Returns `true` if this `AbortSignal`'s `AbortController` has signaled to abort, and `false` otherwise.
       */
      get aborted() {
        const aborted = abortedFlags.get(this);
        if (typeof aborted !== "boolean") {
          throw new TypeError(`Expected 'this' to be an 'AbortSignal' object, but got ${this === null ? "null" : typeof this}`);
        }
        return aborted;
      }
    }
    eventTargetShim.defineEventAttribute(AbortSignal.prototype, "abort");
    /**
     * Create an AbortSignal object.
     */
    function createAbortSignal() {
      const signal = Object.create(AbortSignal.prototype);
      eventTargetShim.EventTarget.call(signal);
      abortedFlags.set(signal, false);
      return signal;
    }
    /**
     * Abort a given signal.
     */
    function abortSignal(signal) {
      if (abortedFlags.get(signal) !== false) {
        return;
      }
      abortedFlags.set(signal, true);
      signal.dispatchEvent({
        type: "abort"
      });
    }
    /**
     * Aborted flag for each instances.
     */
    const abortedFlags = new WeakMap();
    // Properties should be enumerable.
    Object.defineProperties(AbortSignal.prototype, {
      aborted: {
        enumerable: true
      }
    });
    // `toString()` should return `"[object AbortSignal]"`
    if (typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
      Object.defineProperty(AbortSignal.prototype, Symbol.toStringTag, {
        configurable: true,
        value: "AbortSignal"
      });
    }

    /**
     * The AbortController.
     * @see https://dom.spec.whatwg.org/#abortcontroller
     */
    class AbortController {
      /**
       * Initialize this controller.
       */
      constructor() {
        signals.set(this, createAbortSignal());
      }
      /**
       * Returns the `AbortSignal` object associated with this object.
       */
      get signal() {
        return getSignal(this);
      }
      /**
       * Abort and signal to any observers that the associated activity is to be aborted.
       */
      abort() {
        abortSignal(getSignal(this));
      }
    }
    /**
     * Associated signals.
     */
    const signals = new WeakMap();
    /**
     * Get the associated signal of a given controller.
     */
    function getSignal(controller) {
      const signal = signals.get(controller);
      if (signal == null) {
        throw new TypeError(`Expected 'this' to be an 'AbortController' object, but got ${controller === null ? "null" : typeof controller}`);
      }
      return signal;
    }
    // Properties should be enumerable.
    Object.defineProperties(AbortController.prototype, {
      signal: {
        enumerable: true
      },
      abort: {
        enumerable: true
      }
    });
    if (typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
      Object.defineProperty(AbortController.prototype, Symbol.toStringTag, {
        configurable: true,
        value: "AbortController"
      });
    }
    exports.AbortController = AbortController;
    exports.AbortSignal = AbortSignal;
    exports.default = AbortController;
    module.exports = AbortController;
    module.exports.AbortController = module.exports["default"] = AbortController;
    module.exports.AbortSignal = AbortSignal;
  })(abortController, abortControllerExports);
  return abortControllerExports;
}

var errors;
var hasRequiredErrors;
function requireErrors() {
  if (hasRequiredErrors) return errors;
  hasRequiredErrors = 1;
  const {
    format,
    inspect,
    AggregateError: CustomAggregateError
  } = requireUtil();

  /*
    This file is a reduced and adapted version of the main lib/internal/errors.js file defined at
  	  https://github.com/nodejs/node/blob/master/lib/internal/errors.js
  	  Don't try to replace with the original file and keep it up to date (starting from E(...) definitions)
    with the upstream file.
  */

  const AggregateError = globalThis.AggregateError || CustomAggregateError;
  const kIsNodeError = Symbol('kIsNodeError');
  const kTypes = ['string', 'function', 'number', 'object',
  // Accept 'Function' and 'Object' as alternative to the lower cased version.
  'Function', 'Object', 'boolean', 'bigint', 'symbol'];
  const classRegExp = /^([A-Z][a-z0-9]*)+$/;
  const nodeInternalPrefix = '__node_internal_';
  const codes = {};
  function assert(value, message) {
    if (!value) {
      throw new codes.ERR_INTERNAL_ASSERTION(message);
    }
  }

  // Only use this for integers! Decimal numbers do not work with this function.
  function addNumericalSeparator(val) {
    let res = '';
    let i = val.length;
    const start = val[0] === '-' ? 1 : 0;
    for (; i >= start + 4; i -= 3) {
      res = `_${val.slice(i - 3, i)}${res}`;
    }
    return `${val.slice(0, i)}${res}`;
  }
  function getMessage(key, msg, args) {
    if (typeof msg === 'function') {
      assert(msg.length <= args.length,
      // Default options do not count.
      `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${msg.length}).`);
      return msg(...args);
    }
    const expectedLength = (msg.match(/%[dfijoOs]/g) || []).length;
    assert(expectedLength === args.length, `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${expectedLength}).`);
    if (args.length === 0) {
      return msg;
    }
    return format(msg, ...args);
  }
  function E(code, message, Base) {
    if (!Base) {
      Base = Error;
    }
    class NodeError extends Base {
      constructor(...args) {
        super(getMessage(code, message, args));
      }
      toString() {
        return `${this.name} [${code}]: ${this.message}`;
      }
    }
    Object.defineProperties(NodeError.prototype, {
      name: {
        value: Base.name,
        writable: true,
        enumerable: false,
        configurable: true
      },
      toString: {
        value() {
          return `${this.name} [${code}]: ${this.message}`;
        },
        writable: true,
        enumerable: false,
        configurable: true
      }
    });
    NodeError.prototype.code = code;
    NodeError.prototype[kIsNodeError] = true;
    codes[code] = NodeError;
  }
  function hideStackFrames(fn) {
    // We rename the functions that will be hidden to cut off the stacktrace
    // at the outermost one
    const hidden = nodeInternalPrefix + fn.name;
    Object.defineProperty(fn, 'name', {
      value: hidden
    });
    return fn;
  }
  function aggregateTwoErrors(innerError, outerError) {
    if (innerError && outerError && innerError !== outerError) {
      if (Array.isArray(outerError.errors)) {
        // If `outerError` is already an `AggregateError`.
        outerError.errors.push(innerError);
        return outerError;
      }
      const err = new AggregateError([outerError, innerError], outerError.message);
      err.code = outerError.code;
      return err;
    }
    return innerError || outerError;
  }
  class AbortError extends Error {
    constructor(message = 'The operation was aborted', options = undefined) {
      if (options !== undefined && typeof options !== 'object') {
        throw new codes.ERR_INVALID_ARG_TYPE('options', 'Object', options);
      }
      super(message, options);
      this.code = 'ABORT_ERR';
      this.name = 'AbortError';
    }
  }
  E('ERR_ASSERTION', '%s', Error);
  E('ERR_INVALID_ARG_TYPE', (name, expected, actual) => {
    assert(typeof name === 'string', "'name' must be a string");
    if (!Array.isArray(expected)) {
      expected = [expected];
    }
    let msg = 'The ';
    if (name.endsWith(' argument')) {
      // For cases like 'first argument'
      msg += `${name} `;
    } else {
      msg += `"${name}" ${name.includes('.') ? 'property' : 'argument'} `;
    }
    msg += 'must be ';
    const types = [];
    const instances = [];
    const other = [];
    for (const value of expected) {
      assert(typeof value === 'string', 'All expected entries have to be of type string');
      if (kTypes.includes(value)) {
        types.push(value.toLowerCase());
      } else if (classRegExp.test(value)) {
        instances.push(value);
      } else {
        assert(value !== 'object', 'The value "object" should be written as "Object"');
        other.push(value);
      }
    }

    // Special handle `object` in case other instances are allowed to outline
    // the differences between each other.
    if (instances.length > 0) {
      const pos = types.indexOf('object');
      if (pos !== -1) {
        types.splice(types, pos, 1);
        instances.push('Object');
      }
    }
    if (types.length > 0) {
      switch (types.length) {
        case 1:
          msg += `of type ${types[0]}`;
          break;
        case 2:
          msg += `one of type ${types[0]} or ${types[1]}`;
          break;
        default:
          {
            const last = types.pop();
            msg += `one of type ${types.join(', ')}, or ${last}`;
          }
      }
      if (instances.length > 0 || other.length > 0) {
        msg += ' or ';
      }
    }
    if (instances.length > 0) {
      switch (instances.length) {
        case 1:
          msg += `an instance of ${instances[0]}`;
          break;
        case 2:
          msg += `an instance of ${instances[0]} or ${instances[1]}`;
          break;
        default:
          {
            const last = instances.pop();
            msg += `an instance of ${instances.join(', ')}, or ${last}`;
          }
      }
      if (other.length > 0) {
        msg += ' or ';
      }
    }
    switch (other.length) {
      case 0:
        break;
      case 1:
        if (other[0].toLowerCase() !== other[0]) {
          msg += 'an ';
        }
        msg += `${other[0]}`;
        break;
      case 2:
        msg += `one of ${other[0]} or ${other[1]}`;
        break;
      default:
        {
          const last = other.pop();
          msg += `one of ${other.join(', ')}, or ${last}`;
        }
    }
    if (actual == null) {
      msg += `. Received ${actual}`;
    } else if (typeof actual === 'function' && actual.name) {
      msg += `. Received function ${actual.name}`;
    } else if (typeof actual === 'object') {
      var _actual$constructor;
      if ((_actual$constructor = actual.constructor) !== null && _actual$constructor !== undefined && _actual$constructor.name) {
        msg += `. Received an instance of ${actual.constructor.name}`;
      } else {
        const inspected = inspect(actual, {
          depth: -1
        });
        msg += `. Received ${inspected}`;
      }
    } else {
      let inspected = inspect(actual, {
        colors: false
      });
      if (inspected.length > 25) {
        inspected = `${inspected.slice(0, 25)}...`;
      }
      msg += `. Received type ${typeof actual} (${inspected})`;
    }
    return msg;
  }, TypeError);
  E('ERR_INVALID_ARG_VALUE', (name, value, reason = 'is invalid') => {
    let inspected = inspect(value);
    if (inspected.length > 128) {
      inspected = inspected.slice(0, 128) + '...';
    }
    const type = name.includes('.') ? 'property' : 'argument';
    return `The ${type} '${name}' ${reason}. Received ${inspected}`;
  }, TypeError);
  E('ERR_INVALID_RETURN_VALUE', (input, name, value) => {
    var _value$constructor;
    const type = value !== null && value !== undefined && (_value$constructor = value.constructor) !== null && _value$constructor !== undefined && _value$constructor.name ? `instance of ${value.constructor.name}` : `type ${typeof value}`;
    return `Expected ${input} to be returned from the "${name}"` + ` function but got ${type}.`;
  }, TypeError);
  E('ERR_MISSING_ARGS', (...args) => {
    assert(args.length > 0, 'At least one arg needs to be specified');
    let msg;
    const len = args.length;
    args = (Array.isArray(args) ? args : [args]).map(a => `"${a}"`).join(' or ');
    switch (len) {
      case 1:
        msg += `The ${args[0]} argument`;
        break;
      case 2:
        msg += `The ${args[0]} and ${args[1]} arguments`;
        break;
      default:
        {
          const last = args.pop();
          msg += `The ${args.join(', ')}, and ${last} arguments`;
        }
        break;
    }
    return `${msg} must be specified`;
  }, TypeError);
  E('ERR_OUT_OF_RANGE', (str, range, input) => {
    assert(range, 'Missing "range" argument');
    let received;
    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
      received = addNumericalSeparator(String(input));
    } else if (typeof input === 'bigint') {
      received = String(input);
      if (input > 2n ** 32n || input < -(2n ** 32n)) {
        received = addNumericalSeparator(received);
      }
      received += 'n';
    } else {
      received = inspect(input);
    }
    return `The value of "${str}" is out of range. It must be ${range}. Received ${received}`;
  }, RangeError);
  E('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times', Error);
  E('ERR_METHOD_NOT_IMPLEMENTED', 'The %s method is not implemented', Error);
  E('ERR_STREAM_ALREADY_FINISHED', 'Cannot call %s after a stream was finished', Error);
  E('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable', Error);
  E('ERR_STREAM_DESTROYED', 'Cannot call %s after a stream was destroyed', Error);
  E('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
  E('ERR_STREAM_PREMATURE_CLOSE', 'Premature close', Error);
  E('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF', Error);
  E('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event', Error);
  E('ERR_STREAM_WRITE_AFTER_END', 'write after end', Error);
  E('ERR_UNKNOWN_ENCODING', 'Unknown encoding: %s', TypeError);
  errors = {
    AbortError,
    aggregateTwoErrors: hideStackFrames(aggregateTwoErrors),
    hideStackFrames,
    codes
  };
  return errors;
}

var validators;
var hasRequiredValidators;
function requireValidators() {
  if (hasRequiredValidators) return validators;
  hasRequiredValidators = 1;
  const {
    ArrayIsArray,
    ArrayPrototypeIncludes,
    ArrayPrototypeJoin,
    ArrayPrototypeMap,
    NumberIsInteger,
    NumberIsNaN,
    NumberMAX_SAFE_INTEGER,
    NumberMIN_SAFE_INTEGER,
    NumberParseInt,
    ObjectPrototypeHasOwnProperty,
    RegExpPrototypeExec,
    String,
    StringPrototypeToUpperCase,
    StringPrototypeTrim
  } = requirePrimordials();
  const {
    hideStackFrames,
    codes: {
      ERR_SOCKET_BAD_PORT,
      ERR_INVALID_ARG_TYPE,
      ERR_INVALID_ARG_VALUE,
      ERR_OUT_OF_RANGE,
      ERR_UNKNOWN_SIGNAL
    }
  } = requireErrors();
  const {
    normalizeEncoding
  } = requireUtil();
  const {
    isAsyncFunction,
    isArrayBufferView
  } = requireUtil().types;
  const signals = {};

  /**
   * @param {*} value
   * @returns {boolean}
   */
  function isInt32(value) {
    return value === (value | 0);
  }

  /**
   * @param {*} value
   * @returns {boolean}
   */
  function isUint32(value) {
    return value === value >>> 0;
  }
  const octalReg = /^[0-7]+$/;
  const modeDesc = 'must be a 32-bit unsigned integer or an octal string';

  /**
   * Parse and validate values that will be converted into mode_t (the S_*
   * constants). Only valid numbers and octal strings are allowed. They could be
   * converted to 32-bit unsigned integers or non-negative signed integers in the
   * C++ land, but any value higher than 0o777 will result in platform-specific
   * behaviors.
   *
   * @param {*} value Values to be validated
   * @param {string} name Name of the argument
   * @param {number} [def] If specified, will be returned for invalid values
   * @returns {number}
   */
  function parseFileMode(value, name, def) {
    if (typeof value === 'undefined') {
      value = def;
    }
    if (typeof value === 'string') {
      if (RegExpPrototypeExec(octalReg, value) === null) {
        throw new ERR_INVALID_ARG_VALUE(name, value, modeDesc);
      }
      value = NumberParseInt(value, 8);
    }
    validateUint32(value, name);
    return value;
  }

  /**
   * @callback validateInteger
   * @param {*} value
   * @param {string} name
   * @param {number} [min]
   * @param {number} [max]
   * @returns {asserts value is number}
   */

  /** @type {validateInteger} */
  const validateInteger = hideStackFrames((value, name, min = NumberMIN_SAFE_INTEGER, max = NumberMAX_SAFE_INTEGER) => {
    if (typeof value !== 'number') throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
    if (!NumberIsInteger(value)) throw new ERR_OUT_OF_RANGE(name, 'an integer', value);
    if (value < min || value > max) throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
  });

  /**
   * @callback validateInt32
   * @param {*} value
   * @param {string} name
   * @param {number} [min]
   * @param {number} [max]
   * @returns {asserts value is number}
   */

  /** @type {validateInt32} */
  const validateInt32 = hideStackFrames((value, name, min = -2147483648, max = 2147483647) => {
    // The defaults for min and max correspond to the limits of 32-bit integers.
    if (typeof value !== 'number') {
      throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
    }
    if (!NumberIsInteger(value)) {
      throw new ERR_OUT_OF_RANGE(name, 'an integer', value);
    }
    if (value < min || value > max) {
      throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
    }
  });

  /**
   * @callback validateUint32
   * @param {*} value
   * @param {string} name
   * @param {number|boolean} [positive=false]
   * @returns {asserts value is number}
   */

  /** @type {validateUint32} */
  const validateUint32 = hideStackFrames((value, name, positive = false) => {
    if (typeof value !== 'number') {
      throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
    }
    if (!NumberIsInteger(value)) {
      throw new ERR_OUT_OF_RANGE(name, 'an integer', value);
    }
    const min = positive ? 1 : 0;
    // 2 ** 32 === 4294967296
    const max = 4294967295;
    if (value < min || value > max) {
      throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
    }
  });

  /**
   * @callback validateString
   * @param {*} value
   * @param {string} name
   * @returns {asserts value is string}
   */

  /** @type {validateString} */
  function validateString(value, name) {
    if (typeof value !== 'string') throw new ERR_INVALID_ARG_TYPE(name, 'string', value);
  }

  /**
   * @callback validateNumber
   * @param {*} value
   * @param {string} name
   * @param {number} [min]
   * @param {number} [max]
   * @returns {asserts value is number}
   */

  /** @type {validateNumber} */
  function validateNumber(value, name, min = undefined, max) {
    if (typeof value !== 'number') throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
    if (min != null && value < min || max != null && value > max || (min != null || max != null) && NumberIsNaN(value)) {
      throw new ERR_OUT_OF_RANGE(name, `${min != null ? `>= ${min}` : ''}${min != null && max != null ? ' && ' : ''}${max != null ? `<= ${max}` : ''}`, value);
    }
  }

  /**
   * @callback validateOneOf
   * @template T
   * @param {T} value
   * @param {string} name
   * @param {T[]} oneOf
   */

  /** @type {validateOneOf} */
  const validateOneOf = hideStackFrames((value, name, oneOf) => {
    if (!ArrayPrototypeIncludes(oneOf, value)) {
      const allowed = ArrayPrototypeJoin(ArrayPrototypeMap(oneOf, v => typeof v === 'string' ? `'${v}'` : String(v)), ', ');
      const reason = 'must be one of: ' + allowed;
      throw new ERR_INVALID_ARG_VALUE(name, value, reason);
    }
  });

  /**
   * @callback validateBoolean
   * @param {*} value
   * @param {string} name
   * @returns {asserts value is boolean}
   */

  /** @type {validateBoolean} */
  function validateBoolean(value, name) {
    if (typeof value !== 'boolean') throw new ERR_INVALID_ARG_TYPE(name, 'boolean', value);
  }
  function getOwnPropertyValueOrDefault(options, key, defaultValue) {
    return options == null || !ObjectPrototypeHasOwnProperty(options, key) ? defaultValue : options[key];
  }

  /**
   * @callback validateObject
   * @param {*} value
   * @param {string} name
   * @param {{
   *   allowArray?: boolean,
   *   allowFunction?: boolean,
   *   nullable?: boolean
   * }} [options]
   */

  /** @type {validateObject} */
  const validateObject = hideStackFrames((value, name, options = null) => {
    const allowArray = getOwnPropertyValueOrDefault(options, 'allowArray', false);
    const allowFunction = getOwnPropertyValueOrDefault(options, 'allowFunction', false);
    const nullable = getOwnPropertyValueOrDefault(options, 'nullable', false);
    if (!nullable && value === null || !allowArray && ArrayIsArray(value) || typeof value !== 'object' && (!allowFunction || typeof value !== 'function')) {
      throw new ERR_INVALID_ARG_TYPE(name, 'Object', value);
    }
  });

  /**
   * @callback validateArray
   * @param {*} value
   * @param {string} name
   * @param {number} [minLength]
   * @returns {asserts value is any[]}
   */

  /** @type {validateArray} */
  const validateArray = hideStackFrames((value, name, minLength = 0) => {
    if (!ArrayIsArray(value)) {
      throw new ERR_INVALID_ARG_TYPE(name, 'Array', value);
    }
    if (value.length < minLength) {
      const reason = `must be longer than ${minLength}`;
      throw new ERR_INVALID_ARG_VALUE(name, value, reason);
    }
  });

  // eslint-disable-next-line jsdoc/require-returns-check
  /**
   * @param {*} signal
   * @param {string} [name='signal']
   * @returns {asserts signal is keyof signals}
   */
  function validateSignalName(signal, name = 'signal') {
    validateString(signal, name);
    if (signals[signal] === undefined) {
      if (signals[StringPrototypeToUpperCase(signal)] !== undefined) {
        throw new ERR_UNKNOWN_SIGNAL(signal + ' (signals must use all capital letters)');
      }
      throw new ERR_UNKNOWN_SIGNAL(signal);
    }
  }

  /**
   * @callback validateBuffer
   * @param {*} buffer
   * @param {string} [name='buffer']
   * @returns {asserts buffer is ArrayBufferView}
   */

  /** @type {validateBuffer} */
  const validateBuffer = hideStackFrames((buffer, name = 'buffer') => {
    if (!isArrayBufferView(buffer)) {
      throw new ERR_INVALID_ARG_TYPE(name, ['Buffer', 'TypedArray', 'DataView'], buffer);
    }
  });

  /**
   * @param {string} data
   * @param {string} encoding
   */
  function validateEncoding(data, encoding) {
    const normalizedEncoding = normalizeEncoding(encoding);
    const length = data.length;
    if (normalizedEncoding === 'hex' && length % 2 !== 0) {
      throw new ERR_INVALID_ARG_VALUE('encoding', encoding, `is invalid for data of length ${length}`);
    }
  }

  /**
   * Check that the port number is not NaN when coerced to a number,
   * is an integer and that it falls within the legal range of port numbers.
   * @param {*} port
   * @param {string} [name='Port']
   * @param {boolean} [allowZero=true]
   * @returns {number}
   */
  function validatePort(port, name = 'Port', allowZero = true) {
    if (typeof port !== 'number' && typeof port !== 'string' || typeof port === 'string' && StringPrototypeTrim(port).length === 0 || +port !== +port >>> 0 || port > 0xffff || port === 0 && !allowZero) {
      throw new ERR_SOCKET_BAD_PORT(name, port, allowZero);
    }
    return port | 0;
  }

  /**
   * @callback validateAbortSignal
   * @param {*} signal
   * @param {string} name
   */

  /** @type {validateAbortSignal} */
  const validateAbortSignal = hideStackFrames((signal, name) => {
    if (signal !== undefined && (signal === null || typeof signal !== 'object' || !('aborted' in signal))) {
      throw new ERR_INVALID_ARG_TYPE(name, 'AbortSignal', signal);
    }
  });

  /**
   * @callback validateFunction
   * @param {*} value
   * @param {string} name
   * @returns {asserts value is Function}
   */

  /** @type {validateFunction} */
  const validateFunction = hideStackFrames((value, name) => {
    if (typeof value !== 'function') throw new ERR_INVALID_ARG_TYPE(name, 'Function', value);
  });

  /**
   * @callback validatePlainFunction
   * @param {*} value
   * @param {string} name
   * @returns {asserts value is Function}
   */

  /** @type {validatePlainFunction} */
  const validatePlainFunction = hideStackFrames((value, name) => {
    if (typeof value !== 'function' || isAsyncFunction(value)) throw new ERR_INVALID_ARG_TYPE(name, 'Function', value);
  });

  /**
   * @callback validateUndefined
   * @param {*} value
   * @param {string} name
   * @returns {asserts value is undefined}
   */

  /** @type {validateUndefined} */
  const validateUndefined = hideStackFrames((value, name) => {
    if (value !== undefined) throw new ERR_INVALID_ARG_TYPE(name, 'undefined', value);
  });

  /**
   * @template T
   * @param {T} value
   * @param {string} name
   * @param {T[]} union
   */
  function validateUnion(value, name, union) {
    if (!ArrayPrototypeIncludes(union, value)) {
      throw new ERR_INVALID_ARG_TYPE(name, `('${ArrayPrototypeJoin(union, '|')}')`, value);
    }
  }
  validators = {
    isInt32,
    isUint32,
    parseFileMode,
    validateArray,
    validateBoolean,
    validateBuffer,
    validateEncoding,
    validateFunction,
    validateInt32,
    validateInteger,
    validateNumber,
    validateObject,
    validateOneOf,
    validatePlainFunction,
    validatePort,
    validateSignalName,
    validateString,
    validateUint32,
    validateUndefined,
    validateUnion,
    validateAbortSignal
  };
  return validators;
}

var endOfStreamExports = {};
var endOfStream = {
  get exports(){ return endOfStreamExports; },
  set exports(v){ endOfStreamExports = v; },
};

var process$4;
var hasRequiredProcess;
function requireProcess() {
  if (hasRequiredProcess) return process$4;
  hasRequiredProcess = 1;
  // for now just expose the builtin process global from node.js
  process$4 = commonjsGlobal.process;
  return process$4;
}

var utils;
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  const {
    Symbol,
    SymbolAsyncIterator,
    SymbolIterator
  } = requirePrimordials();
  const kDestroyed = Symbol('kDestroyed');
  const kIsErrored = Symbol('kIsErrored');
  const kIsReadable = Symbol('kIsReadable');
  const kIsDisturbed = Symbol('kIsDisturbed');
  function isReadableNodeStream(obj, strict = false) {
    var _obj$_readableState;
    return !!(obj && typeof obj.pipe === 'function' && typeof obj.on === 'function' && (!strict || typeof obj.pause === 'function' && typeof obj.resume === 'function') && (!obj._writableState || ((_obj$_readableState = obj._readableState) === null || _obj$_readableState === undefined ? undefined : _obj$_readableState.readable) !== false) && (
    // Duplex
    !obj._writableState || obj._readableState)
    // Writable has .pipe.
    );
  }

  function isWritableNodeStream(obj) {
    var _obj$_writableState;
    return !!(obj && typeof obj.write === 'function' && typeof obj.on === 'function' && (!obj._readableState || ((_obj$_writableState = obj._writableState) === null || _obj$_writableState === undefined ? undefined : _obj$_writableState.writable) !== false)
    // Duplex
    );
  }

  function isDuplexNodeStream(obj) {
    return !!(obj && typeof obj.pipe === 'function' && obj._readableState && typeof obj.on === 'function' && typeof obj.write === 'function');
  }
  function isNodeStream(obj) {
    return obj && (obj._readableState || obj._writableState || typeof obj.write === 'function' && typeof obj.on === 'function' || typeof obj.pipe === 'function' && typeof obj.on === 'function');
  }
  function isIterable(obj, isAsync) {
    if (obj == null) return false;
    if (isAsync === true) return typeof obj[SymbolAsyncIterator] === 'function';
    if (isAsync === false) return typeof obj[SymbolIterator] === 'function';
    return typeof obj[SymbolAsyncIterator] === 'function' || typeof obj[SymbolIterator] === 'function';
  }
  function isDestroyed(stream) {
    if (!isNodeStream(stream)) return null;
    const wState = stream._writableState;
    const rState = stream._readableState;
    const state = wState || rState;
    return !!(stream.destroyed || stream[kDestroyed] || state !== null && state !== undefined && state.destroyed);
  }

  // Have been end():d.
  function isWritableEnded(stream) {
    if (!isWritableNodeStream(stream)) return null;
    if (stream.writableEnded === true) return true;
    const wState = stream._writableState;
    if (wState !== null && wState !== undefined && wState.errored) return false;
    if (typeof (wState === null || wState === undefined ? undefined : wState.ended) !== 'boolean') return null;
    return wState.ended;
  }

  // Have emitted 'finish'.
  function isWritableFinished(stream, strict) {
    if (!isWritableNodeStream(stream)) return null;
    if (stream.writableFinished === true) return true;
    const wState = stream._writableState;
    if (wState !== null && wState !== undefined && wState.errored) return false;
    if (typeof (wState === null || wState === undefined ? undefined : wState.finished) !== 'boolean') return null;
    return !!(wState.finished || strict === false && wState.ended === true && wState.length === 0);
  }

  // Have been push(null):d.
  function isReadableEnded(stream) {
    if (!isReadableNodeStream(stream)) return null;
    if (stream.readableEnded === true) return true;
    const rState = stream._readableState;
    if (!rState || rState.errored) return false;
    if (typeof (rState === null || rState === undefined ? undefined : rState.ended) !== 'boolean') return null;
    return rState.ended;
  }

  // Have emitted 'end'.
  function isReadableFinished(stream, strict) {
    if (!isReadableNodeStream(stream)) return null;
    const rState = stream._readableState;
    if (rState !== null && rState !== undefined && rState.errored) return false;
    if (typeof (rState === null || rState === undefined ? undefined : rState.endEmitted) !== 'boolean') return null;
    return !!(rState.endEmitted || strict === false && rState.ended === true && rState.length === 0);
  }
  function isReadable(stream) {
    if (stream && stream[kIsReadable] != null) return stream[kIsReadable];
    if (typeof (stream === null || stream === undefined ? undefined : stream.readable) !== 'boolean') return null;
    if (isDestroyed(stream)) return false;
    return isReadableNodeStream(stream) && stream.readable && !isReadableFinished(stream);
  }
  function isWritable(stream) {
    if (typeof (stream === null || stream === undefined ? undefined : stream.writable) !== 'boolean') return null;
    if (isDestroyed(stream)) return false;
    return isWritableNodeStream(stream) && stream.writable && !isWritableEnded(stream);
  }
  function isFinished(stream, opts) {
    if (!isNodeStream(stream)) {
      return null;
    }
    if (isDestroyed(stream)) {
      return true;
    }
    if ((opts === null || opts === undefined ? undefined : opts.readable) !== false && isReadable(stream)) {
      return false;
    }
    if ((opts === null || opts === undefined ? undefined : opts.writable) !== false && isWritable(stream)) {
      return false;
    }
    return true;
  }
  function isWritableErrored(stream) {
    var _stream$_writableStat, _stream$_writableStat2;
    if (!isNodeStream(stream)) {
      return null;
    }
    if (stream.writableErrored) {
      return stream.writableErrored;
    }
    return (_stream$_writableStat = (_stream$_writableStat2 = stream._writableState) === null || _stream$_writableStat2 === undefined ? undefined : _stream$_writableStat2.errored) !== null && _stream$_writableStat !== undefined ? _stream$_writableStat : null;
  }
  function isReadableErrored(stream) {
    var _stream$_readableStat, _stream$_readableStat2;
    if (!isNodeStream(stream)) {
      return null;
    }
    if (stream.readableErrored) {
      return stream.readableErrored;
    }
    return (_stream$_readableStat = (_stream$_readableStat2 = stream._readableState) === null || _stream$_readableStat2 === undefined ? undefined : _stream$_readableStat2.errored) !== null && _stream$_readableStat !== undefined ? _stream$_readableStat : null;
  }
  function isClosed(stream) {
    if (!isNodeStream(stream)) {
      return null;
    }
    if (typeof stream.closed === 'boolean') {
      return stream.closed;
    }
    const wState = stream._writableState;
    const rState = stream._readableState;
    if (typeof (wState === null || wState === undefined ? undefined : wState.closed) === 'boolean' || typeof (rState === null || rState === undefined ? undefined : rState.closed) === 'boolean') {
      return (wState === null || wState === undefined ? undefined : wState.closed) || (rState === null || rState === undefined ? undefined : rState.closed);
    }
    if (typeof stream._closed === 'boolean' && isOutgoingMessage(stream)) {
      return stream._closed;
    }
    return null;
  }
  function isOutgoingMessage(stream) {
    return typeof stream._closed === 'boolean' && typeof stream._defaultKeepAlive === 'boolean' && typeof stream._removedConnection === 'boolean' && typeof stream._removedContLen === 'boolean';
  }
  function isServerResponse(stream) {
    return typeof stream._sent100 === 'boolean' && isOutgoingMessage(stream);
  }
  function isServerRequest(stream) {
    var _stream$req;
    return typeof stream._consuming === 'boolean' && typeof stream._dumped === 'boolean' && ((_stream$req = stream.req) === null || _stream$req === undefined ? undefined : _stream$req.upgradeOrConnect) === undefined;
  }
  function willEmitClose(stream) {
    if (!isNodeStream(stream)) return null;
    const wState = stream._writableState;
    const rState = stream._readableState;
    const state = wState || rState;
    return !state && isServerResponse(stream) || !!(state && state.autoDestroy && state.emitClose && state.closed === false);
  }
  function isDisturbed(stream) {
    var _stream$kIsDisturbed;
    return !!(stream && ((_stream$kIsDisturbed = stream[kIsDisturbed]) !== null && _stream$kIsDisturbed !== undefined ? _stream$kIsDisturbed : stream.readableDidRead || stream.readableAborted));
  }
  function isErrored(stream) {
    var _ref, _ref2, _ref3, _ref4, _ref5, _stream$kIsErrored, _stream$_readableStat3, _stream$_writableStat3, _stream$_readableStat4, _stream$_writableStat4;
    return !!(stream && ((_ref = (_ref2 = (_ref3 = (_ref4 = (_ref5 = (_stream$kIsErrored = stream[kIsErrored]) !== null && _stream$kIsErrored !== undefined ? _stream$kIsErrored : stream.readableErrored) !== null && _ref5 !== undefined ? _ref5 : stream.writableErrored) !== null && _ref4 !== undefined ? _ref4 : (_stream$_readableStat3 = stream._readableState) === null || _stream$_readableStat3 === undefined ? undefined : _stream$_readableStat3.errorEmitted) !== null && _ref3 !== undefined ? _ref3 : (_stream$_writableStat3 = stream._writableState) === null || _stream$_writableStat3 === undefined ? undefined : _stream$_writableStat3.errorEmitted) !== null && _ref2 !== undefined ? _ref2 : (_stream$_readableStat4 = stream._readableState) === null || _stream$_readableStat4 === undefined ? undefined : _stream$_readableStat4.errored) !== null && _ref !== undefined ? _ref : (_stream$_writableStat4 = stream._writableState) === null || _stream$_writableStat4 === undefined ? undefined : _stream$_writableStat4.errored));
  }
  utils = {
    kDestroyed,
    isDisturbed,
    kIsDisturbed,
    isErrored,
    kIsErrored,
    isReadable,
    kIsReadable,
    isClosed,
    isDestroyed,
    isDuplexNodeStream,
    isFinished,
    isIterable,
    isReadableNodeStream,
    isReadableEnded,
    isReadableFinished,
    isReadableErrored,
    isNodeStream,
    isWritable,
    isWritableNodeStream,
    isWritableEnded,
    isWritableFinished,
    isWritableErrored,
    isServerRequest,
    isServerResponse,
    willEmitClose
  };
  return utils;
}

/* replacement start */
var hasRequiredEndOfStream;
function requireEndOfStream() {
  if (hasRequiredEndOfStream) return endOfStreamExports;
  hasRequiredEndOfStream = 1;
  const process = requireProcess()

  /* replacement end */
  // Ported from https://github.com/mafintosh/end-of-stream with
  // permission from the author, Mathias Buus (@mafintosh).
  ;
  const {
    AbortError,
    codes
  } = requireErrors();
  const {
    ERR_INVALID_ARG_TYPE,
    ERR_STREAM_PREMATURE_CLOSE
  } = codes;
  const {
    kEmptyObject,
    once
  } = requireUtil();
  const {
    validateAbortSignal,
    validateFunction,
    validateObject
  } = requireValidators();
  const {
    Promise
  } = requirePrimordials();
  const {
    isClosed,
    isReadable,
    isReadableNodeStream,
    isReadableFinished,
    isReadableErrored,
    isWritable,
    isWritableNodeStream,
    isWritableFinished,
    isWritableErrored,
    isNodeStream,
    willEmitClose: _willEmitClose
  } = requireUtils();
  function isRequest(stream) {
    return stream.setHeader && typeof stream.abort === 'function';
  }
  const nop = () => {};
  function eos(stream, options, callback) {
    var _options$readable, _options$writable;
    if (arguments.length === 2) {
      callback = options;
      options = kEmptyObject;
    } else if (options == null) {
      options = kEmptyObject;
    } else {
      validateObject(options, 'options');
    }
    validateFunction(callback, 'callback');
    validateAbortSignal(options.signal, 'options.signal');
    callback = once(callback);
    const readable = (_options$readable = options.readable) !== null && _options$readable !== undefined ? _options$readable : isReadableNodeStream(stream);
    const writable = (_options$writable = options.writable) !== null && _options$writable !== undefined ? _options$writable : isWritableNodeStream(stream);
    if (!isNodeStream(stream)) {
      // TODO: Webstreams.
      throw new ERR_INVALID_ARG_TYPE('stream', 'Stream', stream);
    }
    const wState = stream._writableState;
    const rState = stream._readableState;
    const onlegacyfinish = () => {
      if (!stream.writable) {
        onfinish();
      }
    };

    // TODO (ronag): Improve soft detection to include core modules and
    // common ecosystem modules that do properly emit 'close' but fail
    // this generic check.
    let willEmitClose = _willEmitClose(stream) && isReadableNodeStream(stream) === readable && isWritableNodeStream(stream) === writable;
    let writableFinished = isWritableFinished(stream, false);
    const onfinish = () => {
      writableFinished = true;
      // Stream should not be destroyed here. If it is that
      // means that user space is doing something differently and
      // we cannot trust willEmitClose.
      if (stream.destroyed) {
        willEmitClose = false;
      }
      if (willEmitClose && (!stream.readable || readable)) {
        return;
      }
      if (!readable || readableFinished) {
        callback.call(stream);
      }
    };
    let readableFinished = isReadableFinished(stream, false);
    const onend = () => {
      readableFinished = true;
      // Stream should not be destroyed here. If it is that
      // means that user space is doing something differently and
      // we cannot trust willEmitClose.
      if (stream.destroyed) {
        willEmitClose = false;
      }
      if (willEmitClose && (!stream.writable || writable)) {
        return;
      }
      if (!writable || writableFinished) {
        callback.call(stream);
      }
    };
    const onerror = err => {
      callback.call(stream, err);
    };
    let closed = isClosed(stream);
    const onclose = () => {
      closed = true;
      const errored = isWritableErrored(stream) || isReadableErrored(stream);
      if (errored && typeof errored !== 'boolean') {
        return callback.call(stream, errored);
      }
      if (readable && !readableFinished && isReadableNodeStream(stream, true)) {
        if (!isReadableFinished(stream, false)) return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE());
      }
      if (writable && !writableFinished) {
        if (!isWritableFinished(stream, false)) return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE());
      }
      callback.call(stream);
    };
    const onrequest = () => {
      stream.req.on('finish', onfinish);
    };
    if (isRequest(stream)) {
      stream.on('complete', onfinish);
      if (!willEmitClose) {
        stream.on('abort', onclose);
      }
      if (stream.req) {
        onrequest();
      } else {
        stream.on('request', onrequest);
      }
    } else if (writable && !wState) {
      // legacy streams
      stream.on('end', onlegacyfinish);
      stream.on('close', onlegacyfinish);
    }

    // Not all streams will emit 'close' after 'aborted'.
    if (!willEmitClose && typeof stream.aborted === 'boolean') {
      stream.on('aborted', onclose);
    }
    stream.on('end', onend);
    stream.on('finish', onfinish);
    if (options.error !== false) {
      stream.on('error', onerror);
    }
    stream.on('close', onclose);
    if (closed) {
      process.nextTick(onclose);
    } else if (wState !== null && wState !== undefined && wState.errorEmitted || rState !== null && rState !== undefined && rState.errorEmitted) {
      if (!willEmitClose) {
        process.nextTick(onclose);
      }
    } else if (!readable && (!willEmitClose || isReadable(stream)) && (writableFinished || isWritable(stream) === false)) {
      process.nextTick(onclose);
    } else if (!writable && (!willEmitClose || isWritable(stream)) && (readableFinished || isReadable(stream) === false)) {
      process.nextTick(onclose);
    } else if (rState && stream.req && stream.aborted) {
      process.nextTick(onclose);
    }
    const cleanup = () => {
      callback = nop;
      stream.removeListener('aborted', onclose);
      stream.removeListener('complete', onfinish);
      stream.removeListener('abort', onclose);
      stream.removeListener('request', onrequest);
      if (stream.req) stream.req.removeListener('finish', onfinish);
      stream.removeListener('end', onlegacyfinish);
      stream.removeListener('close', onlegacyfinish);
      stream.removeListener('finish', onfinish);
      stream.removeListener('end', onend);
      stream.removeListener('error', onerror);
      stream.removeListener('close', onclose);
    };
    if (options.signal && !closed) {
      const abort = () => {
        // Keep it because cleanup removes it.
        const endCallback = callback;
        cleanup();
        endCallback.call(stream, new AbortError(undefined, {
          cause: options.signal.reason
        }));
      };
      if (options.signal.aborted) {
        process.nextTick(abort);
      } else {
        const originalCallback = callback;
        callback = once((...args) => {
          options.signal.removeEventListener('abort', abort);
          originalCallback.apply(stream, args);
        });
        options.signal.addEventListener('abort', abort);
      }
    }
    return cleanup;
  }
  function finished(stream, opts) {
    return new Promise((resolve, reject) => {
      eos(stream, opts, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  endOfStream.exports = eos;
  endOfStreamExports.finished = finished;
  return endOfStreamExports;
}

var hasRequiredOperators;
function requireOperators() {
  if (hasRequiredOperators) return operators;
  hasRequiredOperators = 1;
  const AbortController = globalThis.AbortController || requireAbortController().AbortController;
  const {
    codes: {
      ERR_INVALID_ARG_TYPE,
      ERR_MISSING_ARGS,
      ERR_OUT_OF_RANGE
    },
    AbortError
  } = requireErrors();
  const {
    validateAbortSignal,
    validateInteger,
    validateObject
  } = requireValidators();
  const kWeakHandler = requirePrimordials().Symbol('kWeak');
  const {
    finished
  } = requireEndOfStream();
  const {
    ArrayPrototypePush,
    MathFloor,
    Number,
    NumberIsNaN,
    Promise,
    PromiseReject,
    PromisePrototypeThen,
    Symbol
  } = requirePrimordials();
  const kEmpty = Symbol('kEmpty');
  const kEof = Symbol('kEof');
  function map(fn, options) {
    if (typeof fn !== 'function') {
      throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn);
    }
    if (options != null) {
      validateObject(options, 'options');
    }
    if ((options === null || options === undefined ? undefined : options.signal) != null) {
      validateAbortSignal(options.signal, 'options.signal');
    }
    let concurrency = 1;
    if ((options === null || options === undefined ? undefined : options.concurrency) != null) {
      concurrency = MathFloor(options.concurrency);
    }
    validateInteger(concurrency, 'concurrency', 1);
    return async function* map() {
      var _options$signal, _options$signal2;
      const ac = new AbortController();
      const stream = this;
      const queue = [];
      const signal = ac.signal;
      const signalOpt = {
        signal
      };
      const abort = () => ac.abort();
      if (options !== null && options !== undefined && (_options$signal = options.signal) !== null && _options$signal !== undefined && _options$signal.aborted) {
        abort();
      }
      options === null || options === undefined ? undefined : (_options$signal2 = options.signal) === null || _options$signal2 === undefined ? undefined : _options$signal2.addEventListener('abort', abort);
      let next;
      let resume;
      let done = false;
      function onDone() {
        done = true;
      }
      async function pump() {
        try {
          for await (let val of stream) {
            var _val;
            if (done) {
              return;
            }
            if (signal.aborted) {
              throw new AbortError();
            }
            try {
              val = fn(val, signalOpt);
            } catch (err) {
              val = PromiseReject(err);
            }
            if (val === kEmpty) {
              continue;
            }
            if (typeof ((_val = val) === null || _val === undefined ? undefined : _val.catch) === 'function') {
              val.catch(onDone);
            }
            queue.push(val);
            if (next) {
              next();
              next = null;
            }
            if (!done && queue.length && queue.length >= concurrency) {
              await new Promise(resolve => {
                resume = resolve;
              });
            }
          }
          queue.push(kEof);
        } catch (err) {
          const val = PromiseReject(err);
          PromisePrototypeThen(val, undefined, onDone);
          queue.push(val);
        } finally {
          var _options$signal3;
          done = true;
          if (next) {
            next();
            next = null;
          }
          options === null || options === undefined ? undefined : (_options$signal3 = options.signal) === null || _options$signal3 === undefined ? undefined : _options$signal3.removeEventListener('abort', abort);
        }
      }
      pump();
      try {
        while (true) {
          while (queue.length > 0) {
            const val = await queue[0];
            if (val === kEof) {
              return;
            }
            if (signal.aborted) {
              throw new AbortError();
            }
            if (val !== kEmpty) {
              yield val;
            }
            queue.shift();
            if (resume) {
              resume();
              resume = null;
            }
          }
          await new Promise(resolve => {
            next = resolve;
          });
        }
      } finally {
        ac.abort();
        done = true;
        if (resume) {
          resume();
          resume = null;
        }
      }
    }.call(this);
  }
  function asIndexedPairs(options = undefined) {
    if (options != null) {
      validateObject(options, 'options');
    }
    if ((options === null || options === undefined ? undefined : options.signal) != null) {
      validateAbortSignal(options.signal, 'options.signal');
    }
    return async function* asIndexedPairs() {
      let index = 0;
      for await (const val of this) {
        var _options$signal4;
        if (options !== null && options !== undefined && (_options$signal4 = options.signal) !== null && _options$signal4 !== undefined && _options$signal4.aborted) {
          throw new AbortError({
            cause: options.signal.reason
          });
        }
        yield [index++, val];
      }
    }.call(this);
  }
  async function some(fn, options = undefined) {
    for await (const unused of filter.call(this, fn, options)) {
      return true;
    }
    return false;
  }
  async function every(fn, options = undefined) {
    if (typeof fn !== 'function') {
      throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn);
    }
    // https://en.wikipedia.org/wiki/De_Morgan%27s_laws
    return !(await some.call(this, async (...args) => {
      return !(await fn(...args));
    }, options));
  }
  async function find(fn, options) {
    for await (const result of filter.call(this, fn, options)) {
      return result;
    }
    return undefined;
  }
  async function forEach(fn, options) {
    if (typeof fn !== 'function') {
      throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn);
    }
    async function forEachFn(value, options) {
      await fn(value, options);
      return kEmpty;
    }
    // eslint-disable-next-line no-unused-vars
    for await (const unused of map.call(this, forEachFn, options));
  }
  function filter(fn, options) {
    if (typeof fn !== 'function') {
      throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn);
    }
    async function filterFn(value, options) {
      if (await fn(value, options)) {
        return value;
      }
      return kEmpty;
    }
    return map.call(this, filterFn, options);
  }

  // Specific to provide better error to reduce since the argument is only
  // missing if the stream has no items in it - but the code is still appropriate
  class ReduceAwareErrMissingArgs extends ERR_MISSING_ARGS {
    constructor() {
      super('reduce');
      this.message = 'Reduce of an empty stream requires an initial value';
    }
  }
  async function reduce(reducer, initialValue, options) {
    var _options$signal5;
    if (typeof reducer !== 'function') {
      throw new ERR_INVALID_ARG_TYPE('reducer', ['Function', 'AsyncFunction'], reducer);
    }
    if (options != null) {
      validateObject(options, 'options');
    }
    if ((options === null || options === undefined ? undefined : options.signal) != null) {
      validateAbortSignal(options.signal, 'options.signal');
    }
    let hasInitialValue = arguments.length > 1;
    if (options !== null && options !== undefined && (_options$signal5 = options.signal) !== null && _options$signal5 !== undefined && _options$signal5.aborted) {
      const err = new AbortError(undefined, {
        cause: options.signal.reason
      });
      this.once('error', () => {}); // The error is already propagated
      await finished(this.destroy(err));
      throw err;
    }
    const ac = new AbortController();
    const signal = ac.signal;
    if (options !== null && options !== undefined && options.signal) {
      const opts = {
        once: true,
        [kWeakHandler]: this
      };
      options.signal.addEventListener('abort', () => ac.abort(), opts);
    }
    let gotAnyItemFromStream = false;
    try {
      for await (const value of this) {
        var _options$signal6;
        gotAnyItemFromStream = true;
        if (options !== null && options !== undefined && (_options$signal6 = options.signal) !== null && _options$signal6 !== undefined && _options$signal6.aborted) {
          throw new AbortError();
        }
        if (!hasInitialValue) {
          initialValue = value;
          hasInitialValue = true;
        } else {
          initialValue = await reducer(initialValue, value, {
            signal
          });
        }
      }
      if (!gotAnyItemFromStream && !hasInitialValue) {
        throw new ReduceAwareErrMissingArgs();
      }
    } finally {
      ac.abort();
    }
    return initialValue;
  }
  async function toArray(options) {
    if (options != null) {
      validateObject(options, 'options');
    }
    if ((options === null || options === undefined ? undefined : options.signal) != null) {
      validateAbortSignal(options.signal, 'options.signal');
    }
    const result = [];
    for await (const val of this) {
      var _options$signal7;
      if (options !== null && options !== undefined && (_options$signal7 = options.signal) !== null && _options$signal7 !== undefined && _options$signal7.aborted) {
        throw new AbortError(undefined, {
          cause: options.signal.reason
        });
      }
      ArrayPrototypePush(result, val);
    }
    return result;
  }
  function flatMap(fn, options) {
    const values = map.call(this, fn, options);
    return async function* flatMap() {
      for await (const val of values) {
        yield* val;
      }
    }.call(this);
  }
  function toIntegerOrInfinity(number) {
    // We coerce here to align with the spec
    // https://github.com/tc39/proposal-iterator-helpers/issues/169
    number = Number(number);
    if (NumberIsNaN(number)) {
      return 0;
    }
    if (number < 0) {
      throw new ERR_OUT_OF_RANGE('number', '>= 0', number);
    }
    return number;
  }
  function drop(number, options = undefined) {
    if (options != null) {
      validateObject(options, 'options');
    }
    if ((options === null || options === undefined ? undefined : options.signal) != null) {
      validateAbortSignal(options.signal, 'options.signal');
    }
    number = toIntegerOrInfinity(number);
    return async function* drop() {
      var _options$signal8;
      if (options !== null && options !== undefined && (_options$signal8 = options.signal) !== null && _options$signal8 !== undefined && _options$signal8.aborted) {
        throw new AbortError();
      }
      for await (const val of this) {
        var _options$signal9;
        if (options !== null && options !== undefined && (_options$signal9 = options.signal) !== null && _options$signal9 !== undefined && _options$signal9.aborted) {
          throw new AbortError();
        }
        if (number-- <= 0) {
          yield val;
        }
      }
    }.call(this);
  }
  function take(number, options = undefined) {
    if (options != null) {
      validateObject(options, 'options');
    }
    if ((options === null || options === undefined ? undefined : options.signal) != null) {
      validateAbortSignal(options.signal, 'options.signal');
    }
    number = toIntegerOrInfinity(number);
    return async function* take() {
      var _options$signal10;
      if (options !== null && options !== undefined && (_options$signal10 = options.signal) !== null && _options$signal10 !== undefined && _options$signal10.aborted) {
        throw new AbortError();
      }
      for await (const val of this) {
        var _options$signal11;
        if (options !== null && options !== undefined && (_options$signal11 = options.signal) !== null && _options$signal11 !== undefined && _options$signal11.aborted) {
          throw new AbortError();
        }
        if (number-- > 0) {
          yield val;
        } else {
          return;
        }
      }
    }.call(this);
  }
  operators.streamReturningOperators = {
    asIndexedPairs,
    drop,
    filter,
    flatMap,
    map,
    take
  };
  operators.promiseReturningOperators = {
    every,
    forEach,
    reduce,
    toArray,
    some,
    find
  };
  return operators;
}

var destroy_1;
var hasRequiredDestroy;
function requireDestroy() {
  if (hasRequiredDestroy) return destroy_1;
  hasRequiredDestroy = 1;

  /* replacement start */

  const process = requireProcess();

  /* replacement end */

  const {
    aggregateTwoErrors,
    codes: {
      ERR_MULTIPLE_CALLBACK
    },
    AbortError
  } = requireErrors();
  const {
    Symbol
  } = requirePrimordials();
  const {
    kDestroyed,
    isDestroyed,
    isFinished,
    isServerRequest
  } = requireUtils();
  const kDestroy = Symbol('kDestroy');
  const kConstruct = Symbol('kConstruct');
  function checkError(err, w, r) {
    if (err) {
      // Avoid V8 leak, https://github.com/nodejs/node/pull/34103#issuecomment-652002364
      err.stack; // eslint-disable-line no-unused-expressions

      if (w && !w.errored) {
        w.errored = err;
      }
      if (r && !r.errored) {
        r.errored = err;
      }
    }
  }

  // Backwards compat. cb() is undocumented and unused in core but
  // unfortunately might be used by modules.
  function destroy(err, cb) {
    const r = this._readableState;
    const w = this._writableState;
    // With duplex streams we use the writable side for state.
    const s = w || r;
    if (w && w.destroyed || r && r.destroyed) {
      if (typeof cb === 'function') {
        cb();
      }
      return this;
    }

    // We set destroyed to true before firing error callbacks in order
    // to make it re-entrance safe in case destroy() is called within callbacks
    checkError(err, w, r);
    if (w) {
      w.destroyed = true;
    }
    if (r) {
      r.destroyed = true;
    }

    // If still constructing then defer calling _destroy.
    if (!s.constructed) {
      this.once(kDestroy, function (er) {
        _destroy(this, aggregateTwoErrors(er, err), cb);
      });
    } else {
      _destroy(this, err, cb);
    }
    return this;
  }
  function _destroy(self, err, cb) {
    let called = false;
    function onDestroy(err) {
      if (called) {
        return;
      }
      called = true;
      const r = self._readableState;
      const w = self._writableState;
      checkError(err, w, r);
      if (w) {
        w.closed = true;
      }
      if (r) {
        r.closed = true;
      }
      if (typeof cb === 'function') {
        cb(err);
      }
      if (err) {
        process.nextTick(emitErrorCloseNT, self, err);
      } else {
        process.nextTick(emitCloseNT, self);
      }
    }
    try {
      self._destroy(err || null, onDestroy);
    } catch (err) {
      onDestroy(err);
    }
  }
  function emitErrorCloseNT(self, err) {
    emitErrorNT(self, err);
    emitCloseNT(self);
  }
  function emitCloseNT(self) {
    const r = self._readableState;
    const w = self._writableState;
    if (w) {
      w.closeEmitted = true;
    }
    if (r) {
      r.closeEmitted = true;
    }
    if (w && w.emitClose || r && r.emitClose) {
      self.emit('close');
    }
  }
  function emitErrorNT(self, err) {
    const r = self._readableState;
    const w = self._writableState;
    if (w && w.errorEmitted || r && r.errorEmitted) {
      return;
    }
    if (w) {
      w.errorEmitted = true;
    }
    if (r) {
      r.errorEmitted = true;
    }
    self.emit('error', err);
  }
  function undestroy() {
    const r = this._readableState;
    const w = this._writableState;
    if (r) {
      r.constructed = true;
      r.closed = false;
      r.closeEmitted = false;
      r.destroyed = false;
      r.errored = null;
      r.errorEmitted = false;
      r.reading = false;
      r.ended = r.readable === false;
      r.endEmitted = r.readable === false;
    }
    if (w) {
      w.constructed = true;
      w.destroyed = false;
      w.closed = false;
      w.closeEmitted = false;
      w.errored = null;
      w.errorEmitted = false;
      w.finalCalled = false;
      w.prefinished = false;
      w.ended = w.writable === false;
      w.ending = w.writable === false;
      w.finished = w.writable === false;
    }
  }
  function errorOrDestroy(stream, err, sync) {
    // We have tests that rely on errors being emitted
    // in the same tick, so changing this is semver major.
    // For now when you opt-in to autoDestroy we allow
    // the error to be emitted nextTick. In a future
    // semver major update we should change the default to this.

    const r = stream._readableState;
    const w = stream._writableState;
    if (w && w.destroyed || r && r.destroyed) {
      return this;
    }
    if (r && r.autoDestroy || w && w.autoDestroy) stream.destroy(err);else if (err) {
      // Avoid V8 leak, https://github.com/nodejs/node/pull/34103#issuecomment-652002364
      err.stack; // eslint-disable-line no-unused-expressions

      if (w && !w.errored) {
        w.errored = err;
      }
      if (r && !r.errored) {
        r.errored = err;
      }
      if (sync) {
        process.nextTick(emitErrorNT, stream, err);
      } else {
        emitErrorNT(stream, err);
      }
    }
  }
  function construct(stream, cb) {
    if (typeof stream._construct !== 'function') {
      return;
    }
    const r = stream._readableState;
    const w = stream._writableState;
    if (r) {
      r.constructed = false;
    }
    if (w) {
      w.constructed = false;
    }
    stream.once(kConstruct, cb);
    if (stream.listenerCount(kConstruct) > 1) {
      // Duplex
      return;
    }
    process.nextTick(constructNT, stream);
  }
  function constructNT(stream) {
    let called = false;
    function onConstruct(err) {
      if (called) {
        errorOrDestroy(stream, err !== null && err !== undefined ? err : new ERR_MULTIPLE_CALLBACK());
        return;
      }
      called = true;
      const r = stream._readableState;
      const w = stream._writableState;
      const s = w || r;
      if (r) {
        r.constructed = true;
      }
      if (w) {
        w.constructed = true;
      }
      if (s.destroyed) {
        stream.emit(kDestroy, err);
      } else if (err) {
        errorOrDestroy(stream, err, true);
      } else {
        process.nextTick(emitConstructNT, stream);
      }
    }
    try {
      stream._construct(onConstruct);
    } catch (err) {
      onConstruct(err);
    }
  }
  function emitConstructNT(stream) {
    stream.emit(kConstruct);
  }
  function isRequest(stream) {
    return stream && stream.setHeader && typeof stream.abort === 'function';
  }
  function emitCloseLegacy(stream) {
    stream.emit('close');
  }
  function emitErrorCloseLegacy(stream, err) {
    stream.emit('error', err);
    process.nextTick(emitCloseLegacy, stream);
  }

  // Normalize destroy for legacy.
  function destroyer(stream, err) {
    if (!stream || isDestroyed(stream)) {
      return;
    }
    if (!err && !isFinished(stream)) {
      err = new AbortError();
    }

    // TODO: Remove isRequest branches.
    if (isServerRequest(stream)) {
      stream.socket = null;
      stream.destroy(err);
    } else if (isRequest(stream)) {
      stream.abort();
    } else if (isRequest(stream.req)) {
      stream.req.abort();
    } else if (typeof stream.destroy === 'function') {
      stream.destroy(err);
    } else if (typeof stream.close === 'function') {
      // TODO: Don't lose err?
      stream.close();
    } else if (err) {
      process.nextTick(emitErrorCloseLegacy, stream, err);
    } else {
      process.nextTick(emitCloseLegacy, stream);
    }
    if (!stream.destroyed) {
      stream[kDestroyed] = true;
    }
  }
  destroy_1 = {
    construct,
    destroyer,
    destroy,
    undestroy,
    errorOrDestroy
  };
  return destroy_1;
}

var legacy;
var hasRequiredLegacy;
function requireLegacy() {
  if (hasRequiredLegacy) return legacy;
  hasRequiredLegacy = 1;
  const {
    ArrayIsArray,
    ObjectSetPrototypeOf
  } = requirePrimordials();
  const {
    EventEmitter: EE
  } = require$$2;
  function Stream(opts) {
    EE.call(this, opts);
  }
  ObjectSetPrototypeOf(Stream.prototype, EE.prototype);
  ObjectSetPrototypeOf(Stream, EE);
  Stream.prototype.pipe = function (dest, options) {
    const source = this;
    function ondata(chunk) {
      if (dest.writable && dest.write(chunk) === false && source.pause) {
        source.pause();
      }
    }
    source.on('data', ondata);
    function ondrain() {
      if (source.readable && source.resume) {
        source.resume();
      }
    }
    dest.on('drain', ondrain);

    // If the 'end' option is not supplied, dest.end() will be called when
    // source gets the 'end' or 'close' events.  Only dest.end() once.
    if (!dest._isStdio && (!options || options.end !== false)) {
      source.on('end', onend);
      source.on('close', onclose);
    }
    let didOnEnd = false;
    function onend() {
      if (didOnEnd) return;
      didOnEnd = true;
      dest.end();
    }
    function onclose() {
      if (didOnEnd) return;
      didOnEnd = true;
      if (typeof dest.destroy === 'function') dest.destroy();
    }

    // Don't leave dangling pipes when there are errors.
    function onerror(er) {
      cleanup();
      if (EE.listenerCount(this, 'error') === 0) {
        this.emit('error', er);
      }
    }
    prependListener(source, 'error', onerror);
    prependListener(dest, 'error', onerror);

    // Remove all the event listeners that were added.
    function cleanup() {
      source.removeListener('data', ondata);
      dest.removeListener('drain', ondrain);
      source.removeListener('end', onend);
      source.removeListener('close', onclose);
      source.removeListener('error', onerror);
      dest.removeListener('error', onerror);
      source.removeListener('end', cleanup);
      source.removeListener('close', cleanup);
      dest.removeListener('close', cleanup);
    }
    source.on('end', cleanup);
    source.on('close', cleanup);
    dest.on('close', cleanup);
    dest.emit('pipe', source);

    // Allow for unix-like usage: A.pipe(B).pipe(C)
    return dest;
  };
  function prependListener(emitter, event, fn) {
    // Sadly this is not cacheable as some libraries bundle their own
    // event emitter implementation with them.
    if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (ArrayIsArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
  }
  legacy = {
    Stream,
    prependListener
  };
  return legacy;
}

var addAbortSignalExports = {};
var addAbortSignal = {
  get exports(){ return addAbortSignalExports; },
  set exports(v){ addAbortSignalExports = v; },
};

var hasRequiredAddAbortSignal;
function requireAddAbortSignal() {
  if (hasRequiredAddAbortSignal) return addAbortSignalExports;
  hasRequiredAddAbortSignal = 1;
  (function (module) {

    const {
      AbortError,
      codes
    } = requireErrors();
    const eos = requireEndOfStream();
    const {
      ERR_INVALID_ARG_TYPE
    } = codes;

    // This method is inlined here for readable-stream
    // It also does not allow for signal to not exist on the stream
    // https://github.com/nodejs/node/pull/36061#discussion_r533718029
    const validateAbortSignal = (signal, name) => {
      if (typeof signal !== 'object' || !('aborted' in signal)) {
        throw new ERR_INVALID_ARG_TYPE(name, 'AbortSignal', signal);
      }
    };
    function isNodeStream(obj) {
      return !!(obj && typeof obj.pipe === 'function');
    }
    module.exports.addAbortSignal = function addAbortSignal(signal, stream) {
      validateAbortSignal(signal, 'signal');
      if (!isNodeStream(stream)) {
        throw new ERR_INVALID_ARG_TYPE('stream', 'stream.Stream', stream);
      }
      return module.exports.addAbortSignalNoValidate(signal, stream);
    };
    module.exports.addAbortSignalNoValidate = function (signal, stream) {
      if (typeof signal !== 'object' || !('aborted' in signal)) {
        return stream;
      }
      const onAbort = () => {
        stream.destroy(new AbortError(undefined, {
          cause: signal.reason
        }));
      };
      if (signal.aborted) {
        onAbort();
      } else {
        signal.addEventListener('abort', onAbort);
        eos(stream, () => signal.removeEventListener('abort', onAbort));
      }
      return stream;
    };
  })(addAbortSignal);
  return addAbortSignalExports;
}

var buffer_list;
var hasRequiredBuffer_list;
function requireBuffer_list() {
  if (hasRequiredBuffer_list) return buffer_list;
  hasRequiredBuffer_list = 1;
  const {
    StringPrototypeSlice,
    SymbolIterator,
    TypedArrayPrototypeSet,
    Uint8Array
  } = requirePrimordials();
  const {
    Buffer
  } = require$$4;
  const {
    inspect
  } = requireUtil();
  buffer_list = class BufferList {
    constructor() {
      this.head = null;
      this.tail = null;
      this.length = 0;
    }
    push(v) {
      const entry = {
        data: v,
        next: null
      };
      if (this.length > 0) this.tail.next = entry;else this.head = entry;
      this.tail = entry;
      ++this.length;
    }
    unshift(v) {
      const entry = {
        data: v,
        next: this.head
      };
      if (this.length === 0) this.tail = entry;
      this.head = entry;
      ++this.length;
    }
    shift() {
      if (this.length === 0) return;
      const ret = this.head.data;
      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
      --this.length;
      return ret;
    }
    clear() {
      this.head = this.tail = null;
      this.length = 0;
    }
    join(s) {
      if (this.length === 0) return '';
      let p = this.head;
      let ret = '' + p.data;
      while ((p = p.next) !== null) ret += s + p.data;
      return ret;
    }
    concat(n) {
      if (this.length === 0) return Buffer.alloc(0);
      const ret = Buffer.allocUnsafe(n >>> 0);
      let p = this.head;
      let i = 0;
      while (p) {
        TypedArrayPrototypeSet(ret, p.data, i);
        i += p.data.length;
        p = p.next;
      }
      return ret;
    }

    // Consumes a specified amount of bytes or characters from the buffered data.
    consume(n, hasStrings) {
      const data = this.head.data;
      if (n < data.length) {
        // `slice` is the same for buffers and strings.
        const slice = data.slice(0, n);
        this.head.data = data.slice(n);
        return slice;
      }
      if (n === data.length) {
        // First chunk is a perfect match.
        return this.shift();
      }
      // Result spans more than one buffer.
      return hasStrings ? this._getString(n) : this._getBuffer(n);
    }
    first() {
      return this.head.data;
    }
    *[SymbolIterator]() {
      for (let p = this.head; p; p = p.next) {
        yield p.data;
      }
    }

    // Consumes a specified amount of characters from the buffered data.
    _getString(n) {
      let ret = '';
      let p = this.head;
      let c = 0;
      do {
        const str = p.data;
        if (n > str.length) {
          ret += str;
          n -= str.length;
        } else {
          if (n === str.length) {
            ret += str;
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            ret += StringPrototypeSlice(str, 0, n);
            this.head = p;
            p.data = StringPrototypeSlice(str, n);
          }
          break;
        }
        ++c;
      } while ((p = p.next) !== null);
      this.length -= c;
      return ret;
    }

    // Consumes a specified amount of bytes from the buffered data.
    _getBuffer(n) {
      const ret = Buffer.allocUnsafe(n);
      const retLen = n;
      let p = this.head;
      let c = 0;
      do {
        const buf = p.data;
        if (n > buf.length) {
          TypedArrayPrototypeSet(ret, buf, retLen - n);
          n -= buf.length;
        } else {
          if (n === buf.length) {
            TypedArrayPrototypeSet(ret, buf, retLen - n);
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            TypedArrayPrototypeSet(ret, new Uint8Array(buf.buffer, buf.byteOffset, n), retLen - n);
            this.head = p;
            p.data = buf.slice(n);
          }
          break;
        }
        ++c;
      } while ((p = p.next) !== null);
      this.length -= c;
      return ret;
    }

    // Make sure the linked list only shows the minimal necessary information.
    [Symbol.for('nodejs.util.inspect.custom')](_, options) {
      return inspect(this, {
        ...options,
        // Only inspect one level.
        depth: 0,
        // It should not recurse.
        customInspect: false
      });
    }
  };
  return buffer_list;
}

var state;
var hasRequiredState;
function requireState() {
  if (hasRequiredState) return state;
  hasRequiredState = 1;
  const {
    MathFloor,
    NumberIsInteger
  } = requirePrimordials();
  const {
    ERR_INVALID_ARG_VALUE
  } = requireErrors().codes;
  function highWaterMarkFrom(options, isDuplex, duplexKey) {
    return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
  }
  function getDefaultHighWaterMark(objectMode) {
    return objectMode ? 16 : 16 * 1024;
  }
  function getHighWaterMark(state, options, duplexKey, isDuplex) {
    const hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
    if (hwm != null) {
      if (!NumberIsInteger(hwm) || hwm < 0) {
        const name = isDuplex ? `options.${duplexKey}` : 'options.highWaterMark';
        throw new ERR_INVALID_ARG_VALUE(name, hwm);
      }
      return MathFloor(hwm);
    }

    // Default value
    return getDefaultHighWaterMark(state.objectMode);
  }
  state = {
    getHighWaterMark,
    getDefaultHighWaterMark
  };
  return state;
}

var from_1;
var hasRequiredFrom;
function requireFrom() {
  if (hasRequiredFrom) return from_1;
  hasRequiredFrom = 1;

  /* replacement start */

  const process = requireProcess();

  /* replacement end */

  const {
    PromisePrototypeThen,
    SymbolAsyncIterator,
    SymbolIterator
  } = requirePrimordials();
  const {
    Buffer
  } = require$$4;
  const {
    ERR_INVALID_ARG_TYPE,
    ERR_STREAM_NULL_VALUES
  } = requireErrors().codes;
  function from(Readable, iterable, opts) {
    let iterator;
    if (typeof iterable === 'string' || iterable instanceof Buffer) {
      return new Readable({
        objectMode: true,
        ...opts,
        read() {
          this.push(iterable);
          this.push(null);
        }
      });
    }
    let isAsync;
    if (iterable && iterable[SymbolAsyncIterator]) {
      isAsync = true;
      iterator = iterable[SymbolAsyncIterator]();
    } else if (iterable && iterable[SymbolIterator]) {
      isAsync = false;
      iterator = iterable[SymbolIterator]();
    } else {
      throw new ERR_INVALID_ARG_TYPE('iterable', ['Iterable'], iterable);
    }
    const readable = new Readable({
      objectMode: true,
      highWaterMark: 1,
      // TODO(ronag): What options should be allowed?
      ...opts
    });

    // Flag to protect against _read
    // being called before last iteration completion.
    let reading = false;
    readable._read = function () {
      if (!reading) {
        reading = true;
        next();
      }
    };
    readable._destroy = function (error, cb) {
      PromisePrototypeThen(close(error), () => process.nextTick(cb, error),
      // nextTick is here in case cb throws
      e => process.nextTick(cb, e || error));
    };
    async function close(error) {
      const hadError = error !== undefined && error !== null;
      const hasThrow = typeof iterator.throw === 'function';
      if (hadError && hasThrow) {
        const {
          value,
          done
        } = await iterator.throw(error);
        await value;
        if (done) {
          return;
        }
      }
      if (typeof iterator.return === 'function') {
        const {
          value
        } = await iterator.return();
        await value;
      }
    }
    async function next() {
      for (;;) {
        try {
          const {
            value,
            done
          } = isAsync ? await iterator.next() : iterator.next();
          if (done) {
            readable.push(null);
          } else {
            const res = value && typeof value.then === 'function' ? await value : value;
            if (res === null) {
              reading = false;
              throw new ERR_STREAM_NULL_VALUES();
            } else if (readable.push(res)) {
              continue;
            } else {
              reading = false;
            }
          }
        } catch (err) {
          readable.destroy(err);
        }
        break;
      }
    }
    return readable;
  }
  from_1 = from;
  return from_1;
}

/* replacement start */
var readable;
var hasRequiredReadable;
function requireReadable() {
  if (hasRequiredReadable) return readable;
  hasRequiredReadable = 1;
  const process = requireProcess()

  /* replacement end */
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.
  ;
  const {
    ArrayPrototypeIndexOf,
    NumberIsInteger,
    NumberIsNaN,
    NumberParseInt,
    ObjectDefineProperties,
    ObjectKeys,
    ObjectSetPrototypeOf,
    Promise,
    SafeSet,
    SymbolAsyncIterator,
    Symbol
  } = requirePrimordials();
  readable = Readable;
  Readable.ReadableState = ReadableState;
  const {
    EventEmitter: EE
  } = require$$2;
  const {
    Stream,
    prependListener
  } = requireLegacy();
  const {
    Buffer
  } = require$$4;
  const {
    addAbortSignal
  } = requireAddAbortSignal();
  const eos = requireEndOfStream();
  let debug = requireUtil().debuglog('stream', fn => {
    debug = fn;
  });
  const BufferList = requireBuffer_list();
  const destroyImpl = requireDestroy();
  const {
    getHighWaterMark,
    getDefaultHighWaterMark
  } = requireState();
  const {
    aggregateTwoErrors,
    codes: {
      ERR_INVALID_ARG_TYPE,
      ERR_METHOD_NOT_IMPLEMENTED,
      ERR_OUT_OF_RANGE,
      ERR_STREAM_PUSH_AFTER_EOF,
      ERR_STREAM_UNSHIFT_AFTER_END_EVENT
    }
  } = requireErrors();
  const {
    validateObject
  } = requireValidators();
  const kPaused = Symbol('kPaused');
  const {
    StringDecoder
  } = require$$13;
  const from = requireFrom();
  ObjectSetPrototypeOf(Readable.prototype, Stream.prototype);
  ObjectSetPrototypeOf(Readable, Stream);
  const nop = () => {};
  const {
    errorOrDestroy
  } = destroyImpl;
  function ReadableState(options, stream, isDuplex) {
    // Duplex streams are both readable and writable, but share
    // the same options object.
    // However, some cases require setting options to different
    // values for the readable and the writable sides of the duplex stream.
    // These options can be provided separately as readableXXX and writableXXX.
    if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof requireDuplex();

    // Object stream flag. Used to make read(n) ignore n and to
    // make all the buffer merging and length checks go away.
    this.objectMode = !!(options && options.objectMode);
    if (isDuplex) this.objectMode = this.objectMode || !!(options && options.readableObjectMode);

    // The point at which it stops calling _read() to fill the buffer
    // Note: 0 is a valid value, means "don't call _read preemptively ever"
    this.highWaterMark = options ? getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex) : getDefaultHighWaterMark(false);

    // A linked list is used to store data chunks instead of an array because the
    // linked list can remove elements from the beginning faster than
    // array.shift().
    this.buffer = new BufferList();
    this.length = 0;
    this.pipes = [];
    this.flowing = null;
    this.ended = false;
    this.endEmitted = false;
    this.reading = false;

    // Stream is still being constructed and cannot be
    // destroyed until construction finished or failed.
    // Async construction is opt in, therefore we start as
    // constructed.
    this.constructed = true;

    // A flag to be able to tell if the event 'readable'/'data' is emitted
    // immediately, or on a later tick.  We set this to true at first, because
    // any actions that shouldn't happen until "later" should generally also
    // not happen before the first read call.
    this.sync = true;

    // Whenever we return null, then we set a flag to say
    // that we're awaiting a 'readable' event emission.
    this.needReadable = false;
    this.emittedReadable = false;
    this.readableListening = false;
    this.resumeScheduled = false;
    this[kPaused] = null;

    // True if the error was already emitted and should not be thrown again.
    this.errorEmitted = false;

    // Should close be emitted on destroy. Defaults to true.
    this.emitClose = !options || options.emitClose !== false;

    // Should .destroy() be called after 'end' (and potentially 'finish').
    this.autoDestroy = !options || options.autoDestroy !== false;

    // Has it been destroyed.
    this.destroyed = false;

    // Indicates whether the stream has errored. When true no further
    // _read calls, 'data' or 'readable' events should occur. This is needed
    // since when autoDestroy is disabled we need a way to tell whether the
    // stream has failed.
    this.errored = null;

    // Indicates whether the stream has finished destroying.
    this.closed = false;

    // True if close has been emitted or would have been emitted
    // depending on emitClose.
    this.closeEmitted = false;

    // Crypto is kind of old and crusty.  Historically, its default string
    // encoding is 'binary' so we have to make this configurable.
    // Everything else in the universe uses 'utf8', though.
    this.defaultEncoding = options && options.defaultEncoding || 'utf8';

    // Ref the piped dest which we need a drain event on it
    // type: null | Writable | Set<Writable>.
    this.awaitDrainWriters = null;
    this.multiAwaitDrain = false;

    // If true, a maybeReadMore has been scheduled.
    this.readingMore = false;
    this.dataEmitted = false;
    this.decoder = null;
    this.encoding = null;
    if (options && options.encoding) {
      this.decoder = new StringDecoder(options.encoding);
      this.encoding = options.encoding;
    }
  }
  function Readable(options) {
    if (!(this instanceof Readable)) return new Readable(options);

    // Checking for a Stream.Duplex instance is faster here instead of inside
    // the ReadableState constructor, at least with V8 6.5.
    const isDuplex = this instanceof requireDuplex();
    this._readableState = new ReadableState(options, this, isDuplex);
    if (options) {
      if (typeof options.read === 'function') this._read = options.read;
      if (typeof options.destroy === 'function') this._destroy = options.destroy;
      if (typeof options.construct === 'function') this._construct = options.construct;
      if (options.signal && !isDuplex) addAbortSignal(options.signal, this);
    }
    Stream.call(this, options);
    destroyImpl.construct(this, () => {
      if (this._readableState.needReadable) {
        maybeReadMore(this, this._readableState);
      }
    });
  }
  Readable.prototype.destroy = destroyImpl.destroy;
  Readable.prototype._undestroy = destroyImpl.undestroy;
  Readable.prototype._destroy = function (err, cb) {
    cb(err);
  };
  Readable.prototype[EE.captureRejectionSymbol] = function (err) {
    this.destroy(err);
  };

  // Manually shove something into the read() buffer.
  // This returns true if the highWaterMark has not been hit yet,
  // similar to how Writable.write() returns true if you should
  // write() some more.
  Readable.prototype.push = function (chunk, encoding) {
    return readableAddChunk(this, chunk, encoding, false);
  };

  // Unshift should *always* be something directly out of read().
  Readable.prototype.unshift = function (chunk, encoding) {
    return readableAddChunk(this, chunk, encoding, true);
  };
  function readableAddChunk(stream, chunk, encoding, addToFront) {
    debug('readableAddChunk', chunk);
    const state = stream._readableState;
    let err;
    if (!state.objectMode) {
      if (typeof chunk === 'string') {
        encoding = encoding || state.defaultEncoding;
        if (state.encoding !== encoding) {
          if (addToFront && state.encoding) {
            // When unshifting, if state.encoding is set, we have to save
            // the string in the BufferList with the state encoding.
            chunk = Buffer.from(chunk, encoding).toString(state.encoding);
          } else {
            chunk = Buffer.from(chunk, encoding);
            encoding = '';
          }
        }
      } else if (chunk instanceof Buffer) {
        encoding = '';
      } else if (Stream._isUint8Array(chunk)) {
        chunk = Stream._uint8ArrayToBuffer(chunk);
        encoding = '';
      } else if (chunk != null) {
        err = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
      }
    }
    if (err) {
      errorOrDestroy(stream, err);
    } else if (chunk === null) {
      state.reading = false;
      onEofChunk(stream, state);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (addToFront) {
        if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else if (state.destroyed || state.errored) return false;else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
      } else if (state.destroyed || state.errored) {
        return false;
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
      maybeReadMore(stream, state);
    }

    // We can push more data if we are below the highWaterMark.
    // Also, if we have no data yet, we can stand some more bytes.
    // This is to work around cases where hwm=0, such as the repl.
    return !state.ended && (state.length < state.highWaterMark || state.length === 0);
  }
  function addChunk(stream, state, chunk, addToFront) {
    if (state.flowing && state.length === 0 && !state.sync && stream.listenerCount('data') > 0) {
      // Use the guard to avoid creating `Set()` repeatedly
      // when we have multiple pipes.
      if (state.multiAwaitDrain) {
        state.awaitDrainWriters.clear();
      } else {
        state.awaitDrainWriters = null;
      }
      state.dataEmitted = true;
      stream.emit('data', chunk);
    } else {
      // Update the buffer info.
      state.length += state.objectMode ? 1 : chunk.length;
      if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
      if (state.needReadable) emitReadable(stream);
    }
    maybeReadMore(stream, state);
  }
  Readable.prototype.isPaused = function () {
    const state = this._readableState;
    return state[kPaused] === true || state.flowing === false;
  };

  // Backwards compatibility.
  Readable.prototype.setEncoding = function (enc) {
    const decoder = new StringDecoder(enc);
    this._readableState.decoder = decoder;
    // If setEncoding(null), decoder.encoding equals utf8.
    this._readableState.encoding = this._readableState.decoder.encoding;
    const buffer = this._readableState.buffer;
    // Iterate over current buffer to convert already stored Buffers:
    let content = '';
    for (const data of buffer) {
      content += decoder.write(data);
    }
    buffer.clear();
    if (content !== '') buffer.push(content);
    this._readableState.length = content.length;
    return this;
  };

  // Don't raise the hwm > 1GB.
  const MAX_HWM = 0x40000000;
  function computeNewHighWaterMark(n) {
    if (n > MAX_HWM) {
      throw new ERR_OUT_OF_RANGE('size', '<= 1GiB', n);
    } else {
      // Get the next highest power of 2 to prevent increasing hwm excessively in
      // tiny amounts.
      n--;
      n |= n >>> 1;
      n |= n >>> 2;
      n |= n >>> 4;
      n |= n >>> 8;
      n |= n >>> 16;
      n++;
    }
    return n;
  }

  // This function is designed to be inlinable, so please take care when making
  // changes to the function body.
  function howMuchToRead(n, state) {
    if (n <= 0 || state.length === 0 && state.ended) return 0;
    if (state.objectMode) return 1;
    if (NumberIsNaN(n)) {
      // Only flow one buffer at a time.
      if (state.flowing && state.length) return state.buffer.first().length;
      return state.length;
    }
    if (n <= state.length) return n;
    return state.ended ? state.length : 0;
  }

  // You can override either this method, or the async _read(n) below.
  Readable.prototype.read = function (n) {
    debug('read', n);
    // Same as parseInt(undefined, 10), however V8 7.3 performance regressed
    // in this scenario, so we are doing it manually.
    if (n === undefined) {
      n = NaN;
    } else if (!NumberIsInteger(n)) {
      n = NumberParseInt(n, 10);
    }
    const state = this._readableState;
    const nOrig = n;

    // If we're asking for more than the current hwm, then raise the hwm.
    if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
    if (n !== 0) state.emittedReadable = false;

    // If we're doing read(0) to trigger a readable event, but we
    // already have a bunch of data in the buffer, then just trigger
    // the 'readable' event and move on.
    if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
      debug('read: emitReadable', state.length, state.ended);
      if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
      return null;
    }
    n = howMuchToRead(n, state);

    // If we've ended, and we're now clear, then finish it up.
    if (n === 0 && state.ended) {
      if (state.length === 0) endReadable(this);
      return null;
    }

    // All the actual chunk generation logic needs to be
    // *below* the call to _read.  The reason is that in certain
    // synthetic stream cases, such as passthrough streams, _read
    // may be a completely synchronous operation which may change
    // the state of the read buffer, providing enough data when
    // before there was *not* enough.
    //
    // So, the steps are:
    // 1. Figure out what the state of things will be after we do
    // a read from the buffer.
    //
    // 2. If that resulting state will trigger a _read, then call _read.
    // Note that this may be asynchronous, or synchronous.  Yes, it is
    // deeply ugly to write APIs this way, but that still doesn't mean
    // that the Readable class should behave improperly, as streams are
    // designed to be sync/async agnostic.
    // Take note if the _read call is sync or async (ie, if the read call
    // has returned yet), so that we know whether or not it's safe to emit
    // 'readable' etc.
    //
    // 3. Actually pull the requested chunks out of the buffer and return.

    // if we need a readable event, then we need to do some reading.
    let doRead = state.needReadable;
    debug('need readable', doRead);

    // If we currently have less than the highWaterMark, then also read some.
    if (state.length === 0 || state.length - n < state.highWaterMark) {
      doRead = true;
      debug('length less than watermark', doRead);
    }

    // However, if we've ended, then there's no point, if we're already
    // reading, then it's unnecessary, if we're constructing we have to wait,
    // and if we're destroyed or errored, then it's not allowed,
    if (state.ended || state.reading || state.destroyed || state.errored || !state.constructed) {
      doRead = false;
      debug('reading, ended or constructing', doRead);
    } else if (doRead) {
      debug('do read');
      state.reading = true;
      state.sync = true;
      // If the length is currently zero, then we *need* a readable event.
      if (state.length === 0) state.needReadable = true;

      // Call internal read method
      try {
        this._read(state.highWaterMark);
      } catch (err) {
        errorOrDestroy(this, err);
      }
      state.sync = false;
      // If _read pushed data synchronously, then `reading` will be false,
      // and we need to re-evaluate how much data we can return to the user.
      if (!state.reading) n = howMuchToRead(nOrig, state);
    }
    let ret;
    if (n > 0) ret = fromList(n, state);else ret = null;
    if (ret === null) {
      state.needReadable = state.length <= state.highWaterMark;
      n = 0;
    } else {
      state.length -= n;
      if (state.multiAwaitDrain) {
        state.awaitDrainWriters.clear();
      } else {
        state.awaitDrainWriters = null;
      }
    }
    if (state.length === 0) {
      // If we have nothing in the buffer, then we want to know
      // as soon as we *do* get something into the buffer.
      if (!state.ended) state.needReadable = true;

      // If we tried to read() past the EOF, then emit end on the next tick.
      if (nOrig !== n && state.ended) endReadable(this);
    }
    if (ret !== null && !state.errorEmitted && !state.closeEmitted) {
      state.dataEmitted = true;
      this.emit('data', ret);
    }
    return ret;
  };
  function onEofChunk(stream, state) {
    debug('onEofChunk');
    if (state.ended) return;
    if (state.decoder) {
      const chunk = state.decoder.end();
      if (chunk && chunk.length) {
        state.buffer.push(chunk);
        state.length += state.objectMode ? 1 : chunk.length;
      }
    }
    state.ended = true;
    if (state.sync) {
      // If we are sync, wait until next tick to emit the data.
      // Otherwise we risk emitting data in the flow()
      // the readable code triggers during a read() call.
      emitReadable(stream);
    } else {
      // Emit 'readable' now to make sure it gets picked up.
      state.needReadable = false;
      state.emittedReadable = true;
      // We have to emit readable now that we are EOF. Modules
      // in the ecosystem (e.g. dicer) rely on this event being sync.
      emitReadable_(stream);
    }
  }

  // Don't emit readable right away in sync mode, because this can trigger
  // another read() call => stack overflow.  This way, it might trigger
  // a nextTick recursion warning, but that's not so bad.
  function emitReadable(stream) {
    const state = stream._readableState;
    debug('emitReadable', state.needReadable, state.emittedReadable);
    state.needReadable = false;
    if (!state.emittedReadable) {
      debug('emitReadable', state.flowing);
      state.emittedReadable = true;
      process.nextTick(emitReadable_, stream);
    }
  }
  function emitReadable_(stream) {
    const state = stream._readableState;
    debug('emitReadable_', state.destroyed, state.length, state.ended);
    if (!state.destroyed && !state.errored && (state.length || state.ended)) {
      stream.emit('readable');
      state.emittedReadable = false;
    }

    // The stream needs another readable event if:
    // 1. It is not flowing, as the flow mechanism will take
    //    care of it.
    // 2. It is not ended.
    // 3. It is below the highWaterMark, so we can schedule
    //    another readable later.
    state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
    flow(stream);
  }

  // At this point, the user has presumably seen the 'readable' event,
  // and called read() to consume some data.  that may have triggered
  // in turn another _read(n) call, in which case reading = true if
  // it's in progress.
  // However, if we're not ended, or reading, and the length < hwm,
  // then go ahead and try to read some more preemptively.
  function maybeReadMore(stream, state) {
    if (!state.readingMore && state.constructed) {
      state.readingMore = true;
      process.nextTick(maybeReadMore_, stream, state);
    }
  }
  function maybeReadMore_(stream, state) {
    // Attempt to read more data if we should.
    //
    // The conditions for reading more data are (one of):
    // - Not enough data buffered (state.length < state.highWaterMark). The loop
    //   is responsible for filling the buffer with enough data if such data
    //   is available. If highWaterMark is 0 and we are not in the flowing mode
    //   we should _not_ attempt to buffer any extra data. We'll get more data
    //   when the stream consumer calls read() instead.
    // - No data in the buffer, and the stream is in flowing mode. In this mode
    //   the loop below is responsible for ensuring read() is called. Failing to
    //   call read here would abort the flow and there's no other mechanism for
    //   continuing the flow if the stream consumer has just subscribed to the
    //   'data' event.
    //
    // In addition to the above conditions to keep reading data, the following
    // conditions prevent the data from being read:
    // - The stream has ended (state.ended).
    // - There is already a pending 'read' operation (state.reading). This is a
    //   case where the stream has called the implementation defined _read()
    //   method, but they are processing the call asynchronously and have _not_
    //   called push() with new data. In this case we skip performing more
    //   read()s. The execution ends in this method again after the _read() ends
    //   up calling push() with more data.
    while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
      const len = state.length;
      debug('maybeReadMore read 0');
      stream.read(0);
      if (len === state.length)
        // Didn't get any data, stop spinning.
        break;
    }
    state.readingMore = false;
  }

  // Abstract method.  to be overridden in specific implementation classes.
  // call cb(er, data) where data is <= n in length.
  // for virtual (non-string, non-buffer) streams, "length" is somewhat
  // arbitrary, and perhaps not very meaningful.
  Readable.prototype._read = function (n) {
    throw new ERR_METHOD_NOT_IMPLEMENTED('_read()');
  };
  Readable.prototype.pipe = function (dest, pipeOpts) {
    const src = this;
    const state = this._readableState;
    if (state.pipes.length === 1) {
      if (!state.multiAwaitDrain) {
        state.multiAwaitDrain = true;
        state.awaitDrainWriters = new SafeSet(state.awaitDrainWriters ? [state.awaitDrainWriters] : []);
      }
    }
    state.pipes.push(dest);
    debug('pipe count=%d opts=%j', state.pipes.length, pipeOpts);
    const doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
    const endFn = doEnd ? onend : unpipe;
    if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
    dest.on('unpipe', onunpipe);
    function onunpipe(readable, unpipeInfo) {
      debug('onunpipe');
      if (readable === src) {
        if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
          unpipeInfo.hasUnpiped = true;
          cleanup();
        }
      }
    }
    function onend() {
      debug('onend');
      dest.end();
    }
    let ondrain;
    let cleanedUp = false;
    function cleanup() {
      debug('cleanup');
      // Cleanup event handlers once the pipe is broken.
      dest.removeListener('close', onclose);
      dest.removeListener('finish', onfinish);
      if (ondrain) {
        dest.removeListener('drain', ondrain);
      }
      dest.removeListener('error', onerror);
      dest.removeListener('unpipe', onunpipe);
      src.removeListener('end', onend);
      src.removeListener('end', unpipe);
      src.removeListener('data', ondata);
      cleanedUp = true;

      // If the reader is waiting for a drain event from this
      // specific writer, then it would cause it to never start
      // flowing again.
      // So, if this is awaiting a drain, then we just call it now.
      // If we don't know, then assume that we are waiting for one.
      if (ondrain && state.awaitDrainWriters && (!dest._writableState || dest._writableState.needDrain)) ondrain();
    }
    function pause() {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if (!cleanedUp) {
        if (state.pipes.length === 1 && state.pipes[0] === dest) {
          debug('false write response, pause', 0);
          state.awaitDrainWriters = dest;
          state.multiAwaitDrain = false;
        } else if (state.pipes.length > 1 && state.pipes.includes(dest)) {
          debug('false write response, pause', state.awaitDrainWriters.size);
          state.awaitDrainWriters.add(dest);
        }
        src.pause();
      }
      if (!ondrain) {
        // When the dest drains, it reduces the awaitDrain counter
        // on the source.  This would be more elegant with a .once()
        // handler in flow(), but adding and removing repeatedly is
        // too slow.
        ondrain = pipeOnDrain(src, dest);
        dest.on('drain', ondrain);
      }
    }
    src.on('data', ondata);
    function ondata(chunk) {
      debug('ondata');
      const ret = dest.write(chunk);
      debug('dest.write', ret);
      if (ret === false) {
        pause();
      }
    }

    // If the dest has an error, then stop piping into it.
    // However, don't suppress the throwing behavior for this.
    function onerror(er) {
      debug('onerror', er);
      unpipe();
      dest.removeListener('error', onerror);
      if (dest.listenerCount('error') === 0) {
        const s = dest._writableState || dest._readableState;
        if (s && !s.errorEmitted) {
          // User incorrectly emitted 'error' directly on the stream.
          errorOrDestroy(dest, er);
        } else {
          dest.emit('error', er);
        }
      }
    }

    // Make sure our error handler is attached before userland ones.
    prependListener(dest, 'error', onerror);

    // Both close and finish should trigger unpipe, but only once.
    function onclose() {
      dest.removeListener('finish', onfinish);
      unpipe();
    }
    dest.once('close', onclose);
    function onfinish() {
      debug('onfinish');
      dest.removeListener('close', onclose);
      unpipe();
    }
    dest.once('finish', onfinish);
    function unpipe() {
      debug('unpipe');
      src.unpipe(dest);
    }

    // Tell the dest that it's being piped to.
    dest.emit('pipe', src);

    // Start the flow if it hasn't been started already.

    if (dest.writableNeedDrain === true) {
      if (state.flowing) {
        pause();
      }
    } else if (!state.flowing) {
      debug('pipe resume');
      src.resume();
    }
    return dest;
  };
  function pipeOnDrain(src, dest) {
    return function pipeOnDrainFunctionResult() {
      const state = src._readableState;

      // `ondrain` will call directly,
      // `this` maybe not a reference to dest,
      // so we use the real dest here.
      if (state.awaitDrainWriters === dest) {
        debug('pipeOnDrain', 1);
        state.awaitDrainWriters = null;
      } else if (state.multiAwaitDrain) {
        debug('pipeOnDrain', state.awaitDrainWriters.size);
        state.awaitDrainWriters.delete(dest);
      }
      if ((!state.awaitDrainWriters || state.awaitDrainWriters.size === 0) && src.listenerCount('data')) {
        src.resume();
      }
    };
  }
  Readable.prototype.unpipe = function (dest) {
    const state = this._readableState;
    const unpipeInfo = {
      hasUnpiped: false
    };

    // If we're not piping anywhere, then do nothing.
    if (state.pipes.length === 0) return this;
    if (!dest) {
      // remove all.
      const dests = state.pipes;
      state.pipes = [];
      this.pause();
      for (let i = 0; i < dests.length; i++) dests[i].emit('unpipe', this, {
        hasUnpiped: false
      });
      return this;
    }

    // Try to find the right one.
    const index = ArrayPrototypeIndexOf(state.pipes, dest);
    if (index === -1) return this;
    state.pipes.splice(index, 1);
    if (state.pipes.length === 0) this.pause();
    dest.emit('unpipe', this, unpipeInfo);
    return this;
  };

  // Set up data events if they are asked for
  // Ensure readable listeners eventually get something.
  Readable.prototype.on = function (ev, fn) {
    const res = Stream.prototype.on.call(this, ev, fn);
    const state = this._readableState;
    if (ev === 'data') {
      // Update readableListening so that resume() may be a no-op
      // a few lines down. This is needed to support once('readable').
      state.readableListening = this.listenerCount('readable') > 0;

      // Try start flowing on next tick if stream isn't explicitly paused.
      if (state.flowing !== false) this.resume();
    } else if (ev === 'readable') {
      if (!state.endEmitted && !state.readableListening) {
        state.readableListening = state.needReadable = true;
        state.flowing = false;
        state.emittedReadable = false;
        debug('on readable', state.length, state.reading);
        if (state.length) {
          emitReadable(this);
        } else if (!state.reading) {
          process.nextTick(nReadingNextTick, this);
        }
      }
    }
    return res;
  };
  Readable.prototype.addListener = Readable.prototype.on;
  Readable.prototype.removeListener = function (ev, fn) {
    const res = Stream.prototype.removeListener.call(this, ev, fn);
    if (ev === 'readable') {
      // We need to check if there is someone still listening to
      // readable and reset the state. However this needs to happen
      // after readable has been emitted but before I/O (nextTick) to
      // support once('readable', fn) cycles. This means that calling
      // resume within the same tick will have no
      // effect.
      process.nextTick(updateReadableListening, this);
    }
    return res;
  };
  Readable.prototype.off = Readable.prototype.removeListener;
  Readable.prototype.removeAllListeners = function (ev) {
    const res = Stream.prototype.removeAllListeners.apply(this, arguments);
    if (ev === 'readable' || ev === undefined) {
      // We need to check if there is someone still listening to
      // readable and reset the state. However this needs to happen
      // after readable has been emitted but before I/O (nextTick) to
      // support once('readable', fn) cycles. This means that calling
      // resume within the same tick will have no
      // effect.
      process.nextTick(updateReadableListening, this);
    }
    return res;
  };
  function updateReadableListening(self) {
    const state = self._readableState;
    state.readableListening = self.listenerCount('readable') > 0;
    if (state.resumeScheduled && state[kPaused] === false) {
      // Flowing needs to be set to true now, otherwise
      // the upcoming resume will not flow.
      state.flowing = true;

      // Crude way to check if we should resume.
    } else if (self.listenerCount('data') > 0) {
      self.resume();
    } else if (!state.readableListening) {
      state.flowing = null;
    }
  }
  function nReadingNextTick(self) {
    debug('readable nexttick read 0');
    self.read(0);
  }

  // pause() and resume() are remnants of the legacy readable stream API
  // If the user uses them, then switch into old mode.
  Readable.prototype.resume = function () {
    const state = this._readableState;
    if (!state.flowing) {
      debug('resume');
      // We flow only if there is no one listening
      // for readable, but we still have to call
      // resume().
      state.flowing = !state.readableListening;
      resume(this, state);
    }
    state[kPaused] = false;
    return this;
  };
  function resume(stream, state) {
    if (!state.resumeScheduled) {
      state.resumeScheduled = true;
      process.nextTick(resume_, stream, state);
    }
  }
  function resume_(stream, state) {
    debug('resume', state.reading);
    if (!state.reading) {
      stream.read(0);
    }
    state.resumeScheduled = false;
    stream.emit('resume');
    flow(stream);
    if (state.flowing && !state.reading) stream.read(0);
  }
  Readable.prototype.pause = function () {
    debug('call pause flowing=%j', this._readableState.flowing);
    if (this._readableState.flowing !== false) {
      debug('pause');
      this._readableState.flowing = false;
      this.emit('pause');
    }
    this._readableState[kPaused] = true;
    return this;
  };
  function flow(stream) {
    const state = stream._readableState;
    debug('flow', state.flowing);
    while (state.flowing && stream.read() !== null);
  }

  // Wrap an old-style stream as the async data source.
  // This is *not* part of the readable stream interface.
  // It is an ugly unfortunate mess of history.
  Readable.prototype.wrap = function (stream) {
    let paused = false;

    // TODO (ronag): Should this.destroy(err) emit
    // 'error' on the wrapped stream? Would require
    // a static factory method, e.g. Readable.wrap(stream).

    stream.on('data', chunk => {
      if (!this.push(chunk) && stream.pause) {
        paused = true;
        stream.pause();
      }
    });
    stream.on('end', () => {
      this.push(null);
    });
    stream.on('error', err => {
      errorOrDestroy(this, err);
    });
    stream.on('close', () => {
      this.destroy();
    });
    stream.on('destroy', () => {
      this.destroy();
    });
    this._read = () => {
      if (paused && stream.resume) {
        paused = false;
        stream.resume();
      }
    };

    // Proxy all the other methods. Important when wrapping filters and duplexes.
    const streamKeys = ObjectKeys(stream);
    for (let j = 1; j < streamKeys.length; j++) {
      const i = streamKeys[j];
      if (this[i] === undefined && typeof stream[i] === 'function') {
        this[i] = stream[i].bind(stream);
      }
    }
    return this;
  };
  Readable.prototype[SymbolAsyncIterator] = function () {
    return streamToAsyncIterator(this);
  };
  Readable.prototype.iterator = function (options) {
    if (options !== undefined) {
      validateObject(options, 'options');
    }
    return streamToAsyncIterator(this, options);
  };
  function streamToAsyncIterator(stream, options) {
    if (typeof stream.read !== 'function') {
      stream = Readable.wrap(stream, {
        objectMode: true
      });
    }
    const iter = createAsyncIterator(stream, options);
    iter.stream = stream;
    return iter;
  }
  async function* createAsyncIterator(stream, options) {
    let callback = nop;
    function next(resolve) {
      if (this === stream) {
        callback();
        callback = nop;
      } else {
        callback = resolve;
      }
    }
    stream.on('readable', next);
    let error;
    const cleanup = eos(stream, {
      writable: false
    }, err => {
      error = err ? aggregateTwoErrors(error, err) : null;
      callback();
      callback = nop;
    });
    try {
      while (true) {
        const chunk = stream.destroyed ? null : stream.read();
        if (chunk !== null) {
          yield chunk;
        } else if (error) {
          throw error;
        } else if (error === null) {
          return;
        } else {
          await new Promise(next);
        }
      }
    } catch (err) {
      error = aggregateTwoErrors(error, err);
      throw error;
    } finally {
      if ((error || (options === null || options === undefined ? undefined : options.destroyOnReturn) !== false) && (error === undefined || stream._readableState.autoDestroy)) {
        destroyImpl.destroyer(stream, null);
      } else {
        stream.off('readable', next);
        cleanup();
      }
    }
  }

  // Making it explicit these properties are not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail.
  ObjectDefineProperties(Readable.prototype, {
    readable: {
      __proto__: null,
      get() {
        const r = this._readableState;
        // r.readable === false means that this is part of a Duplex stream
        // where the readable side was disabled upon construction.
        // Compat. The user might manually disable readable side through
        // deprecated setter.
        return !!r && r.readable !== false && !r.destroyed && !r.errorEmitted && !r.endEmitted;
      },
      set(val) {
        // Backwards compat.
        if (this._readableState) {
          this._readableState.readable = !!val;
        }
      }
    },
    readableDidRead: {
      __proto__: null,
      enumerable: false,
      get: function () {
        return this._readableState.dataEmitted;
      }
    },
    readableAborted: {
      __proto__: null,
      enumerable: false,
      get: function () {
        return !!(this._readableState.readable !== false && (this._readableState.destroyed || this._readableState.errored) && !this._readableState.endEmitted);
      }
    },
    readableHighWaterMark: {
      __proto__: null,
      enumerable: false,
      get: function () {
        return this._readableState.highWaterMark;
      }
    },
    readableBuffer: {
      __proto__: null,
      enumerable: false,
      get: function () {
        return this._readableState && this._readableState.buffer;
      }
    },
    readableFlowing: {
      __proto__: null,
      enumerable: false,
      get: function () {
        return this._readableState.flowing;
      },
      set: function (state) {
        if (this._readableState) {
          this._readableState.flowing = state;
        }
      }
    },
    readableLength: {
      __proto__: null,
      enumerable: false,
      get() {
        return this._readableState.length;
      }
    },
    readableObjectMode: {
      __proto__: null,
      enumerable: false,
      get() {
        return this._readableState ? this._readableState.objectMode : false;
      }
    },
    readableEncoding: {
      __proto__: null,
      enumerable: false,
      get() {
        return this._readableState ? this._readableState.encoding : null;
      }
    },
    errored: {
      __proto__: null,
      enumerable: false,
      get() {
        return this._readableState ? this._readableState.errored : null;
      }
    },
    closed: {
      __proto__: null,
      get() {
        return this._readableState ? this._readableState.closed : false;
      }
    },
    destroyed: {
      __proto__: null,
      enumerable: false,
      get() {
        return this._readableState ? this._readableState.destroyed : false;
      },
      set(value) {
        // We ignore the value if the stream
        // has not been initialized yet.
        if (!this._readableState) {
          return;
        }

        // Backward compatibility, the user is explicitly
        // managing destroyed.
        this._readableState.destroyed = value;
      }
    },
    readableEnded: {
      __proto__: null,
      enumerable: false,
      get() {
        return this._readableState ? this._readableState.endEmitted : false;
      }
    }
  });
  ObjectDefineProperties(ReadableState.prototype, {
    // Legacy getter for `pipesCount`.
    pipesCount: {
      __proto__: null,
      get() {
        return this.pipes.length;
      }
    },
    // Legacy property for `paused`.
    paused: {
      __proto__: null,
      get() {
        return this[kPaused] !== false;
      },
      set(value) {
        this[kPaused] = !!value;
      }
    }
  });

  // Exposed for testing purposes only.
  Readable._fromList = fromList;

  // Pluck off n bytes from an array of buffers.
  // Length is the combined lengths of all the buffers in the list.
  // This function is designed to be inlinable, so please take care when making
  // changes to the function body.
  function fromList(n, state) {
    // nothing buffered.
    if (state.length === 0) return null;
    let ret;
    if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
      // Read it all, truncate the list.
      if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
      state.buffer.clear();
    } else {
      // read part of list.
      ret = state.buffer.consume(n, state.decoder);
    }
    return ret;
  }
  function endReadable(stream) {
    const state = stream._readableState;
    debug('endReadable', state.endEmitted);
    if (!state.endEmitted) {
      state.ended = true;
      process.nextTick(endReadableNT, state, stream);
    }
  }
  function endReadableNT(state, stream) {
    debug('endReadableNT', state.endEmitted, state.length);

    // Check that we didn't get one last unshift.
    if (!state.errored && !state.closeEmitted && !state.endEmitted && state.length === 0) {
      state.endEmitted = true;
      stream.emit('end');
      if (stream.writable && stream.allowHalfOpen === false) {
        process.nextTick(endWritableNT, stream);
      } else if (state.autoDestroy) {
        // In case of duplex streams we need a way to detect
        // if the writable side is ready for autoDestroy as well.
        const wState = stream._writableState;
        const autoDestroy = !wState || wState.autoDestroy && (
        // We don't expect the writable to ever 'finish'
        // if writable is explicitly set to false.
        wState.finished || wState.writable === false);
        if (autoDestroy) {
          stream.destroy();
        }
      }
    }
  }
  function endWritableNT(stream) {
    const writable = stream.writable && !stream.writableEnded && !stream.destroyed;
    if (writable) {
      stream.end();
    }
  }
  Readable.from = function (iterable, opts) {
    return from(Readable, iterable, opts);
  };
  let webStreamsAdapters;

  // Lazy to avoid circular references
  function lazyWebStreams() {
    if (webStreamsAdapters === undefined) webStreamsAdapters = {};
    return webStreamsAdapters;
  }
  Readable.fromWeb = function (readableStream, options) {
    return lazyWebStreams().newStreamReadableFromReadableStream(readableStream, options);
  };
  Readable.toWeb = function (streamReadable, options) {
    return lazyWebStreams().newReadableStreamFromStreamReadable(streamReadable, options);
  };
  Readable.wrap = function (src, options) {
    var _ref, _src$readableObjectMo;
    return new Readable({
      objectMode: (_ref = (_src$readableObjectMo = src.readableObjectMode) !== null && _src$readableObjectMo !== undefined ? _src$readableObjectMo : src.objectMode) !== null && _ref !== undefined ? _ref : true,
      ...options,
      destroy(err, callback) {
        destroyImpl.destroyer(src, err);
        callback(err);
      }
    }).wrap(src);
  };
  return readable;
}

/* replacement start */
var writable;
var hasRequiredWritable;
function requireWritable() {
  if (hasRequiredWritable) return writable;
  hasRequiredWritable = 1;
  const process = requireProcess()

  /* replacement end */
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.

  // A bit simpler than readable streams.
  // Implement an async ._write(chunk, encoding, cb), and it'll handle all
  // the drain event emission and buffering.
  ;
  const {
    ArrayPrototypeSlice,
    Error,
    FunctionPrototypeSymbolHasInstance,
    ObjectDefineProperty,
    ObjectDefineProperties,
    ObjectSetPrototypeOf,
    StringPrototypeToLowerCase,
    Symbol,
    SymbolHasInstance
  } = requirePrimordials();
  writable = Writable;
  Writable.WritableState = WritableState;
  const {
    EventEmitter: EE
  } = require$$2;
  const Stream = requireLegacy().Stream;
  const {
    Buffer
  } = require$$4;
  const destroyImpl = requireDestroy();
  const {
    addAbortSignal
  } = requireAddAbortSignal();
  const {
    getHighWaterMark,
    getDefaultHighWaterMark
  } = requireState();
  const {
    ERR_INVALID_ARG_TYPE,
    ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK,
    ERR_STREAM_CANNOT_PIPE,
    ERR_STREAM_DESTROYED,
    ERR_STREAM_ALREADY_FINISHED,
    ERR_STREAM_NULL_VALUES,
    ERR_STREAM_WRITE_AFTER_END,
    ERR_UNKNOWN_ENCODING
  } = requireErrors().codes;
  const {
    errorOrDestroy
  } = destroyImpl;
  ObjectSetPrototypeOf(Writable.prototype, Stream.prototype);
  ObjectSetPrototypeOf(Writable, Stream);
  function nop() {}
  const kOnFinished = Symbol('kOnFinished');
  function WritableState(options, stream, isDuplex) {
    // Duplex streams are both readable and writable, but share
    // the same options object.
    // However, some cases require setting options to different
    // values for the readable and the writable sides of the duplex stream,
    // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.
    if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof requireDuplex();

    // Object stream flag to indicate whether or not this stream
    // contains buffers or objects.
    this.objectMode = !!(options && options.objectMode);
    if (isDuplex) this.objectMode = this.objectMode || !!(options && options.writableObjectMode);

    // The point at which write() starts returning false
    // Note: 0 is a valid value, means that we always return false if
    // the entire buffer is not flushed immediately on write().
    this.highWaterMark = options ? getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex) : getDefaultHighWaterMark(false);

    // if _final has been called.
    this.finalCalled = false;

    // drain event flag.
    this.needDrain = false;
    // At the start of calling end()
    this.ending = false;
    // When end() has been called, and returned.
    this.ended = false;
    // When 'finish' is emitted.
    this.finished = false;

    // Has it been destroyed
    this.destroyed = false;

    // Should we decode strings into buffers before passing to _write?
    // this is here so that some node-core streams can optimize string
    // handling at a lower level.
    const noDecode = !!(options && options.decodeStrings === false);
    this.decodeStrings = !noDecode;

    // Crypto is kind of old and crusty.  Historically, its default string
    // encoding is 'binary' so we have to make this configurable.
    // Everything else in the universe uses 'utf8', though.
    this.defaultEncoding = options && options.defaultEncoding || 'utf8';

    // Not an actual buffer we keep track of, but a measurement
    // of how much we're waiting to get pushed to some underlying
    // socket or file.
    this.length = 0;

    // A flag to see when we're in the middle of a write.
    this.writing = false;

    // When true all writes will be buffered until .uncork() call.
    this.corked = 0;

    // A flag to be able to tell if the onwrite cb is called immediately,
    // or on a later tick.  We set this to true at first, because any
    // actions that shouldn't happen until "later" should generally also
    // not happen before the first write call.
    this.sync = true;

    // A flag to know if we're processing previously buffered items, which
    // may call the _write() callback in the same tick, so that we don't
    // end up in an overlapped onwrite situation.
    this.bufferProcessing = false;

    // The callback that's passed to _write(chunk, cb).
    this.onwrite = onwrite.bind(undefined, stream);

    // The callback that the user supplies to write(chunk, encoding, cb).
    this.writecb = null;

    // The amount that is being written when _write is called.
    this.writelen = 0;

    // Storage for data passed to the afterWrite() callback in case of
    // synchronous _write() completion.
    this.afterWriteTickInfo = null;
    resetBuffer(this);

    // Number of pending user-supplied write callbacks
    // this must be 0 before 'finish' can be emitted.
    this.pendingcb = 0;

    // Stream is still being constructed and cannot be
    // destroyed until construction finished or failed.
    // Async construction is opt in, therefore we start as
    // constructed.
    this.constructed = true;

    // Emit prefinish if the only thing we're waiting for is _write cbs
    // This is relevant for synchronous Transform streams.
    this.prefinished = false;

    // True if the error was already emitted and should not be thrown again.
    this.errorEmitted = false;

    // Should close be emitted on destroy. Defaults to true.
    this.emitClose = !options || options.emitClose !== false;

    // Should .destroy() be called after 'finish' (and potentially 'end').
    this.autoDestroy = !options || options.autoDestroy !== false;

    // Indicates whether the stream has errored. When true all write() calls
    // should return false. This is needed since when autoDestroy
    // is disabled we need a way to tell whether the stream has failed.
    this.errored = null;

    // Indicates whether the stream has finished destroying.
    this.closed = false;

    // True if close has been emitted or would have been emitted
    // depending on emitClose.
    this.closeEmitted = false;
    this[kOnFinished] = [];
  }
  function resetBuffer(state) {
    state.buffered = [];
    state.bufferedIndex = 0;
    state.allBuffers = true;
    state.allNoop = true;
  }
  WritableState.prototype.getBuffer = function getBuffer() {
    return ArrayPrototypeSlice(this.buffered, this.bufferedIndex);
  };
  ObjectDefineProperty(WritableState.prototype, 'bufferedRequestCount', {
    __proto__: null,
    get() {
      return this.buffered.length - this.bufferedIndex;
    }
  });
  function Writable(options) {
    // Writable ctor is applied to Duplexes, too.
    // `realHasInstance` is necessary because using plain `instanceof`
    // would return false, as no `_writableState` property is attached.

    // Trying to use the custom `instanceof` for Writable here will also break the
    // Node.js LazyTransform implementation, which has a non-trivial getter for
    // `_writableState` that would lead to infinite recursion.

    // Checking for a Stream.Duplex instance is faster here instead of inside
    // the WritableState constructor, at least with V8 6.5.
    const isDuplex = this instanceof requireDuplex();
    if (!isDuplex && !FunctionPrototypeSymbolHasInstance(Writable, this)) return new Writable(options);
    this._writableState = new WritableState(options, this, isDuplex);
    if (options) {
      if (typeof options.write === 'function') this._write = options.write;
      if (typeof options.writev === 'function') this._writev = options.writev;
      if (typeof options.destroy === 'function') this._destroy = options.destroy;
      if (typeof options.final === 'function') this._final = options.final;
      if (typeof options.construct === 'function') this._construct = options.construct;
      if (options.signal) addAbortSignal(options.signal, this);
    }
    Stream.call(this, options);
    destroyImpl.construct(this, () => {
      const state = this._writableState;
      if (!state.writing) {
        clearBuffer(this, state);
      }
      finishMaybe(this, state);
    });
  }
  ObjectDefineProperty(Writable, SymbolHasInstance, {
    __proto__: null,
    value: function (object) {
      if (FunctionPrototypeSymbolHasInstance(this, object)) return true;
      if (this !== Writable) return false;
      return object && object._writableState instanceof WritableState;
    }
  });

  // Otherwise people can pipe Writable streams, which is just wrong.
  Writable.prototype.pipe = function () {
    errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
  };
  function _write(stream, chunk, encoding, cb) {
    const state = stream._writableState;
    if (typeof encoding === 'function') {
      cb = encoding;
      encoding = state.defaultEncoding;
    } else {
      if (!encoding) encoding = state.defaultEncoding;else if (encoding !== 'buffer' && !Buffer.isEncoding(encoding)) throw new ERR_UNKNOWN_ENCODING(encoding);
      if (typeof cb !== 'function') cb = nop;
    }
    if (chunk === null) {
      throw new ERR_STREAM_NULL_VALUES();
    } else if (!state.objectMode) {
      if (typeof chunk === 'string') {
        if (state.decodeStrings !== false) {
          chunk = Buffer.from(chunk, encoding);
          encoding = 'buffer';
        }
      } else if (chunk instanceof Buffer) {
        encoding = 'buffer';
      } else if (Stream._isUint8Array(chunk)) {
        chunk = Stream._uint8ArrayToBuffer(chunk);
        encoding = 'buffer';
      } else {
        throw new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
      }
    }
    let err;
    if (state.ending) {
      err = new ERR_STREAM_WRITE_AFTER_END();
    } else if (state.destroyed) {
      err = new ERR_STREAM_DESTROYED('write');
    }
    if (err) {
      process.nextTick(cb, err);
      errorOrDestroy(stream, err, true);
      return err;
    }
    state.pendingcb++;
    return writeOrBuffer(stream, state, chunk, encoding, cb);
  }
  Writable.prototype.write = function (chunk, encoding, cb) {
    return _write(this, chunk, encoding, cb) === true;
  };
  Writable.prototype.cork = function () {
    this._writableState.corked++;
  };
  Writable.prototype.uncork = function () {
    const state = this._writableState;
    if (state.corked) {
      state.corked--;
      if (!state.writing) clearBuffer(this, state);
    }
  };
  Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
    // node::ParseEncoding() requires lower case.
    if (typeof encoding === 'string') encoding = StringPrototypeToLowerCase(encoding);
    if (!Buffer.isEncoding(encoding)) throw new ERR_UNKNOWN_ENCODING(encoding);
    this._writableState.defaultEncoding = encoding;
    return this;
  };

  // If we're already writing something, then just put this
  // in the queue, and wait our turn.  Otherwise, call _write
  // If we return false, then we need a drain event, so set that flag.
  function writeOrBuffer(stream, state, chunk, encoding, callback) {
    const len = state.objectMode ? 1 : chunk.length;
    state.length += len;

    // stream._write resets state.length
    const ret = state.length < state.highWaterMark;
    // We must ensure that previous needDrain will not be reset to false.
    if (!ret) state.needDrain = true;
    if (state.writing || state.corked || state.errored || !state.constructed) {
      state.buffered.push({
        chunk,
        encoding,
        callback
      });
      if (state.allBuffers && encoding !== 'buffer') {
        state.allBuffers = false;
      }
      if (state.allNoop && callback !== nop) {
        state.allNoop = false;
      }
    } else {
      state.writelen = len;
      state.writecb = callback;
      state.writing = true;
      state.sync = true;
      stream._write(chunk, encoding, state.onwrite);
      state.sync = false;
    }

    // Return false if errored or destroyed in order to break
    // any synchronous while(stream.write(data)) loops.
    return ret && !state.errored && !state.destroyed;
  }
  function doWrite(stream, state, writev, len, chunk, encoding, cb) {
    state.writelen = len;
    state.writecb = cb;
    state.writing = true;
    state.sync = true;
    if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
    state.sync = false;
  }
  function onwriteError(stream, state, er, cb) {
    --state.pendingcb;
    cb(er);
    // Ensure callbacks are invoked even when autoDestroy is
    // not enabled. Passing `er` here doesn't make sense since
    // it's related to one specific write, not to the buffered
    // writes.
    errorBuffer(state);
    // This can emit error, but error must always follow cb.
    errorOrDestroy(stream, er);
  }
  function onwrite(stream, er) {
    const state = stream._writableState;
    const sync = state.sync;
    const cb = state.writecb;
    if (typeof cb !== 'function') {
      errorOrDestroy(stream, new ERR_MULTIPLE_CALLBACK());
      return;
    }
    state.writing = false;
    state.writecb = null;
    state.length -= state.writelen;
    state.writelen = 0;
    if (er) {
      // Avoid V8 leak, https://github.com/nodejs/node/pull/34103#issuecomment-652002364
      er.stack; // eslint-disable-line no-unused-expressions

      if (!state.errored) {
        state.errored = er;
      }

      // In case of duplex streams we need to notify the readable side of the
      // error.
      if (stream._readableState && !stream._readableState.errored) {
        stream._readableState.errored = er;
      }
      if (sync) {
        process.nextTick(onwriteError, stream, state, er, cb);
      } else {
        onwriteError(stream, state, er, cb);
      }
    } else {
      if (state.buffered.length > state.bufferedIndex) {
        clearBuffer(stream, state);
      }
      if (sync) {
        // It is a common case that the callback passed to .write() is always
        // the same. In that case, we do not schedule a new nextTick(), but
        // rather just increase a counter, to improve performance and avoid
        // memory allocations.
        if (state.afterWriteTickInfo !== null && state.afterWriteTickInfo.cb === cb) {
          state.afterWriteTickInfo.count++;
        } else {
          state.afterWriteTickInfo = {
            count: 1,
            cb,
            stream,
            state
          };
          process.nextTick(afterWriteTick, state.afterWriteTickInfo);
        }
      } else {
        afterWrite(stream, state, 1, cb);
      }
    }
  }
  function afterWriteTick({
    stream,
    state,
    count,
    cb
  }) {
    state.afterWriteTickInfo = null;
    return afterWrite(stream, state, count, cb);
  }
  function afterWrite(stream, state, count, cb) {
    const needDrain = !state.ending && !stream.destroyed && state.length === 0 && state.needDrain;
    if (needDrain) {
      state.needDrain = false;
      stream.emit('drain');
    }
    while (count-- > 0) {
      state.pendingcb--;
      cb();
    }
    if (state.destroyed) {
      errorBuffer(state);
    }
    finishMaybe(stream, state);
  }

  // If there's something in the buffer waiting, then invoke callbacks.
  function errorBuffer(state) {
    if (state.writing) {
      return;
    }
    for (let n = state.bufferedIndex; n < state.buffered.length; ++n) {
      var _state$errored;
      const {
        chunk,
        callback
      } = state.buffered[n];
      const len = state.objectMode ? 1 : chunk.length;
      state.length -= len;
      callback((_state$errored = state.errored) !== null && _state$errored !== undefined ? _state$errored : new ERR_STREAM_DESTROYED('write'));
    }
    const onfinishCallbacks = state[kOnFinished].splice(0);
    for (let i = 0; i < onfinishCallbacks.length; i++) {
      var _state$errored2;
      onfinishCallbacks[i]((_state$errored2 = state.errored) !== null && _state$errored2 !== undefined ? _state$errored2 : new ERR_STREAM_DESTROYED('end'));
    }
    resetBuffer(state);
  }

  // If there's something in the buffer waiting, then process it.
  function clearBuffer(stream, state) {
    if (state.corked || state.bufferProcessing || state.destroyed || !state.constructed) {
      return;
    }
    const {
      buffered,
      bufferedIndex,
      objectMode
    } = state;
    const bufferedLength = buffered.length - bufferedIndex;
    if (!bufferedLength) {
      return;
    }
    let i = bufferedIndex;
    state.bufferProcessing = true;
    if (bufferedLength > 1 && stream._writev) {
      state.pendingcb -= bufferedLength - 1;
      const callback = state.allNoop ? nop : err => {
        for (let n = i; n < buffered.length; ++n) {
          buffered[n].callback(err);
        }
      };
      // Make a copy of `buffered` if it's going to be used by `callback` above,
      // since `doWrite` will mutate the array.
      const chunks = state.allNoop && i === 0 ? buffered : ArrayPrototypeSlice(buffered, i);
      chunks.allBuffers = state.allBuffers;
      doWrite(stream, state, true, state.length, chunks, '', callback);
      resetBuffer(state);
    } else {
      do {
        const {
          chunk,
          encoding,
          callback
        } = buffered[i];
        buffered[i++] = null;
        const len = objectMode ? 1 : chunk.length;
        doWrite(stream, state, false, len, chunk, encoding, callback);
      } while (i < buffered.length && !state.writing);
      if (i === buffered.length) {
        resetBuffer(state);
      } else if (i > 256) {
        buffered.splice(0, i);
        state.bufferedIndex = 0;
      } else {
        state.bufferedIndex = i;
      }
    }
    state.bufferProcessing = false;
  }
  Writable.prototype._write = function (chunk, encoding, cb) {
    if (this._writev) {
      this._writev([{
        chunk,
        encoding
      }], cb);
    } else {
      throw new ERR_METHOD_NOT_IMPLEMENTED('_write()');
    }
  };
  Writable.prototype._writev = null;
  Writable.prototype.end = function (chunk, encoding, cb) {
    const state = this._writableState;
    if (typeof chunk === 'function') {
      cb = chunk;
      chunk = null;
      encoding = null;
    } else if (typeof encoding === 'function') {
      cb = encoding;
      encoding = null;
    }
    let err;
    if (chunk !== null && chunk !== undefined) {
      const ret = _write(this, chunk, encoding);
      if (ret instanceof Error) {
        err = ret;
      }
    }

    // .end() fully uncorks.
    if (state.corked) {
      state.corked = 1;
      this.uncork();
    }
    if (err) ; else if (!state.errored && !state.ending) {
      // This is forgiving in terms of unnecessary calls to end() and can hide
      // logic errors. However, usually such errors are harmless and causing a
      // hard error can be disproportionately destructive. It is not always
      // trivial for the user to determine whether end() needs to be called
      // or not.

      state.ending = true;
      finishMaybe(this, state, true);
      state.ended = true;
    } else if (state.finished) {
      err = new ERR_STREAM_ALREADY_FINISHED('end');
    } else if (state.destroyed) {
      err = new ERR_STREAM_DESTROYED('end');
    }
    if (typeof cb === 'function') {
      if (err || state.finished) {
        process.nextTick(cb, err);
      } else {
        state[kOnFinished].push(cb);
      }
    }
    return this;
  };
  function needFinish(state) {
    return state.ending && !state.destroyed && state.constructed && state.length === 0 && !state.errored && state.buffered.length === 0 && !state.finished && !state.writing && !state.errorEmitted && !state.closeEmitted;
  }
  function callFinal(stream, state) {
    let called = false;
    function onFinish(err) {
      if (called) {
        errorOrDestroy(stream, err !== null && err !== undefined ? err : ERR_MULTIPLE_CALLBACK());
        return;
      }
      called = true;
      state.pendingcb--;
      if (err) {
        const onfinishCallbacks = state[kOnFinished].splice(0);
        for (let i = 0; i < onfinishCallbacks.length; i++) {
          onfinishCallbacks[i](err);
        }
        errorOrDestroy(stream, err, state.sync);
      } else if (needFinish(state)) {
        state.prefinished = true;
        stream.emit('prefinish');
        // Backwards compat. Don't check state.sync here.
        // Some streams assume 'finish' will be emitted
        // asynchronously relative to _final callback.
        state.pendingcb++;
        process.nextTick(finish, stream, state);
      }
    }
    state.sync = true;
    state.pendingcb++;
    try {
      stream._final(onFinish);
    } catch (err) {
      onFinish(err);
    }
    state.sync = false;
  }
  function prefinish(stream, state) {
    if (!state.prefinished && !state.finalCalled) {
      if (typeof stream._final === 'function' && !state.destroyed) {
        state.finalCalled = true;
        callFinal(stream, state);
      } else {
        state.prefinished = true;
        stream.emit('prefinish');
      }
    }
  }
  function finishMaybe(stream, state, sync) {
    if (needFinish(state)) {
      prefinish(stream, state);
      if (state.pendingcb === 0) {
        if (sync) {
          state.pendingcb++;
          process.nextTick((stream, state) => {
            if (needFinish(state)) {
              finish(stream, state);
            } else {
              state.pendingcb--;
            }
          }, stream, state);
        } else if (needFinish(state)) {
          state.pendingcb++;
          finish(stream, state);
        }
      }
    }
  }
  function finish(stream, state) {
    state.pendingcb--;
    state.finished = true;
    const onfinishCallbacks = state[kOnFinished].splice(0);
    for (let i = 0; i < onfinishCallbacks.length; i++) {
      onfinishCallbacks[i]();
    }
    stream.emit('finish');
    if (state.autoDestroy) {
      // In case of duplex streams we need a way to detect
      // if the readable side is ready for autoDestroy as well.
      const rState = stream._readableState;
      const autoDestroy = !rState || rState.autoDestroy && (
      // We don't expect the readable to ever 'end'
      // if readable is explicitly set to false.
      rState.endEmitted || rState.readable === false);
      if (autoDestroy) {
        stream.destroy();
      }
    }
  }
  ObjectDefineProperties(Writable.prototype, {
    closed: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.closed : false;
      }
    },
    destroyed: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.destroyed : false;
      },
      set(value) {
        // Backward compatibility, the user is explicitly managing destroyed.
        if (this._writableState) {
          this._writableState.destroyed = value;
        }
      }
    },
    writable: {
      __proto__: null,
      get() {
        const w = this._writableState;
        // w.writable === false means that this is part of a Duplex stream
        // where the writable side was disabled upon construction.
        // Compat. The user might manually disable writable side through
        // deprecated setter.
        return !!w && w.writable !== false && !w.destroyed && !w.errored && !w.ending && !w.ended;
      },
      set(val) {
        // Backwards compatible.
        if (this._writableState) {
          this._writableState.writable = !!val;
        }
      }
    },
    writableFinished: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.finished : false;
      }
    },
    writableObjectMode: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.objectMode : false;
      }
    },
    writableBuffer: {
      __proto__: null,
      get() {
        return this._writableState && this._writableState.getBuffer();
      }
    },
    writableEnded: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.ending : false;
      }
    },
    writableNeedDrain: {
      __proto__: null,
      get() {
        const wState = this._writableState;
        if (!wState) return false;
        return !wState.destroyed && !wState.ending && wState.needDrain;
      }
    },
    writableHighWaterMark: {
      __proto__: null,
      get() {
        return this._writableState && this._writableState.highWaterMark;
      }
    },
    writableCorked: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.corked : 0;
      }
    },
    writableLength: {
      __proto__: null,
      get() {
        return this._writableState && this._writableState.length;
      }
    },
    errored: {
      __proto__: null,
      enumerable: false,
      get() {
        return this._writableState ? this._writableState.errored : null;
      }
    },
    writableAborted: {
      __proto__: null,
      enumerable: false,
      get: function () {
        return !!(this._writableState.writable !== false && (this._writableState.destroyed || this._writableState.errored) && !this._writableState.finished);
      }
    }
  });
  const destroy = destroyImpl.destroy;
  Writable.prototype.destroy = function (err, cb) {
    const state = this._writableState;

    // Invoke pending callbacks.
    if (!state.destroyed && (state.bufferedIndex < state.buffered.length || state[kOnFinished].length)) {
      process.nextTick(errorBuffer, state);
    }
    destroy.call(this, err, cb);
    return this;
  };
  Writable.prototype._undestroy = destroyImpl.undestroy;
  Writable.prototype._destroy = function (err, cb) {
    cb(err);
  };
  Writable.prototype[EE.captureRejectionSymbol] = function (err) {
    this.destroy(err);
  };
  let webStreamsAdapters;

  // Lazy to avoid circular references
  function lazyWebStreams() {
    if (webStreamsAdapters === undefined) webStreamsAdapters = {};
    return webStreamsAdapters;
  }
  Writable.fromWeb = function (writableStream, options) {
    return lazyWebStreams().newStreamWritableFromWritableStream(writableStream, options);
  };
  Writable.toWeb = function (streamWritable) {
    return lazyWebStreams().newWritableStreamFromStreamWritable(streamWritable);
  };
  return writable;
}

/* replacement start */
var duplexify;
var hasRequiredDuplexify;
function requireDuplexify() {
  if (hasRequiredDuplexify) return duplexify;
  hasRequiredDuplexify = 1;
  const process = requireProcess()

  /* replacement end */;
  const bufferModule = require$$4;
  const {
    isReadable,
    isWritable,
    isIterable,
    isNodeStream,
    isReadableNodeStream,
    isWritableNodeStream,
    isDuplexNodeStream
  } = requireUtils();
  const eos = requireEndOfStream();
  const {
    AbortError,
    codes: {
      ERR_INVALID_ARG_TYPE,
      ERR_INVALID_RETURN_VALUE
    }
  } = requireErrors();
  const {
    destroyer
  } = requireDestroy();
  const Duplex = requireDuplex();
  const Readable = requireReadable();
  const {
    createDeferredPromise
  } = requireUtil();
  const from = requireFrom();
  const Blob = globalThis.Blob || bufferModule.Blob;
  const isBlob = typeof Blob !== 'undefined' ? function isBlob(b) {
    return b instanceof Blob;
  } : function isBlob(b) {
    return false;
  };
  const AbortController = globalThis.AbortController || requireAbortController().AbortController;
  const {
    FunctionPrototypeCall
  } = requirePrimordials();

  // This is needed for pre node 17.
  class Duplexify extends Duplex {
    constructor(options) {
      super(options);

      // https://github.com/nodejs/node/pull/34385

      if ((options === null || options === undefined ? undefined : options.readable) === false) {
        this._readableState.readable = false;
        this._readableState.ended = true;
        this._readableState.endEmitted = true;
      }
      if ((options === null || options === undefined ? undefined : options.writable) === false) {
        this._writableState.writable = false;
        this._writableState.ending = true;
        this._writableState.ended = true;
        this._writableState.finished = true;
      }
    }
  }
  duplexify = function duplexify(body, name) {
    if (isDuplexNodeStream(body)) {
      return body;
    }
    if (isReadableNodeStream(body)) {
      return _duplexify({
        readable: body
      });
    }
    if (isWritableNodeStream(body)) {
      return _duplexify({
        writable: body
      });
    }
    if (isNodeStream(body)) {
      return _duplexify({
        writable: false,
        readable: false
      });
    }

    // TODO: Webstreams
    // if (isReadableStream(body)) {
    //   return _duplexify({ readable: Readable.fromWeb(body) });
    // }

    // TODO: Webstreams
    // if (isWritableStream(body)) {
    //   return _duplexify({ writable: Writable.fromWeb(body) });
    // }

    if (typeof body === 'function') {
      const {
        value,
        write,
        final,
        destroy
      } = fromAsyncGen(body);
      if (isIterable(value)) {
        return from(Duplexify, value, {
          // TODO (ronag): highWaterMark?
          objectMode: true,
          write,
          final,
          destroy
        });
      }
      const then = value === null || value === undefined ? undefined : value.then;
      if (typeof then === 'function') {
        let d;
        const promise = FunctionPrototypeCall(then, value, val => {
          if (val != null) {
            throw new ERR_INVALID_RETURN_VALUE('nully', 'body', val);
          }
        }, err => {
          destroyer(d, err);
        });
        return d = new Duplexify({
          // TODO (ronag): highWaterMark?
          objectMode: true,
          readable: false,
          write,
          final(cb) {
            final(async () => {
              try {
                await promise;
                process.nextTick(cb, null);
              } catch (err) {
                process.nextTick(cb, err);
              }
            });
          },
          destroy
        });
      }
      throw new ERR_INVALID_RETURN_VALUE('Iterable, AsyncIterable or AsyncFunction', name, value);
    }
    if (isBlob(body)) {
      return duplexify(body.arrayBuffer());
    }
    if (isIterable(body)) {
      return from(Duplexify, body, {
        // TODO (ronag): highWaterMark?
        objectMode: true,
        writable: false
      });
    }

    // TODO: Webstreams.
    // if (
    //   isReadableStream(body?.readable) &&
    //   isWritableStream(body?.writable)
    // ) {
    //   return Duplexify.fromWeb(body);
    // }

    if (typeof (body === null || body === undefined ? undefined : body.writable) === 'object' || typeof (body === null || body === undefined ? undefined : body.readable) === 'object') {
      const readable = body !== null && body !== undefined && body.readable ? isReadableNodeStream(body === null || body === undefined ? undefined : body.readable) ? body === null || body === undefined ? undefined : body.readable : duplexify(body.readable) : undefined;
      const writable = body !== null && body !== undefined && body.writable ? isWritableNodeStream(body === null || body === undefined ? undefined : body.writable) ? body === null || body === undefined ? undefined : body.writable : duplexify(body.writable) : undefined;
      return _duplexify({
        readable,
        writable
      });
    }
    const then = body === null || body === undefined ? undefined : body.then;
    if (typeof then === 'function') {
      let d;
      FunctionPrototypeCall(then, body, val => {
        if (val != null) {
          d.push(val);
        }
        d.push(null);
      }, err => {
        destroyer(d, err);
      });
      return d = new Duplexify({
        objectMode: true,
        writable: false,
        read() {}
      });
    }
    throw new ERR_INVALID_ARG_TYPE(name, ['Blob', 'ReadableStream', 'WritableStream', 'Stream', 'Iterable', 'AsyncIterable', 'Function', '{ readable, writable } pair', 'Promise'], body);
  };
  function fromAsyncGen(fn) {
    let {
      promise,
      resolve
    } = createDeferredPromise();
    const ac = new AbortController();
    const signal = ac.signal;
    const value = fn(async function* () {
      while (true) {
        const _promise = promise;
        promise = null;
        const {
          chunk,
          done,
          cb
        } = await _promise;
        process.nextTick(cb);
        if (done) return;
        if (signal.aborted) throw new AbortError(undefined, {
          cause: signal.reason
        });
        ({
          promise,
          resolve
        } = createDeferredPromise());
        yield chunk;
      }
    }(), {
      signal
    });
    return {
      value,
      write(chunk, encoding, cb) {
        const _resolve = resolve;
        resolve = null;
        _resolve({
          chunk,
          done: false,
          cb
        });
      },
      final(cb) {
        const _resolve = resolve;
        resolve = null;
        _resolve({
          done: true,
          cb
        });
      },
      destroy(err, cb) {
        ac.abort();
        cb(err);
      }
    };
  }
  function _duplexify(pair) {
    const r = pair.readable && typeof pair.readable.read !== 'function' ? Readable.wrap(pair.readable) : pair.readable;
    const w = pair.writable;
    let readable = !!isReadable(r);
    let writable = !!isWritable(w);
    let ondrain;
    let onfinish;
    let onreadable;
    let onclose;
    let d;
    function onfinished(err) {
      const cb = onclose;
      onclose = null;
      if (cb) {
        cb(err);
      } else if (err) {
        d.destroy(err);
      } else if (!readable && !writable) {
        d.destroy();
      }
    }

    // TODO(ronag): Avoid double buffering.
    // Implement Writable/Readable/Duplex traits.
    // See, https://github.com/nodejs/node/pull/33515.
    d = new Duplexify({
      // TODO (ronag): highWaterMark?
      readableObjectMode: !!(r !== null && r !== undefined && r.readableObjectMode),
      writableObjectMode: !!(w !== null && w !== undefined && w.writableObjectMode),
      readable,
      writable
    });
    if (writable) {
      eos(w, err => {
        writable = false;
        if (err) {
          destroyer(r, err);
        }
        onfinished(err);
      });
      d._write = function (chunk, encoding, callback) {
        if (w.write(chunk, encoding)) {
          callback();
        } else {
          ondrain = callback;
        }
      };
      d._final = function (callback) {
        w.end();
        onfinish = callback;
      };
      w.on('drain', function () {
        if (ondrain) {
          const cb = ondrain;
          ondrain = null;
          cb();
        }
      });
      w.on('finish', function () {
        if (onfinish) {
          const cb = onfinish;
          onfinish = null;
          cb();
        }
      });
    }
    if (readable) {
      eos(r, err => {
        readable = false;
        if (err) {
          destroyer(r, err);
        }
        onfinished(err);
      });
      r.on('readable', function () {
        if (onreadable) {
          const cb = onreadable;
          onreadable = null;
          cb();
        }
      });
      r.on('end', function () {
        d.push(null);
      });
      d._read = function () {
        while (true) {
          const buf = r.read();
          if (buf === null) {
            onreadable = d._read;
            return;
          }
          if (!d.push(buf)) {
            return;
          }
        }
      };
    }
    d._destroy = function (err, callback) {
      if (!err && onclose !== null) {
        err = new AbortError();
      }
      onreadable = null;
      ondrain = null;
      onfinish = null;
      if (onclose === null) {
        callback(err);
      } else {
        onclose = callback;
        destroyer(w, err);
        destroyer(r, err);
      }
    };
    return d;
  }
  return duplexify;
}

var duplex;
var hasRequiredDuplex;
function requireDuplex() {
  if (hasRequiredDuplex) return duplex;
  hasRequiredDuplex = 1;
  const {
    ObjectDefineProperties,
    ObjectGetOwnPropertyDescriptor,
    ObjectKeys,
    ObjectSetPrototypeOf
  } = requirePrimordials();
  duplex = Duplex;
  const Readable = requireReadable();
  const Writable = requireWritable();
  ObjectSetPrototypeOf(Duplex.prototype, Readable.prototype);
  ObjectSetPrototypeOf(Duplex, Readable);
  {
    const keys = ObjectKeys(Writable.prototype);
    // Allow the keys array to be GC'ed.
    for (let i = 0; i < keys.length; i++) {
      const method = keys[i];
      if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
    }
  }
  function Duplex(options) {
    if (!(this instanceof Duplex)) return new Duplex(options);
    Readable.call(this, options);
    Writable.call(this, options);
    if (options) {
      this.allowHalfOpen = options.allowHalfOpen !== false;
      if (options.readable === false) {
        this._readableState.readable = false;
        this._readableState.ended = true;
        this._readableState.endEmitted = true;
      }
      if (options.writable === false) {
        this._writableState.writable = false;
        this._writableState.ending = true;
        this._writableState.ended = true;
        this._writableState.finished = true;
      }
    } else {
      this.allowHalfOpen = true;
    }
  }
  ObjectDefineProperties(Duplex.prototype, {
    writable: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writable')
    },
    writableHighWaterMark: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableHighWaterMark')
    },
    writableObjectMode: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableObjectMode')
    },
    writableBuffer: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableBuffer')
    },
    writableLength: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableLength')
    },
    writableFinished: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableFinished')
    },
    writableCorked: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableCorked')
    },
    writableEnded: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableEnded')
    },
    writableNeedDrain: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableNeedDrain')
    },
    destroyed: {
      __proto__: null,
      get() {
        if (this._readableState === undefined || this._writableState === undefined) {
          return false;
        }
        return this._readableState.destroyed && this._writableState.destroyed;
      },
      set(value) {
        // Backward compatibility, the user is explicitly
        // managing destroyed.
        if (this._readableState && this._writableState) {
          this._readableState.destroyed = value;
          this._writableState.destroyed = value;
        }
      }
    }
  });
  let webStreamsAdapters;

  // Lazy to avoid circular references
  function lazyWebStreams() {
    if (webStreamsAdapters === undefined) webStreamsAdapters = {};
    return webStreamsAdapters;
  }
  Duplex.fromWeb = function (pair, options) {
    return lazyWebStreams().newStreamDuplexFromReadableWritablePair(pair, options);
  };
  Duplex.toWeb = function (duplex) {
    return lazyWebStreams().newReadableWritablePairFromDuplex(duplex);
  };
  let duplexify;
  Duplex.from = function (body) {
    if (!duplexify) {
      duplexify = requireDuplexify();
    }
    return duplexify(body, 'body');
  };
  return duplex;
}

var transform;
var hasRequiredTransform;
function requireTransform() {
  if (hasRequiredTransform) return transform;
  hasRequiredTransform = 1;
  const {
    ObjectSetPrototypeOf,
    Symbol
  } = requirePrimordials();
  transform = Transform;
  const {
    ERR_METHOD_NOT_IMPLEMENTED
  } = requireErrors().codes;
  const Duplex = requireDuplex();
  const {
    getHighWaterMark
  } = requireState();
  ObjectSetPrototypeOf(Transform.prototype, Duplex.prototype);
  ObjectSetPrototypeOf(Transform, Duplex);
  const kCallback = Symbol('kCallback');
  function Transform(options) {
    if (!(this instanceof Transform)) return new Transform(options);

    // TODO (ronag): This should preferably always be
    // applied but would be semver-major. Or even better;
    // make Transform a Readable with the Writable interface.
    const readableHighWaterMark = options ? getHighWaterMark(this, options, 'readableHighWaterMark', true) : null;
    if (readableHighWaterMark === 0) {
      // A Duplex will buffer both on the writable and readable side while
      // a Transform just wants to buffer hwm number of elements. To avoid
      // buffering twice we disable buffering on the writable side.
      options = {
        ...options,
        highWaterMark: null,
        readableHighWaterMark,
        // TODO (ronag): 0 is not optimal since we have
        // a "bug" where we check needDrain before calling _write and not after.
        // Refs: https://github.com/nodejs/node/pull/32887
        // Refs: https://github.com/nodejs/node/pull/35941
        writableHighWaterMark: options.writableHighWaterMark || 0
      };
    }
    Duplex.call(this, options);

    // We have implemented the _read method, and done the other things
    // that Readable wants before the first _read call, so unset the
    // sync guard flag.
    this._readableState.sync = false;
    this[kCallback] = null;
    if (options) {
      if (typeof options.transform === 'function') this._transform = options.transform;
      if (typeof options.flush === 'function') this._flush = options.flush;
    }

    // When the writable side finishes, then flush out anything remaining.
    // Backwards compat. Some Transform streams incorrectly implement _final
    // instead of or in addition to _flush. By using 'prefinish' instead of
    // implementing _final we continue supporting this unfortunate use case.
    this.on('prefinish', prefinish);
  }
  function final(cb) {
    if (typeof this._flush === 'function' && !this.destroyed) {
      this._flush((er, data) => {
        if (er) {
          if (cb) {
            cb(er);
          } else {
            this.destroy(er);
          }
          return;
        }
        if (data != null) {
          this.push(data);
        }
        this.push(null);
        if (cb) {
          cb();
        }
      });
    } else {
      this.push(null);
      if (cb) {
        cb();
      }
    }
  }
  function prefinish() {
    if (this._final !== final) {
      final.call(this);
    }
  }
  Transform.prototype._final = final;
  Transform.prototype._transform = function (chunk, encoding, callback) {
    throw new ERR_METHOD_NOT_IMPLEMENTED('_transform()');
  };
  Transform.prototype._write = function (chunk, encoding, callback) {
    const rState = this._readableState;
    const wState = this._writableState;
    const length = rState.length;
    this._transform(chunk, encoding, (err, val) => {
      if (err) {
        callback(err);
        return;
      }
      if (val != null) {
        this.push(val);
      }
      if (wState.ended ||
      // Backwards compat.
      length === rState.length ||
      // Backwards compat.
      rState.length < rState.highWaterMark) {
        callback();
      } else {
        this[kCallback] = callback;
      }
    });
  };
  Transform.prototype._read = function () {
    if (this[kCallback]) {
      const callback = this[kCallback];
      this[kCallback] = null;
      callback();
    }
  };
  return transform;
}

var passthrough;
var hasRequiredPassthrough;
function requirePassthrough() {
  if (hasRequiredPassthrough) return passthrough;
  hasRequiredPassthrough = 1;
  const {
    ObjectSetPrototypeOf
  } = requirePrimordials();
  passthrough = PassThrough;
  const Transform = requireTransform();
  ObjectSetPrototypeOf(PassThrough.prototype, Transform.prototype);
  ObjectSetPrototypeOf(PassThrough, Transform);
  function PassThrough(options) {
    if (!(this instanceof PassThrough)) return new PassThrough(options);
    Transform.call(this, options);
  }
  PassThrough.prototype._transform = function (chunk, encoding, cb) {
    cb(null, chunk);
  };
  return passthrough;
}

/* replacement start */
var pipeline_1;
var hasRequiredPipeline;
function requirePipeline() {
  if (hasRequiredPipeline) return pipeline_1;
  hasRequiredPipeline = 1;
  const process = requireProcess()

  /* replacement end */
  // Ported from https://github.com/mafintosh/pump with
  // permission from the author, Mathias Buus (@mafintosh).
  ;
  const {
    ArrayIsArray,
    Promise,
    SymbolAsyncIterator
  } = requirePrimordials();
  const eos = requireEndOfStream();
  const {
    once
  } = requireUtil();
  const destroyImpl = requireDestroy();
  const Duplex = requireDuplex();
  const {
    aggregateTwoErrors,
    codes: {
      ERR_INVALID_ARG_TYPE,
      ERR_INVALID_RETURN_VALUE,
      ERR_MISSING_ARGS,
      ERR_STREAM_DESTROYED,
      ERR_STREAM_PREMATURE_CLOSE
    },
    AbortError
  } = requireErrors();
  const {
    validateFunction,
    validateAbortSignal
  } = requireValidators();
  const {
    isIterable,
    isReadable,
    isReadableNodeStream,
    isNodeStream
  } = requireUtils();
  const AbortController = globalThis.AbortController || requireAbortController().AbortController;
  let PassThrough;
  let Readable;
  function destroyer(stream, reading, writing) {
    let finished = false;
    stream.on('close', () => {
      finished = true;
    });
    const cleanup = eos(stream, {
      readable: reading,
      writable: writing
    }, err => {
      finished = !err;
    });
    return {
      destroy: err => {
        if (finished) return;
        finished = true;
        destroyImpl.destroyer(stream, err || new ERR_STREAM_DESTROYED('pipe'));
      },
      cleanup
    };
  }
  function popCallback(streams) {
    // Streams should never be an empty array. It should always contain at least
    // a single stream. Therefore optimize for the average case instead of
    // checking for length === 0 as well.
    validateFunction(streams[streams.length - 1], 'streams[stream.length - 1]');
    return streams.pop();
  }
  function makeAsyncIterable(val) {
    if (isIterable(val)) {
      return val;
    } else if (isReadableNodeStream(val)) {
      // Legacy streams are not Iterable.
      return fromReadable(val);
    }
    throw new ERR_INVALID_ARG_TYPE('val', ['Readable', 'Iterable', 'AsyncIterable'], val);
  }
  async function* fromReadable(val) {
    if (!Readable) {
      Readable = requireReadable();
    }
    yield* Readable.prototype[SymbolAsyncIterator].call(val);
  }
  async function pump(iterable, writable, finish, {
    end
  }) {
    let error;
    let onresolve = null;
    const resume = err => {
      if (err) {
        error = err;
      }
      if (onresolve) {
        const callback = onresolve;
        onresolve = null;
        callback();
      }
    };
    const wait = () => new Promise((resolve, reject) => {
      if (error) {
        reject(error);
      } else {
        onresolve = () => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        };
      }
    });
    writable.on('drain', resume);
    const cleanup = eos(writable, {
      readable: false
    }, resume);
    try {
      if (writable.writableNeedDrain) {
        await wait();
      }
      for await (const chunk of iterable) {
        if (!writable.write(chunk)) {
          await wait();
        }
      }
      if (end) {
        writable.end();
      }
      await wait();
      finish();
    } catch (err) {
      finish(error !== err ? aggregateTwoErrors(error, err) : err);
    } finally {
      cleanup();
      writable.off('drain', resume);
    }
  }
  function pipeline(...streams) {
    return pipelineImpl(streams, once(popCallback(streams)));
  }
  function pipelineImpl(streams, callback, opts) {
    if (streams.length === 1 && ArrayIsArray(streams[0])) {
      streams = streams[0];
    }
    if (streams.length < 2) {
      throw new ERR_MISSING_ARGS('streams');
    }
    const ac = new AbortController();
    const signal = ac.signal;
    const outerSignal = opts === null || opts === undefined ? undefined : opts.signal;

    // Need to cleanup event listeners if last stream is readable
    // https://github.com/nodejs/node/issues/35452
    const lastStreamCleanup = [];
    validateAbortSignal(outerSignal, 'options.signal');
    function abort() {
      finishImpl(new AbortError());
    }
    outerSignal === null || outerSignal === undefined ? undefined : outerSignal.addEventListener('abort', abort);
    let error;
    let value;
    const destroys = [];
    let finishCount = 0;
    function finish(err) {
      finishImpl(err, --finishCount === 0);
    }
    function finishImpl(err, final) {
      if (err && (!error || error.code === 'ERR_STREAM_PREMATURE_CLOSE')) {
        error = err;
      }
      if (!error && !final) {
        return;
      }
      while (destroys.length) {
        destroys.shift()(error);
      }
      outerSignal === null || outerSignal === undefined ? undefined : outerSignal.removeEventListener('abort', abort);
      ac.abort();
      if (final) {
        if (!error) {
          lastStreamCleanup.forEach(fn => fn());
        }
        process.nextTick(callback, error, value);
      }
    }
    let ret;
    for (let i = 0; i < streams.length; i++) {
      const stream = streams[i];
      const reading = i < streams.length - 1;
      const writing = i > 0;
      const end = reading || (opts === null || opts === undefined ? undefined : opts.end) !== false;
      const isLastStream = i === streams.length - 1;
      if (isNodeStream(stream)) {
        if (end) {
          const {
            destroy,
            cleanup
          } = destroyer(stream, reading, writing);
          destroys.push(destroy);
          if (isReadable(stream) && isLastStream) {
            lastStreamCleanup.push(cleanup);
          }
        }

        // Catch stream errors that occur after pipe/pump has completed.
        function onError(err) {
          if (err && err.name !== 'AbortError' && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
            finish(err);
          }
        }
        stream.on('error', onError);
        if (isReadable(stream) && isLastStream) {
          lastStreamCleanup.push(() => {
            stream.removeListener('error', onError);
          });
        }
      }
      if (i === 0) {
        if (typeof stream === 'function') {
          ret = stream({
            signal
          });
          if (!isIterable(ret)) {
            throw new ERR_INVALID_RETURN_VALUE('Iterable, AsyncIterable or Stream', 'source', ret);
          }
        } else if (isIterable(stream) || isReadableNodeStream(stream)) {
          ret = stream;
        } else {
          ret = Duplex.from(stream);
        }
      } else if (typeof stream === 'function') {
        ret = makeAsyncIterable(ret);
        ret = stream(ret, {
          signal
        });
        if (reading) {
          if (!isIterable(ret, true)) {
            throw new ERR_INVALID_RETURN_VALUE('AsyncIterable', `transform[${i - 1}]`, ret);
          }
        } else {
          var _ret;
          if (!PassThrough) {
            PassThrough = requirePassthrough();
          }

          // If the last argument to pipeline is not a stream
          // we must create a proxy stream so that pipeline(...)
          // always returns a stream which can be further
          // composed through `.pipe(stream)`.

          const pt = new PassThrough({
            objectMode: true
          });

          // Handle Promises/A+ spec, `then` could be a getter that throws on
          // second use.
          const then = (_ret = ret) === null || _ret === undefined ? undefined : _ret.then;
          if (typeof then === 'function') {
            finishCount++;
            then.call(ret, val => {
              value = val;
              if (val != null) {
                pt.write(val);
              }
              if (end) {
                pt.end();
              }
              process.nextTick(finish);
            }, err => {
              pt.destroy(err);
              process.nextTick(finish, err);
            });
          } else if (isIterable(ret, true)) {
            finishCount++;
            pump(ret, pt, finish, {
              end
            });
          } else {
            throw new ERR_INVALID_RETURN_VALUE('AsyncIterable or Promise', 'destination', ret);
          }
          ret = pt;
          const {
            destroy,
            cleanup
          } = destroyer(ret, false, true);
          destroys.push(destroy);
          if (isLastStream) {
            lastStreamCleanup.push(cleanup);
          }
        }
      } else if (isNodeStream(stream)) {
        if (isReadableNodeStream(ret)) {
          finishCount += 2;
          const cleanup = pipe(ret, stream, finish, {
            end
          });
          if (isReadable(stream) && isLastStream) {
            lastStreamCleanup.push(cleanup);
          }
        } else if (isIterable(ret)) {
          finishCount++;
          pump(ret, stream, finish, {
            end
          });
        } else {
          throw new ERR_INVALID_ARG_TYPE('val', ['Readable', 'Iterable', 'AsyncIterable'], ret);
        }
        ret = stream;
      } else {
        ret = Duplex.from(stream);
      }
    }
    if (signal !== null && signal !== undefined && signal.aborted || outerSignal !== null && outerSignal !== undefined && outerSignal.aborted) {
      process.nextTick(abort);
    }
    return ret;
  }
  function pipe(src, dst, finish, {
    end
  }) {
    let ended = false;
    dst.on('close', () => {
      if (!ended) {
        // Finish if the destination closes before the source has completed.
        finish(new ERR_STREAM_PREMATURE_CLOSE());
      }
    });
    src.pipe(dst, {
      end
    });
    if (end) {
      // Compat. Before node v10.12.0 stdio used to throw an error so
      // pipe() did/does not end() stdio destinations.
      // Now they allow it but "secretly" don't close the underlying fd.
      src.once('end', () => {
        ended = true;
        dst.end();
      });
    } else {
      finish();
    }
    eos(src, {
      readable: true,
      writable: false
    }, err => {
      const rState = src._readableState;
      if (err && err.code === 'ERR_STREAM_PREMATURE_CLOSE' && rState && rState.ended && !rState.errored && !rState.errorEmitted) {
        // Some readable streams will emit 'close' before 'end'. However, since
        // this is on the readable side 'end' should still be emitted if the
        // stream has been ended and no error emitted. This should be allowed in
        // favor of backwards compatibility. Since the stream is piped to a
        // destination this should not result in any observable difference.
        // We don't need to check if this is a writable premature close since
        // eos will only fail with premature close on the reading side for
        // duplex streams.
        src.once('end', finish).once('error', finish);
      } else {
        finish(err);
      }
    });
    return eos(dst, {
      readable: false,
      writable: true
    }, finish);
  }
  pipeline_1 = {
    pipelineImpl,
    pipeline
  };
  return pipeline_1;
}

var compose;
var hasRequiredCompose;
function requireCompose() {
  if (hasRequiredCompose) return compose;
  hasRequiredCompose = 1;
  const {
    pipeline
  } = requirePipeline();
  const Duplex = requireDuplex();
  const {
    destroyer
  } = requireDestroy();
  const {
    isNodeStream,
    isReadable,
    isWritable
  } = requireUtils();
  const {
    AbortError,
    codes: {
      ERR_INVALID_ARG_VALUE,
      ERR_MISSING_ARGS
    }
  } = requireErrors();
  compose = function compose(...streams) {
    if (streams.length === 0) {
      throw new ERR_MISSING_ARGS('streams');
    }
    if (streams.length === 1) {
      return Duplex.from(streams[0]);
    }
    const orgStreams = [...streams];
    if (typeof streams[0] === 'function') {
      streams[0] = Duplex.from(streams[0]);
    }
    if (typeof streams[streams.length - 1] === 'function') {
      const idx = streams.length - 1;
      streams[idx] = Duplex.from(streams[idx]);
    }
    for (let n = 0; n < streams.length; ++n) {
      if (!isNodeStream(streams[n])) {
        // TODO(ronag): Add checks for non streams.
        continue;
      }
      if (n < streams.length - 1 && !isReadable(streams[n])) {
        throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], 'must be readable');
      }
      if (n > 0 && !isWritable(streams[n])) {
        throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], 'must be writable');
      }
    }
    let ondrain;
    let onfinish;
    let onreadable;
    let onclose;
    let d;
    function onfinished(err) {
      const cb = onclose;
      onclose = null;
      if (cb) {
        cb(err);
      } else if (err) {
        d.destroy(err);
      } else if (!readable && !writable) {
        d.destroy();
      }
    }
    const head = streams[0];
    const tail = pipeline(streams, onfinished);
    const writable = !!isWritable(head);
    const readable = !!isReadable(tail);

    // TODO(ronag): Avoid double buffering.
    // Implement Writable/Readable/Duplex traits.
    // See, https://github.com/nodejs/node/pull/33515.
    d = new Duplex({
      // TODO (ronag): highWaterMark?
      writableObjectMode: !!(head !== null && head !== undefined && head.writableObjectMode),
      readableObjectMode: !!(tail !== null && tail !== undefined && tail.writableObjectMode),
      writable,
      readable
    });
    if (writable) {
      d._write = function (chunk, encoding, callback) {
        if (head.write(chunk, encoding)) {
          callback();
        } else {
          ondrain = callback;
        }
      };
      d._final = function (callback) {
        head.end();
        onfinish = callback;
      };
      head.on('drain', function () {
        if (ondrain) {
          const cb = ondrain;
          ondrain = null;
          cb();
        }
      });
      tail.on('finish', function () {
        if (onfinish) {
          const cb = onfinish;
          onfinish = null;
          cb();
        }
      });
    }
    if (readable) {
      tail.on('readable', function () {
        if (onreadable) {
          const cb = onreadable;
          onreadable = null;
          cb();
        }
      });
      tail.on('end', function () {
        d.push(null);
      });
      d._read = function () {
        while (true) {
          const buf = tail.read();
          if (buf === null) {
            onreadable = d._read;
            return;
          }
          if (!d.push(buf)) {
            return;
          }
        }
      };
    }
    d._destroy = function (err, callback) {
      if (!err && onclose !== null) {
        err = new AbortError();
      }
      onreadable = null;
      ondrain = null;
      onfinish = null;
      if (onclose === null) {
        callback(err);
      } else {
        onclose = callback;
        destroyer(tail, err);
      }
    };
    return d;
  };
  return compose;
}

var promises;
var hasRequiredPromises;
function requirePromises() {
  if (hasRequiredPromises) return promises;
  hasRequiredPromises = 1;
  const {
    ArrayPrototypePop,
    Promise
  } = requirePrimordials();
  const {
    isIterable,
    isNodeStream
  } = requireUtils();
  const {
    pipelineImpl: pl
  } = requirePipeline();
  const {
    finished
  } = requireEndOfStream();
  function pipeline(...streams) {
    return new Promise((resolve, reject) => {
      let signal;
      let end;
      const lastArg = streams[streams.length - 1];
      if (lastArg && typeof lastArg === 'object' && !isNodeStream(lastArg) && !isIterable(lastArg)) {
        const options = ArrayPrototypePop(streams);
        signal = options.signal;
        end = options.end;
      }
      pl(streams, (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      }, {
        signal,
        end
      });
    });
  }
  promises = {
    finished,
    pipeline
  };
  return promises;
}

/* replacement start */
var hasRequiredStream;
function requireStream() {
  if (hasRequiredStream) return streamExports;
  hasRequiredStream = 1;
  const {
    Buffer
  } = require$$4

  /* replacement end */
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.
  ;
  const {
    ObjectDefineProperty,
    ObjectKeys,
    ReflectApply
  } = requirePrimordials();
  const {
    promisify: {
      custom: customPromisify
    }
  } = requireUtil();
  const {
    streamReturningOperators,
    promiseReturningOperators
  } = requireOperators();
  const {
    codes: {
      ERR_ILLEGAL_CONSTRUCTOR
    }
  } = requireErrors();
  const compose = requireCompose();
  const {
    pipeline
  } = requirePipeline();
  const {
    destroyer
  } = requireDestroy();
  const eos = requireEndOfStream();
  const promises = requirePromises();
  const utils = requireUtils();
  const Stream = stream$1.exports = requireLegacy().Stream;
  Stream.isDisturbed = utils.isDisturbed;
  Stream.isErrored = utils.isErrored;
  Stream.isReadable = utils.isReadable;
  Stream.Readable = requireReadable();
  for (const key of ObjectKeys(streamReturningOperators)) {
    const op = streamReturningOperators[key];
    function fn(...args) {
      if (new.target) {
        throw ERR_ILLEGAL_CONSTRUCTOR();
      }
      return Stream.Readable.from(ReflectApply(op, this, args));
    }
    ObjectDefineProperty(fn, 'name', {
      __proto__: null,
      value: op.name
    });
    ObjectDefineProperty(fn, 'length', {
      __proto__: null,
      value: op.length
    });
    ObjectDefineProperty(Stream.Readable.prototype, key, {
      __proto__: null,
      value: fn,
      enumerable: false,
      configurable: true,
      writable: true
    });
  }
  for (const key of ObjectKeys(promiseReturningOperators)) {
    const op = promiseReturningOperators[key];
    function fn(...args) {
      if (new.target) {
        throw ERR_ILLEGAL_CONSTRUCTOR();
      }
      return ReflectApply(op, this, args);
    }
    ObjectDefineProperty(fn, 'name', {
      __proto__: null,
      value: op.name
    });
    ObjectDefineProperty(fn, 'length', {
      __proto__: null,
      value: op.length
    });
    ObjectDefineProperty(Stream.Readable.prototype, key, {
      __proto__: null,
      value: fn,
      enumerable: false,
      configurable: true,
      writable: true
    });
  }
  Stream.Writable = requireWritable();
  Stream.Duplex = requireDuplex();
  Stream.Transform = requireTransform();
  Stream.PassThrough = requirePassthrough();
  Stream.pipeline = pipeline;
  const {
    addAbortSignal
  } = requireAddAbortSignal();
  Stream.addAbortSignal = addAbortSignal;
  Stream.finished = eos;
  Stream.destroy = destroyer;
  Stream.compose = compose;
  ObjectDefineProperty(Stream, 'promises', {
    __proto__: null,
    configurable: true,
    enumerable: true,
    get() {
      return promises;
    }
  });
  ObjectDefineProperty(pipeline, customPromisify, {
    __proto__: null,
    enumerable: true,
    get() {
      return promises.pipeline;
    }
  });
  ObjectDefineProperty(eos, customPromisify, {
    __proto__: null,
    enumerable: true,
    get() {
      return promises.finished;
    }
  });

  // Backwards-compat with node 0.4.x
  Stream.Stream = Stream;
  Stream._isUint8Array = function isUint8Array(value) {
    return value instanceof Uint8Array;
  };
  Stream._uint8ArrayToBuffer = function _uint8ArrayToBuffer(chunk) {
    return Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  };
  return streamExports;
}

(function (module) {

  const Stream = require$$0$3;
  if (Stream && process.env.READABLE_STREAM === 'disable') {
    const promises = Stream.promises;

    // Explicit export naming is needed for ESM
    module.exports._uint8ArrayToBuffer = Stream._uint8ArrayToBuffer;
    module.exports._isUint8Array = Stream._isUint8Array;
    module.exports.isDisturbed = Stream.isDisturbed;
    module.exports.isErrored = Stream.isErrored;
    module.exports.isReadable = Stream.isReadable;
    module.exports.Readable = Stream.Readable;
    module.exports.Writable = Stream.Writable;
    module.exports.Duplex = Stream.Duplex;
    module.exports.Transform = Stream.Transform;
    module.exports.PassThrough = Stream.PassThrough;
    module.exports.addAbortSignal = Stream.addAbortSignal;
    module.exports.finished = Stream.finished;
    module.exports.destroy = Stream.destroy;
    module.exports.pipeline = Stream.pipeline;
    module.exports.compose = Stream.compose;
    Object.defineProperty(Stream, 'promises', {
      configurable: true,
      enumerable: true,
      get() {
        return promises;
      }
    });
    module.exports.Stream = Stream.Stream;
  } else {
    const CustomStream = requireStream();
    const promises = requirePromises();
    const originalDestroy = CustomStream.Readable.destroy;
    module.exports = CustomStream.Readable;

    // Explicit export naming is needed for ESM
    module.exports._uint8ArrayToBuffer = CustomStream._uint8ArrayToBuffer;
    module.exports._isUint8Array = CustomStream._isUint8Array;
    module.exports.isDisturbed = CustomStream.isDisturbed;
    module.exports.isErrored = CustomStream.isErrored;
    module.exports.isReadable = CustomStream.isReadable;
    module.exports.Readable = CustomStream.Readable;
    module.exports.Writable = CustomStream.Writable;
    module.exports.Duplex = CustomStream.Duplex;
    module.exports.Transform = CustomStream.Transform;
    module.exports.PassThrough = CustomStream.PassThrough;
    module.exports.addAbortSignal = CustomStream.addAbortSignal;
    module.exports.finished = CustomStream.finished;
    module.exports.destroy = CustomStream.destroy;
    module.exports.destroy = originalDestroy;
    module.exports.pipeline = CustomStream.pipeline;
    module.exports.compose = CustomStream.compose;
    Object.defineProperty(CustomStream, 'promises', {
      configurable: true,
      enumerable: true,
      get() {
        return promises;
      }
    });
    module.exports.Stream = CustomStream.Stream;
  }

  // Allow default importing
  module.exports.default = module.exports;
})(ours);

/**
 * Expose `Delegator`.
 */

var delegates = Delegator;

/**
 * Initialize a delegator.
 *
 * @param {Object} proto
 * @param {String} target
 * @api public
 */

function Delegator(proto, target) {
  if (!(this instanceof Delegator)) return new Delegator(proto, target);
  this.proto = proto;
  this.target = target;
  this.methods = [];
  this.getters = [];
  this.setters = [];
  this.fluents = [];
}

/**
 * Delegate method `name`.
 *
 * @param {String} name
 * @return {Delegator} self
 * @api public
 */

Delegator.prototype.method = function (name) {
  var proto = this.proto;
  var target = this.target;
  this.methods.push(name);
  proto[name] = function () {
    return this[target][name].apply(this[target], arguments);
  };
  return this;
};

/**
 * Delegator accessor `name`.
 *
 * @param {String} name
 * @return {Delegator} self
 * @api public
 */

Delegator.prototype.access = function (name) {
  return this.getter(name).setter(name);
};

/**
 * Delegator getter `name`.
 *
 * @param {String} name
 * @return {Delegator} self
 * @api public
 */

Delegator.prototype.getter = function (name) {
  var proto = this.proto;
  var target = this.target;
  this.getters.push(name);
  proto.__defineGetter__(name, function () {
    return this[target][name];
  });
  return this;
};

/**
 * Delegator setter `name`.
 *
 * @param {String} name
 * @return {Delegator} self
 * @api public
 */

Delegator.prototype.setter = function (name) {
  var proto = this.proto;
  var target = this.target;
  this.setters.push(name);
  proto.__defineSetter__(name, function (val) {
    return this[target][name] = val;
  });
  return this;
};

/**
 * Delegator fluent accessor
 *
 * @param {String} name
 * @return {Delegator} self
 * @api public
 */

Delegator.prototype.fluent = function (name) {
  var proto = this.proto;
  var target = this.target;
  this.fluents.push(name);
  proto[name] = function (val) {
    if ('undefined' != typeof val) {
      this[target][name] = val;
      return this;
    } else {
      return this[target][name];
    }
  };
  return this;
};

var util$2 = require$$0$2;
var stream = oursExports;
var delegate = delegates;
var Tracker$1 = trackerExports;
var TrackerStream$1 = trackerStream.exports = function (name, size, options) {
  stream.Transform.call(this, options);
  this.tracker = new Tracker$1(name, size);
  this.name = name;
  this.id = this.tracker.id;
  this.tracker.on('change', delegateChange(this));
};
util$2.inherits(TrackerStream$1, stream.Transform);
function delegateChange(trackerStream) {
  return function (name, completion, tracker) {
    trackerStream.emit('change', name, completion, trackerStream);
  };
}
TrackerStream$1.prototype._transform = function (data, encoding, cb) {
  this.tracker.completeWork(data.length ? data.length : 1);
  this.push(data);
  cb();
};
TrackerStream$1.prototype._flush = function (cb) {
  this.tracker.finish();
  cb();
};
delegate(TrackerStream$1.prototype, 'tracker').method('completed').method('addWork').method('finish');

var util$1 = require$$0$2;
var TrackerBase = trackerBaseExports;
var Tracker = trackerExports;
var TrackerStream = trackerStreamExports;
var TrackerGroup = trackerGroup.exports = function (name) {
  TrackerBase.call(this, name);
  this.parentGroup = null;
  this.trackers = [];
  this.completion = {};
  this.weight = {};
  this.totalWeight = 0;
  this.finished = false;
  this.bubbleChange = bubbleChange(this);
};
util$1.inherits(TrackerGroup, TrackerBase);
function bubbleChange(trackerGroup) {
  return function (name, completed, tracker) {
    trackerGroup.completion[tracker.id] = completed;
    if (trackerGroup.finished) {
      return;
    }
    trackerGroup.emit('change', name || trackerGroup.name, trackerGroup.completed(), trackerGroup);
  };
}
TrackerGroup.prototype.nameInTree = function () {
  var names = [];
  var from = this;
  while (from) {
    names.unshift(from.name);
    from = from.parentGroup;
  }
  return names.join('/');
};
TrackerGroup.prototype.addUnit = function (unit, weight) {
  if (unit.addUnit) {
    var toTest = this;
    while (toTest) {
      if (unit === toTest) {
        throw new Error('Attempted to add tracker group ' + unit.name + ' to tree that already includes it ' + this.nameInTree(this));
      }
      toTest = toTest.parentGroup;
    }
    unit.parentGroup = this;
  }
  this.weight[unit.id] = weight || 1;
  this.totalWeight += this.weight[unit.id];
  this.trackers.push(unit);
  this.completion[unit.id] = unit.completed();
  unit.on('change', this.bubbleChange);
  if (!this.finished) {
    this.emit('change', unit.name, this.completion[unit.id], unit);
  }
  return unit;
};
TrackerGroup.prototype.completed = function () {
  if (this.trackers.length === 0) {
    return 0;
  }
  var valPerWeight = 1 / this.totalWeight;
  var completed = 0;
  for (var ii = 0; ii < this.trackers.length; ii++) {
    var trackerId = this.trackers[ii].id;
    completed += valPerWeight * this.weight[trackerId] * this.completion[trackerId];
  }
  return completed;
};
TrackerGroup.prototype.newGroup = function (name, weight) {
  return this.addUnit(new TrackerGroup(name), weight);
};
TrackerGroup.prototype.newItem = function (name, todo, weight) {
  return this.addUnit(new Tracker(name, todo), weight);
};
TrackerGroup.prototype.newStream = function (name, todo, weight) {
  return this.addUnit(new TrackerStream(name, todo), weight);
};
TrackerGroup.prototype.finish = function () {
  this.finished = true;
  if (!this.trackers.length) {
    this.addUnit(new Tracker(), 1, true);
  }
  for (var ii = 0; ii < this.trackers.length; ii++) {
    var tracker = this.trackers[ii];
    tracker.finish();
    tracker.removeListener('change', this.bubbleChange);
  }
  this.emit('change', this.name, 1, this);
};
var buffer = '                                  ';
TrackerGroup.prototype.debug = function (depth) {
  depth = depth || 0;
  var indent = depth ? buffer.slice(0, depth) : '';
  var output = indent + (this.name || 'top') + ': ' + this.completed() + '\n';
  this.trackers.forEach(function (tracker) {
    if (tracker instanceof TrackerGroup) {
      output += tracker.debug(depth + 1);
    } else {
      output += indent + ' ' + tracker.name + ': ' + tracker.completed() + '\n';
    }
  });
  return output;
};

lib$1.TrackerGroup = trackerGroupExports;
lib$1.Tracker = trackerExports;
lib$1.TrackerStream = trackerStreamExports;

var plumbingExports = {};
var plumbing = {
  get exports(){ return plumbingExports; },
  set exports(v){ plumbingExports = v; },
};

var consoleControlStrings = {};

// These tables borrowed from `ansi`

var prefix = '\x1b[';
consoleControlStrings.up = function up(num) {
  return prefix + (num || '') + 'A';
};
consoleControlStrings.down = function down(num) {
  return prefix + (num || '') + 'B';
};
consoleControlStrings.forward = function forward(num) {
  return prefix + (num || '') + 'C';
};
consoleControlStrings.back = function back(num) {
  return prefix + (num || '') + 'D';
};
consoleControlStrings.nextLine = function nextLine(num) {
  return prefix + (num || '') + 'E';
};
consoleControlStrings.previousLine = function previousLine(num) {
  return prefix + (num || '') + 'F';
};
consoleControlStrings.horizontalAbsolute = function horizontalAbsolute(num) {
  if (num == null) throw new Error('horizontalAboslute requires a column to position to');
  return prefix + num + 'G';
};
consoleControlStrings.eraseData = function eraseData() {
  return prefix + 'J';
};
consoleControlStrings.eraseLine = function eraseLine() {
  return prefix + 'K';
};
consoleControlStrings.goto = function (x, y) {
  return prefix + y + ';' + x + 'H';
};
consoleControlStrings.gotoSOL = function () {
  return '\r';
};
consoleControlStrings.beep = function () {
  return '\x07';
};
consoleControlStrings.hideCursor = function hideCursor() {
  return prefix + '?25l';
};
consoleControlStrings.showCursor = function showCursor() {
  return prefix + '?25h';
};
var colors = {
  reset: 0,
  // styles
  bold: 1,
  italic: 3,
  underline: 4,
  inverse: 7,
  // resets
  stopBold: 22,
  stopItalic: 23,
  stopUnderline: 24,
  stopInverse: 27,
  // colors
  white: 37,
  black: 30,
  blue: 34,
  cyan: 36,
  green: 32,
  magenta: 35,
  red: 31,
  yellow: 33,
  bgWhite: 47,
  bgBlack: 40,
  bgBlue: 44,
  bgCyan: 46,
  bgGreen: 42,
  bgMagenta: 45,
  bgRed: 41,
  bgYellow: 43,
  grey: 90,
  brightBlack: 90,
  brightRed: 91,
  brightGreen: 92,
  brightYellow: 93,
  brightBlue: 94,
  brightMagenta: 95,
  brightCyan: 96,
  brightWhite: 97,
  bgGrey: 100,
  bgBrightBlack: 100,
  bgBrightRed: 101,
  bgBrightGreen: 102,
  bgBrightYellow: 103,
  bgBrightBlue: 104,
  bgBrightMagenta: 105,
  bgBrightCyan: 106,
  bgBrightWhite: 107
};
consoleControlStrings.color = function color(colorWith) {
  if (arguments.length !== 1 || !Array.isArray(colorWith)) {
    colorWith = Array.prototype.slice.call(arguments);
  }
  return prefix + colorWith.map(colorNameToCode).join(';') + 'm';
};
function colorNameToCode(color) {
  if (colors[color] != null) return colors[color];
  throw new Error('Unknown color or style name: ' + color);
}

var renderTemplateExports = {};
var renderTemplate$3 = {
  get exports(){ return renderTemplateExports; },
  set exports(v){ renderTemplateExports = v; },
};

var align$1 = {};

var stringWidthExports = {};
var stringWidth$5 = {
  get exports(){ return stringWidthExports; },
  set exports(v){ stringWidthExports = v; },
};

var ansiRegex$1 = ({
  onlyFirst = false
} = {}) => {
  const pattern = ['[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)', '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'].join('|');
  return new RegExp(pattern, onlyFirst ? undefined : 'g');
};

const ansiRegex = ansiRegex$1;
var stripAnsi$2 = string => typeof string === 'string' ? string.replace(ansiRegex(), '') : string;

var isFullwidthCodePointExports = {};
var isFullwidthCodePoint$2 = {
  get exports(){ return isFullwidthCodePointExports; },
  set exports(v){ isFullwidthCodePointExports = v; },
};

/* eslint-disable yoda */
const isFullwidthCodePoint$1 = codePoint => {
  if (Number.isNaN(codePoint)) {
    return false;
  }

  // Code points are derived from:
  // http://www.unix.org/Public/UNIDATA/EastAsianWidth.txt
  if (codePoint >= 0x1100 && (codePoint <= 0x115F ||
  // Hangul Jamo
  codePoint === 0x2329 ||
  // LEFT-POINTING ANGLE BRACKET
  codePoint === 0x232A ||
  // RIGHT-POINTING ANGLE BRACKET
  // CJK Radicals Supplement .. Enclosed CJK Letters and Months
  0x2E80 <= codePoint && codePoint <= 0x3247 && codePoint !== 0x303F ||
  // Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
  0x3250 <= codePoint && codePoint <= 0x4DBF ||
  // CJK Unified Ideographs .. Yi Radicals
  0x4E00 <= codePoint && codePoint <= 0xA4C6 ||
  // Hangul Jamo Extended-A
  0xA960 <= codePoint && codePoint <= 0xA97C ||
  // Hangul Syllables
  0xAC00 <= codePoint && codePoint <= 0xD7A3 ||
  // CJK Compatibility Ideographs
  0xF900 <= codePoint && codePoint <= 0xFAFF ||
  // Vertical Forms
  0xFE10 <= codePoint && codePoint <= 0xFE19 ||
  // CJK Compatibility Forms .. Small Form Variants
  0xFE30 <= codePoint && codePoint <= 0xFE6B ||
  // Halfwidth and Fullwidth Forms
  0xFF01 <= codePoint && codePoint <= 0xFF60 || 0xFFE0 <= codePoint && codePoint <= 0xFFE6 ||
  // Kana Supplement
  0x1B000 <= codePoint && codePoint <= 0x1B001 ||
  // Enclosed Ideographic Supplement
  0x1F200 <= codePoint && codePoint <= 0x1F251 ||
  // CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
  0x20000 <= codePoint && codePoint <= 0x3FFFD)) {
    return true;
  }
  return false;
};
isFullwidthCodePoint$2.exports = isFullwidthCodePoint$1;
isFullwidthCodePointExports.default = isFullwidthCodePoint$1;

var emojiRegex$1 = function () {
  // https://mths.be/emoji
  return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
};

const stripAnsi$1 = stripAnsi$2;
const isFullwidthCodePoint = isFullwidthCodePointExports;
const emojiRegex = emojiRegex$1;
const stringWidth$4 = string => {
  if (typeof string !== 'string' || string.length === 0) {
    return 0;
  }
  string = stripAnsi$1(string);
  if (string.length === 0) {
    return 0;
  }
  string = string.replace(emojiRegex(), '  ');
  let width = 0;
  for (let i = 0; i < string.length; i++) {
    const code = string.codePointAt(i);

    // Ignore control characters
    if (code <= 0x1F || code >= 0x7F && code <= 0x9F) {
      continue;
    }

    // Ignore combining characters
    if (code >= 0x300 && code <= 0x36F) {
      continue;
    }

    // Surrogates
    if (code > 0xFFFF) {
      i++;
    }
    width += isFullwidthCodePoint(code) ? 2 : 1;
  }
  return width;
};
stringWidth$5.exports = stringWidth$4;
// TODO: remove this in the next major version
stringWidthExports.default = stringWidth$4;

var stringWidth$3 = stringWidthExports;
align$1.center = alignCenter;
align$1.left = alignLeft;
align$1.right = alignRight;

// lodash's way of generating pad characters.

function createPadding(width) {
  var result = '';
  var string = ' ';
  var n = width;
  do {
    if (n % 2) {
      result += string;
    }
    n = Math.floor(n / 2);
    string += string;
  } while (n);
  return result;
}
function alignLeft(str, width) {
  var trimmed = str.trimRight();
  if (trimmed.length === 0 && str.length >= width) return str;
  var padding = '';
  var strWidth = stringWidth$3(trimmed);
  if (strWidth < width) {
    padding = createPadding(width - strWidth);
  }
  return trimmed + padding;
}
function alignRight(str, width) {
  var trimmed = str.trimLeft();
  if (trimmed.length === 0 && str.length >= width) return str;
  var padding = '';
  var strWidth = stringWidth$3(trimmed);
  if (strWidth < width) {
    padding = createPadding(width - strWidth);
  }
  return padding + trimmed;
}
function alignCenter(str, width) {
  var trimmed = str.trim();
  if (trimmed.length === 0 && str.length >= width) return str;
  var padLeft = '';
  var padRight = '';
  var strWidth = stringWidth$3(trimmed);
  if (strWidth < width) {
    var padLeftBy = parseInt((width - strWidth) / 2, 10);
    padLeft = createPadding(padLeftBy);
    padRight = createPadding(width - (strWidth + padLeftBy));
  }
  return padLeft + trimmed + padRight;
}

var aproba = validate$3;
function isArguments(thingy) {
  return thingy != null && typeof thingy === 'object' && thingy.hasOwnProperty('callee');
}
const types = {
  '*': {
    label: 'any',
    check: () => true
  },
  A: {
    label: 'array',
    check: _ => Array.isArray(_) || isArguments(_)
  },
  S: {
    label: 'string',
    check: _ => typeof _ === 'string'
  },
  N: {
    label: 'number',
    check: _ => typeof _ === 'number'
  },
  F: {
    label: 'function',
    check: _ => typeof _ === 'function'
  },
  O: {
    label: 'object',
    check: _ => typeof _ === 'object' && _ != null && !types.A.check(_) && !types.E.check(_)
  },
  B: {
    label: 'boolean',
    check: _ => typeof _ === 'boolean'
  },
  E: {
    label: 'error',
    check: _ => _ instanceof Error
  },
  Z: {
    label: 'null',
    check: _ => _ == null
  }
};
function addSchema(schema, arity) {
  const group = arity[schema.length] = arity[schema.length] || [];
  if (group.indexOf(schema) === -1) group.push(schema);
}
function validate$3(rawSchemas, args) {
  if (arguments.length !== 2) throw wrongNumberOfArgs(['SA'], arguments.length);
  if (!rawSchemas) throw missingRequiredArg(0);
  if (!args) throw missingRequiredArg(1);
  if (!types.S.check(rawSchemas)) throw invalidType(0, ['string'], rawSchemas);
  if (!types.A.check(args)) throw invalidType(1, ['array'], args);
  const schemas = rawSchemas.split('|');
  const arity = {};
  schemas.forEach(schema => {
    for (let ii = 0; ii < schema.length; ++ii) {
      const type = schema[ii];
      if (!types[type]) throw unknownType(ii, type);
    }
    if (/E.*E/.test(schema)) throw moreThanOneError(schema);
    addSchema(schema, arity);
    if (/E/.test(schema)) {
      addSchema(schema.replace(/E.*$/, 'E'), arity);
      addSchema(schema.replace(/E/, 'Z'), arity);
      if (schema.length === 1) addSchema('', arity);
    }
  });
  let matching = arity[args.length];
  if (!matching) {
    throw wrongNumberOfArgs(Object.keys(arity), args.length);
  }
  for (let ii = 0; ii < args.length; ++ii) {
    let newMatching = matching.filter(schema => {
      const type = schema[ii];
      const typeCheck = types[type].check;
      return typeCheck(args[ii]);
    });
    if (!newMatching.length) {
      const labels = matching.map(_ => types[_[ii]].label).filter(_ => _ != null);
      throw invalidType(ii, labels, args[ii]);
    }
    matching = newMatching;
  }
}
function missingRequiredArg(num) {
  return newException('EMISSINGARG', 'Missing required argument #' + (num + 1));
}
function unknownType(num, type) {
  return newException('EUNKNOWNTYPE', 'Unknown type ' + type + ' in argument #' + (num + 1));
}
function invalidType(num, expectedTypes, value) {
  let valueType;
  Object.keys(types).forEach(typeCode => {
    if (types[typeCode].check(value)) valueType = types[typeCode].label;
  });
  return newException('EINVALIDTYPE', 'Argument #' + (num + 1) + ': Expected ' + englishList(expectedTypes) + ' but got ' + valueType);
}
function englishList(list) {
  return list.join(', ').replace(/, ([^,]+)$/, ' or $1');
}
function wrongNumberOfArgs(expected, got) {
  const english = englishList(expected);
  const args = expected.every(ex => ex.length === 1) ? 'argument' : 'arguments';
  return newException('EWRONGARGCOUNT', 'Expected ' + english + ' ' + args + ' but got ' + got);
}
function moreThanOneError(schema) {
  return newException('ETOOMANYERRORTYPES', 'Only one error type per argument signature is allowed, more than one found in "' + schema + '"');
}
function newException(code, msg) {
  const err = new Error(msg);
  err.code = code;
  /* istanbul ignore else */
  if (Error.captureStackTrace) Error.captureStackTrace(err, validate$3);
  return err;
}

var stringWidth$2 = stringWidthExports;
var stripAnsi = stripAnsi$2;
var wideTruncate_1 = wideTruncate$2;
function wideTruncate$2(str, target) {
  if (stringWidth$2(str) === 0) {
    return str;
  }
  if (target <= 0) {
    return '';
  }
  if (stringWidth$2(str) <= target) {
    return str;
  }

  // We compute the number of bytes of ansi sequences here and add
  // that to our initial truncation to ensure that we don't slice one
  // that we want to keep in half.
  var noAnsi = stripAnsi(str);
  var ansiSize = str.length + noAnsi.length;
  var truncated = str.slice(0, target + ansiSize);

  // we have to shrink the result to account for our ansi sequence buffer
  // (if an ansi sequence was truncated) and double width characters.
  while (stringWidth$2(truncated) > target) {
    truncated = truncated.slice(0, -1);
  }
  return truncated;
}

var error$1 = {};

var util = require$$0$2;
var User = error$1.User = function User(msg) {
  var err = new Error(msg);
  Error.captureStackTrace(err, User);
  err.code = 'EGAUGE';
  return err;
};
error$1.MissingTemplateValue = function MissingTemplateValue(item, values) {
  var err = new User(util.format('Missing template value "%s"', item.type));
  Error.captureStackTrace(err, MissingTemplateValue);
  err.template = item;
  err.values = values;
  return err;
};
error$1.Internal = function Internal(msg) {
  var err = new Error(msg);
  Error.captureStackTrace(err, Internal);
  err.code = 'EGAUGEINTERNAL';
  return err;
};

var stringWidth$1 = stringWidthExports;
var templateItem = TemplateItem$1;
function isPercent(num) {
  if (typeof num !== 'string') {
    return false;
  }
  return num.slice(-1) === '%';
}
function percent(num) {
  return Number(num.slice(0, -1)) / 100;
}
function TemplateItem$1(values, outputLength) {
  this.overallOutputLength = outputLength;
  this.finished = false;
  this.type = null;
  this.value = null;
  this.length = null;
  this.maxLength = null;
  this.minLength = null;
  this.kerning = null;
  this.align = 'left';
  this.padLeft = 0;
  this.padRight = 0;
  this.index = null;
  this.first = null;
  this.last = null;
  if (typeof values === 'string') {
    this.value = values;
  } else {
    for (var prop in values) {
      this[prop] = values[prop];
    }
  }
  // Realize percents
  if (isPercent(this.length)) {
    this.length = Math.round(this.overallOutputLength * percent(this.length));
  }
  if (isPercent(this.minLength)) {
    this.minLength = Math.round(this.overallOutputLength * percent(this.minLength));
  }
  if (isPercent(this.maxLength)) {
    this.maxLength = Math.round(this.overallOutputLength * percent(this.maxLength));
  }
  return this;
}
TemplateItem$1.prototype = {};
TemplateItem$1.prototype.getBaseLength = function () {
  var length = this.length;
  if (length == null && typeof this.value === 'string' && this.maxLength == null && this.minLength == null) {
    length = stringWidth$1(this.value);
  }
  return length;
};
TemplateItem$1.prototype.getLength = function () {
  var length = this.getBaseLength();
  if (length == null) {
    return null;
  }
  return length + this.padLeft + this.padRight;
};
TemplateItem$1.prototype.getMaxLength = function () {
  if (this.maxLength == null) {
    return null;
  }
  return this.maxLength + this.padLeft + this.padRight;
};
TemplateItem$1.prototype.getMinLength = function () {
  if (this.minLength == null) {
    return null;
  }
  return this.minLength + this.padLeft + this.padRight;
};

var align = align$1;
var validate$2 = aproba;
var wideTruncate$1 = wideTruncate_1;
var error = error$1;
var TemplateItem = templateItem;
function renderValueWithValues(values) {
  return function (item) {
    return renderValue(item, values);
  };
}
var renderTemplate$2 = renderTemplate$3.exports = function (width, template, values) {
  var items = prepareItems(width, template, values);
  var rendered = items.map(renderValueWithValues(values)).join('');
  return align.left(wideTruncate$1(rendered, width), width);
};
function preType(item) {
  var cappedTypeName = item.type[0].toUpperCase() + item.type.slice(1);
  return 'pre' + cappedTypeName;
}
function postType(item) {
  var cappedTypeName = item.type[0].toUpperCase() + item.type.slice(1);
  return 'post' + cappedTypeName;
}
function hasPreOrPost(item, values) {
  if (!item.type) {
    return;
  }
  return values[preType(item)] || values[postType(item)];
}
function generatePreAndPost(baseItem, parentValues) {
  var item = Object.assign({}, baseItem);
  var values = Object.create(parentValues);
  var template = [];
  var pre = preType(item);
  var post = postType(item);
  if (values[pre]) {
    template.push({
      value: values[pre]
    });
    values[pre] = null;
  }
  item.minLength = null;
  item.length = null;
  item.maxLength = null;
  template.push(item);
  values[item.type] = values[item.type];
  if (values[post]) {
    template.push({
      value: values[post]
    });
    values[post] = null;
  }
  return function ($1, $2, length) {
    return renderTemplate$2(length, template, values);
  };
}
function prepareItems(width, template, values) {
  function cloneAndObjectify(item, index, arr) {
    var cloned = new TemplateItem(item, width);
    var type = cloned.type;
    if (cloned.value == null) {
      if (!(type in values)) {
        if (cloned.default == null) {
          throw new error.MissingTemplateValue(cloned, values);
        } else {
          cloned.value = cloned.default;
        }
      } else {
        cloned.value = values[type];
      }
    }
    if (cloned.value == null || cloned.value === '') {
      return null;
    }
    cloned.index = index;
    cloned.first = index === 0;
    cloned.last = index === arr.length - 1;
    if (hasPreOrPost(cloned, values)) {
      cloned.value = generatePreAndPost(cloned, values);
    }
    return cloned;
  }
  var output = template.map(cloneAndObjectify).filter(function (item) {
    return item != null;
  });
  var remainingSpace = width;
  var variableCount = output.length;
  function consumeSpace(length) {
    if (length > remainingSpace) {
      length = remainingSpace;
    }
    remainingSpace -= length;
  }
  function finishSizing(item, length) {
    if (item.finished) {
      throw new error.Internal('Tried to finish template item that was already finished');
    }
    if (length === Infinity) {
      throw new error.Internal('Length of template item cannot be infinity');
    }
    if (length != null) {
      item.length = length;
    }
    item.minLength = null;
    item.maxLength = null;
    --variableCount;
    item.finished = true;
    if (item.length == null) {
      item.length = item.getBaseLength();
    }
    if (item.length == null) {
      throw new error.Internal('Finished template items must have a length');
    }
    consumeSpace(item.getLength());
  }
  output.forEach(function (item) {
    if (!item.kerning) {
      return;
    }
    var prevPadRight = item.first ? 0 : output[item.index - 1].padRight;
    if (!item.first && prevPadRight < item.kerning) {
      item.padLeft = item.kerning - prevPadRight;
    }
    if (!item.last) {
      item.padRight = item.kerning;
    }
  });

  // Finish any that have a fixed (literal or intuited) length
  output.forEach(function (item) {
    if (item.getBaseLength() == null) {
      return;
    }
    finishSizing(item);
  });
  var resized = 0;
  var resizing;
  var hunkSize;
  do {
    resizing = false;
    hunkSize = Math.round(remainingSpace / variableCount);
    output.forEach(function (item) {
      if (item.finished) {
        return;
      }
      if (!item.maxLength) {
        return;
      }
      if (item.getMaxLength() < hunkSize) {
        finishSizing(item, item.maxLength);
        resizing = true;
      }
    });
  } while (resizing && resized++ < output.length);
  if (resizing) {
    throw new error.Internal('Resize loop iterated too many times while determining maxLength');
  }
  resized = 0;
  do {
    resizing = false;
    hunkSize = Math.round(remainingSpace / variableCount);
    output.forEach(function (item) {
      if (item.finished) {
        return;
      }
      if (!item.minLength) {
        return;
      }
      if (item.getMinLength() >= hunkSize) {
        finishSizing(item, item.minLength);
        resizing = true;
      }
    });
  } while (resizing && resized++ < output.length);
  if (resizing) {
    throw new error.Internal('Resize loop iterated too many times while determining minLength');
  }
  hunkSize = Math.round(remainingSpace / variableCount);
  output.forEach(function (item) {
    if (item.finished) {
      return;
    }
    finishSizing(item, hunkSize);
  });
  return output;
}
function renderFunction(item, values, length) {
  validate$2('OON', arguments);
  if (item.type) {
    return item.value(values, values[item.type + 'Theme'] || {}, length);
  } else {
    return item.value(values, {}, length);
  }
}
function renderValue(item, values) {
  var length = item.getBaseLength();
  var value = typeof item.value === 'function' ? renderFunction(item, values, length) : item.value;
  if (value == null || value === '') {
    return '';
  }
  var alignWith = align[item.align] || align.left;
  var leftPadding = item.padLeft ? align.left('', item.padLeft) : '';
  var rightPadding = item.padRight ? align.right('', item.padRight) : '';
  var truncated = wideTruncate$1(String(value), length);
  var aligned = alignWith(truncated, length);
  return leftPadding + aligned + rightPadding;
}

var consoleControl = consoleControlStrings;
var renderTemplate$1 = renderTemplateExports;
var validate$1 = aproba;
var Plumbing$1 = plumbing.exports = function (theme, template, width) {
  if (!width) {
    width = 80;
  }
  validate$1('OAN', [theme, template, width]);
  this.showing = false;
  this.theme = theme;
  this.width = width;
  this.template = template;
};
Plumbing$1.prototype = {};
Plumbing$1.prototype.setTheme = function (theme) {
  validate$1('O', [theme]);
  this.theme = theme;
};
Plumbing$1.prototype.setTemplate = function (template) {
  validate$1('A', [template]);
  this.template = template;
};
Plumbing$1.prototype.setWidth = function (width) {
  validate$1('N', [width]);
  this.width = width;
};
Plumbing$1.prototype.hide = function () {
  return consoleControl.gotoSOL() + consoleControl.eraseLine();
};
Plumbing$1.prototype.hideCursor = consoleControl.hideCursor;
Plumbing$1.prototype.showCursor = consoleControl.showCursor;
Plumbing$1.prototype.show = function (status) {
  var values = Object.create(this.theme);
  for (var key in status) {
    values[key] = status[key];
  }
  return renderTemplate$1(this.width, this.template, values).trim() + consoleControl.color('reset') + consoleControl.eraseLine() + consoleControl.gotoSOL();
};

var hasUnicodeExports = {};
var hasUnicode$1 = {
  get exports(){ return hasUnicodeExports; },
  set exports(v){ hasUnicodeExports = v; },
};

var os = require$$0$4;
hasUnicode$1.exports = function () {
  // Recent Win32 platforms (>XP) CAN support unicode in the console but
  // don't have to, and in non-english locales often use traditional local
  // code pages. There's no way, short of windows system calls or execing
  // the chcp command line program to figure this out. As such, we default
  // this to false and encourage your users to override it via config if
  // appropriate.
  if (os.type() == "Windows_NT") {
    return false;
  }
  var isUTF8 = /UTF-?8$/i;
  var ctype = process.env.LC_ALL || process.env.LC_CTYPE || process.env.LANG;
  return isUTF8.test(ctype);
};

// call it on itself so we can test the export val for basic stuff
var colorSupport_1 = colorSupport$1({
  alwaysReturn: true
}, colorSupport$1);
function hasNone(obj, options) {
  obj.level = 0;
  obj.hasBasic = false;
  obj.has256 = false;
  obj.has16m = false;
  if (!options.alwaysReturn) {
    return false;
  }
  return obj;
}
function hasBasic(obj) {
  obj.hasBasic = true;
  obj.has256 = false;
  obj.has16m = false;
  obj.level = 1;
  return obj;
}
function has256(obj) {
  obj.hasBasic = true;
  obj.has256 = true;
  obj.has16m = false;
  obj.level = 2;
  return obj;
}
function has16m(obj) {
  obj.hasBasic = true;
  obj.has256 = true;
  obj.has16m = true;
  obj.level = 3;
  return obj;
}
function colorSupport$1(options, obj) {
  options = options || {};
  obj = obj || {};

  // if just requesting a specific level, then return that.
  if (typeof options.level === 'number') {
    switch (options.level) {
      case 0:
        return hasNone(obj, options);
      case 1:
        return hasBasic(obj);
      case 2:
        return has256(obj);
      case 3:
        return has16m(obj);
    }
  }
  obj.level = 0;
  obj.hasBasic = false;
  obj.has256 = false;
  obj.has16m = false;
  if (typeof process === 'undefined' || !process || !process.stdout || !process.env || !process.platform) {
    return hasNone(obj, options);
  }
  var env = options.env || process.env;
  var stream = options.stream || process.stdout;
  var term = options.term || env.TERM || '';
  var platform = options.platform || process.platform;
  if (!options.ignoreTTY && !stream.isTTY) {
    return hasNone(obj, options);
  }
  if (!options.ignoreDumb && term === 'dumb' && !env.COLORTERM) {
    return hasNone(obj, options);
  }
  if (platform === 'win32') {
    return hasBasic(obj);
  }
  if (env.TMUX) {
    return has256(obj);
  }
  if (!options.ignoreCI && (env.CI || env.TEAMCITY_VERSION)) {
    if (env.TRAVIS) {
      return has256(obj);
    } else {
      return hasNone(obj, options);
    }
  }

  // TODO: add more term programs
  switch (env.TERM_PROGRAM) {
    case 'iTerm.app':
      var ver = env.TERM_PROGRAM_VERSION || '0.';
      if (/^[0-2]\./.test(ver)) {
        return has256(obj);
      } else {
        return has16m(obj);
      }
    case 'HyperTerm':
    case 'Hyper':
      return has16m(obj);
    case 'MacTerm':
      return has16m(obj);
    case 'Apple_Terminal':
      return has256(obj);
  }
  if (/^xterm-256/.test(term)) {
    return has256(obj);
  }
  if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(term)) {
    return hasBasic(obj);
  }
  if (env.COLORTERM) {
    return hasBasic(obj);
  }
  return hasNone(obj, options);
}

var colorSupport = colorSupport_1;
var hasColor$1 = colorSupport().hasBasic;

var signalExitExports = {};
var signalExit = {
  get exports(){ return signalExitExports; },
  set exports(v){ signalExitExports = v; },
};

var signalsExports = {};
var signals$1 = {
  get exports(){ return signalsExports; },
  set exports(v){ signalsExports = v; },
};

var hasRequiredSignals;
function requireSignals() {
  if (hasRequiredSignals) return signalsExports;
  hasRequiredSignals = 1;
  (function (module) {
    // This is not the set of all possible signals.
    //
    // It IS, however, the set of all signals that trigger
    // an exit on either Linux or BSD systems.  Linux is a
    // superset of the signal names supported on BSD, and
    // the unknown signals just fail to register, so we can
    // catch that easily enough.
    //
    // Don't bother with SIGKILL.  It's uncatchable, which
    // means that we can't fire any callbacks anyway.
    //
    // If a user does happen to register a handler on a non-
    // fatal signal like SIGWINCH or something, and then
    // exit, it'll end up firing `process.emit('exit')`, so
    // the handler will be fired anyway.
    //
    // SIGBUS, SIGFPE, SIGSEGV and SIGILL, when not raised
    // artificially, inherently leave the process in a
    // state from which it is not safe to try and enter JS
    // listeners.
    module.exports = ['SIGABRT', 'SIGALRM', 'SIGHUP', 'SIGINT', 'SIGTERM'];
    if (process.platform !== 'win32') {
      module.exports.push('SIGVTALRM', 'SIGXCPU', 'SIGXFSZ', 'SIGUSR2', 'SIGTRAP', 'SIGSYS', 'SIGQUIT', 'SIGIOT'
      // should detect profiler and enable/disable accordingly.
      // see #21
      // 'SIGPROF'
      );
    }

    if (process.platform === 'linux') {
      module.exports.push('SIGIO', 'SIGPOLL', 'SIGPWR', 'SIGSTKFLT', 'SIGUNUSED');
    }
  })(signals$1);
  return signalsExports;
}

// Note: since nyc uses this module to output coverage, any lines
// that are in the direct sync flow of nyc's outputCoverage are
// ignored, since we can never get coverage for them.
// grab a reference to node's real process object right away
var process$3 = commonjsGlobal.process;
const processOk = function (process) {
  return process && typeof process === 'object' && typeof process.removeListener === 'function' && typeof process.emit === 'function' && typeof process.reallyExit === 'function' && typeof process.listeners === 'function' && typeof process.kill === 'function' && typeof process.pid === 'number' && typeof process.on === 'function';
};

// some kind of non-node environment, just no-op
/* istanbul ignore if */
if (!processOk(process$3)) {
  signalExit.exports = function () {
    return function () {};
  };
} else {
  var assert = require$$0$5;
  var signals = requireSignals();
  var isWin = /^win/i.test(process$3.platform);
  var EE = require$$2;
  /* istanbul ignore if */
  if (typeof EE !== 'function') {
    EE = EE.EventEmitter;
  }
  var emitter;
  if (process$3.__signal_exit_emitter__) {
    emitter = process$3.__signal_exit_emitter__;
  } else {
    emitter = process$3.__signal_exit_emitter__ = new EE();
    emitter.count = 0;
    emitter.emitted = {};
  }

  // Because this emitter is a global, we have to check to see if a
  // previous version of this library failed to enable infinite listeners.
  // I know what you're about to say.  But literally everything about
  // signal-exit is a compromise with evil.  Get used to it.
  if (!emitter.infinite) {
    emitter.setMaxListeners(Infinity);
    emitter.infinite = true;
  }
  signalExit.exports = function (cb, opts) {
    /* istanbul ignore if */
    if (!processOk(commonjsGlobal.process)) {
      return function () {};
    }
    assert.equal(typeof cb, 'function', 'a callback must be provided for exit handler');
    if (loaded === false) {
      load();
    }
    var ev = 'exit';
    if (opts && opts.alwaysLast) {
      ev = 'afterexit';
    }
    var remove = function () {
      emitter.removeListener(ev, cb);
      if (emitter.listeners('exit').length === 0 && emitter.listeners('afterexit').length === 0) {
        unload();
      }
    };
    emitter.on(ev, cb);
    return remove;
  };
  var unload = function unload() {
    if (!loaded || !processOk(commonjsGlobal.process)) {
      return;
    }
    loaded = false;
    signals.forEach(function (sig) {
      try {
        process$3.removeListener(sig, sigListeners[sig]);
      } catch (er) {}
    });
    process$3.emit = originalProcessEmit;
    process$3.reallyExit = originalProcessReallyExit;
    emitter.count -= 1;
  };
  signalExitExports.unload = unload;
  var emit = function emit(event, code, signal) {
    /* istanbul ignore if */
    if (emitter.emitted[event]) {
      return;
    }
    emitter.emitted[event] = true;
    emitter.emit(event, code, signal);
  };

  // { <signal>: <listener fn>, ... }
  var sigListeners = {};
  signals.forEach(function (sig) {
    sigListeners[sig] = function listener() {
      /* istanbul ignore if */
      if (!processOk(commonjsGlobal.process)) {
        return;
      }
      // If there are no other listeners, an exit is coming!
      // Simplest way: remove us and then re-send the signal.
      // We know that this will kill the process, so we can
      // safely emit now.
      var listeners = process$3.listeners(sig);
      if (listeners.length === emitter.count) {
        unload();
        emit('exit', null, sig);
        /* istanbul ignore next */
        emit('afterexit', null, sig);
        /* istanbul ignore next */
        if (isWin && sig === 'SIGHUP') {
          // "SIGHUP" throws an `ENOSYS` error on Windows,
          // so use a supported signal instead
          sig = 'SIGINT';
        }
        /* istanbul ignore next */
        process$3.kill(process$3.pid, sig);
      }
    };
  });
  signalExitExports.signals = function () {
    return signals;
  };
  var loaded = false;
  var load = function load() {
    if (loaded || !processOk(commonjsGlobal.process)) {
      return;
    }
    loaded = true;

    // This is the number of onSignalExit's that are in play.
    // It's important so that we can count the correct number of
    // listeners on signals, and don't wait for the other one to
    // handle it instead of us.
    emitter.count += 1;
    signals = signals.filter(function (sig) {
      try {
        process$3.on(sig, sigListeners[sig]);
        return true;
      } catch (er) {
        return false;
      }
    });
    process$3.emit = processEmit;
    process$3.reallyExit = processReallyExit;
  };
  signalExitExports.load = load;
  var originalProcessReallyExit = process$3.reallyExit;
  var processReallyExit = function processReallyExit(code) {
    /* istanbul ignore if */
    if (!processOk(commonjsGlobal.process)) {
      return;
    }
    process$3.exitCode = code || /* istanbul ignore next */0;
    emit('exit', process$3.exitCode, null);
    /* istanbul ignore next */
    emit('afterexit', process$3.exitCode, null);
    /* istanbul ignore next */
    originalProcessReallyExit.call(process$3, process$3.exitCode);
  };
  var originalProcessEmit = process$3.emit;
  var processEmit = function processEmit(ev, arg) {
    if (ev === 'exit' && processOk(commonjsGlobal.process)) {
      /* istanbul ignore else */
      if (arg !== undefined) {
        process$3.exitCode = arg;
      }
      var ret = originalProcessEmit.apply(this, arguments);
      /* istanbul ignore next */
      emit('exit', process$3.exitCode, null);
      /* istanbul ignore next */
      emit('afterexit', process$3.exitCode, null);
      /* istanbul ignore next */
      return ret;
    } else {
      return originalProcessEmit.apply(this, arguments);
    }
  };
}

var themesExports = {};
var themes$1 = {
  get exports(){ return themesExports; },
  set exports(v){ themesExports = v; },
};

var spin$1 = function spin(spinstr, spun) {
  return spinstr[spun % spinstr.length];
};

var validate = aproba;
var renderTemplate = renderTemplateExports;
var wideTruncate = wideTruncate_1;
var stringWidth = stringWidthExports;
var progressBar$1 = function (theme, width, completed) {
  validate('ONN', [theme, width, completed]);
  if (completed < 0) {
    completed = 0;
  }
  if (completed > 1) {
    completed = 1;
  }
  if (width <= 0) {
    return '';
  }
  var sofar = Math.round(width * completed);
  var rest = width - sofar;
  var template = [{
    type: 'complete',
    value: repeat(theme.complete, sofar),
    length: sofar
  }, {
    type: 'remaining',
    value: repeat(theme.remaining, rest),
    length: rest
  }];
  return renderTemplate(width, template, theme);
};

// lodash's way of repeating
function repeat(string, width) {
  var result = '';
  var n = width;
  do {
    if (n % 2) {
      result += string;
    }
    n = Math.floor(n / 2);
    /* eslint no-self-assign: 0 */
    string += string;
  } while (n && stringWidth(result) < width);
  return wideTruncate(result, width);
}

var spin = spin$1;
var progressBar = progressBar$1;
var baseTheme = {
  activityIndicator: function (values, theme, width) {
    if (values.spun == null) {
      return;
    }
    return spin(theme, values.spun);
  },
  progressbar: function (values, theme, width) {
    if (values.completed == null) {
      return;
    }
    return progressBar(theme, width, values.completed);
  }
};

var themeSet = function () {
  return ThemeSetProto.newThemeSet();
};
var ThemeSetProto = {};
ThemeSetProto.baseTheme = baseTheme;
ThemeSetProto.newTheme = function (parent, theme) {
  if (!theme) {
    theme = parent;
    parent = this.baseTheme;
  }
  return Object.assign({}, parent, theme);
};
ThemeSetProto.getThemeNames = function () {
  return Object.keys(this.themes);
};
ThemeSetProto.addTheme = function (name, parent, theme) {
  this.themes[name] = this.newTheme(parent, theme);
};
ThemeSetProto.addToAllThemes = function (theme) {
  var themes = this.themes;
  Object.keys(themes).forEach(function (name) {
    Object.assign(themes[name], theme);
  });
  Object.assign(this.baseTheme, theme);
};
ThemeSetProto.getTheme = function (name) {
  if (!this.themes[name]) {
    throw this.newMissingThemeError(name);
  }
  return this.themes[name];
};
ThemeSetProto.setDefault = function (opts, name) {
  if (name == null) {
    name = opts;
    opts = {};
  }
  var platform = opts.platform == null ? 'fallback' : opts.platform;
  var hasUnicode = !!opts.hasUnicode;
  var hasColor = !!opts.hasColor;
  if (!this.defaults[platform]) {
    this.defaults[platform] = {
      true: {},
      false: {}
    };
  }
  this.defaults[platform][hasUnicode][hasColor] = name;
};
ThemeSetProto.getDefault = function (opts) {
  if (!opts) {
    opts = {};
  }
  var platformName = opts.platform || process.platform;
  var platform = this.defaults[platformName] || this.defaults.fallback;
  var hasUnicode = !!opts.hasUnicode;
  var hasColor = !!opts.hasColor;
  if (!platform) {
    throw this.newMissingDefaultThemeError(platformName, hasUnicode, hasColor);
  }
  if (!platform[hasUnicode][hasColor]) {
    if (hasUnicode && hasColor && platform[!hasUnicode][hasColor]) {
      hasUnicode = false;
    } else if (hasUnicode && hasColor && platform[hasUnicode][!hasColor]) {
      hasColor = false;
    } else if (hasUnicode && hasColor && platform[!hasUnicode][!hasColor]) {
      hasUnicode = false;
      hasColor = false;
    } else if (hasUnicode && !hasColor && platform[!hasUnicode][hasColor]) {
      hasUnicode = false;
    } else if (!hasUnicode && hasColor && platform[hasUnicode][!hasColor]) {
      hasColor = false;
    } else if (platform === this.defaults.fallback) {
      throw this.newMissingDefaultThemeError(platformName, hasUnicode, hasColor);
    }
  }
  if (platform[hasUnicode][hasColor]) {
    return this.getTheme(platform[hasUnicode][hasColor]);
  } else {
    return this.getDefault(Object.assign({}, opts, {
      platform: 'fallback'
    }));
  }
};
ThemeSetProto.newMissingThemeError = function newMissingThemeError(name) {
  var err = new Error('Could not find a gauge theme named "' + name + '"');
  Error.captureStackTrace.call(err, newMissingThemeError);
  err.theme = name;
  err.code = 'EMISSINGTHEME';
  return err;
};
ThemeSetProto.newMissingDefaultThemeError = function newMissingDefaultThemeError(platformName, hasUnicode, hasColor) {
  var err = new Error('Could not find a gauge theme for your platform/unicode/color use combo:\n' + '    platform = ' + platformName + '\n' + '    hasUnicode = ' + hasUnicode + '\n' + '    hasColor = ' + hasColor);
  Error.captureStackTrace.call(err, newMissingDefaultThemeError);
  err.platform = platformName;
  err.hasUnicode = hasUnicode;
  err.hasColor = hasColor;
  err.code = 'EMISSINGTHEME';
  return err;
};
ThemeSetProto.newThemeSet = function () {
  var themeset = function (opts) {
    return themeset.getDefault(opts);
  };
  return Object.assign(themeset, ThemeSetProto, {
    themes: Object.assign({}, this.themes),
    baseTheme: Object.assign({}, this.baseTheme),
    defaults: JSON.parse(JSON.stringify(this.defaults || {}))
  });
};

var color = consoleControlStrings.color;
var ThemeSet = themeSet;
var themes = themes$1.exports = new ThemeSet();
themes.addTheme('ASCII', {
  preProgressbar: '[',
  postProgressbar: ']',
  progressbarTheme: {
    complete: '#',
    remaining: '.'
  },
  activityIndicatorTheme: '-\\|/',
  preSubsection: '>'
});
themes.addTheme('colorASCII', themes.getTheme('ASCII'), {
  progressbarTheme: {
    preComplete: color('bgBrightWhite', 'brightWhite'),
    complete: '#',
    postComplete: color('reset'),
    preRemaining: color('bgBrightBlack', 'brightBlack'),
    remaining: '.',
    postRemaining: color('reset')
  }
});
themes.addTheme('brailleSpinner', {
  preProgressbar: '(',
  postProgressbar: ')',
  progressbarTheme: {
    complete: '#',
    remaining: '⠂'
  },
  activityIndicatorTheme: '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏',
  preSubsection: '>'
});
themes.addTheme('colorBrailleSpinner', themes.getTheme('brailleSpinner'), {
  progressbarTheme: {
    preComplete: color('bgBrightWhite', 'brightWhite'),
    complete: '#',
    postComplete: color('reset'),
    preRemaining: color('bgBrightBlack', 'brightBlack'),
    remaining: '⠂',
    postRemaining: color('reset')
  }
});
themes.setDefault({}, 'ASCII');
themes.setDefault({
  hasColor: true
}, 'colorASCII');
themes.setDefault({
  platform: 'darwin',
  hasUnicode: true
}, 'brailleSpinner');
themes.setDefault({
  platform: 'darwin',
  hasUnicode: true,
  hasColor: true
}, 'colorBrailleSpinner');
themes.setDefault({
  platform: 'linux',
  hasUnicode: true
}, 'brailleSpinner');
themes.setDefault({
  platform: 'linux',
  hasUnicode: true,
  hasColor: true
}, 'colorBrailleSpinner');

// this exists so we can replace it during testing
var setInterval_1 = setInterval;

// this exists so we can replace it during testing
var process_1 = process;

var setImmediateExports = {};
var setImmediate$2 = {
  get exports(){ return setImmediateExports; },
  set exports(v){ setImmediateExports = v; },
};

var process$2 = process_1;
try {
  setImmediate$2.exports = setImmediate;
} catch (ex) {
  setImmediate$2.exports = process$2.nextTick;
}

var Plumbing = plumbingExports;
var hasUnicode = hasUnicodeExports;
var hasColor = hasColor$1;
var onExit = signalExitExports;
var defaultThemes = themesExports;
var setInterval$1 = setInterval_1;
var process$1 = process_1;
var setImmediate$1 = setImmediateExports;
var lib = Gauge;
function callWith(obj, method) {
  return function () {
    return method.call(obj);
  };
}
function Gauge(arg1, arg2) {
  var options, writeTo;
  if (arg1 && arg1.write) {
    writeTo = arg1;
    options = arg2 || {};
  } else if (arg2 && arg2.write) {
    writeTo = arg2;
    options = arg1 || {};
  } else {
    writeTo = process$1.stderr;
    options = arg1 || arg2 || {};
  }
  this._status = {
    spun: 0,
    section: '',
    subsection: ''
  };
  this._paused = false; // are we paused for back pressure?
  this._disabled = true; // are all progress bar updates disabled?
  this._showing = false; // do we WANT the progress bar on screen
  this._onScreen = false; // IS the progress bar on screen
  this._needsRedraw = false; // should we print something at next tick?
  this._hideCursor = options.hideCursor == null ? true : options.hideCursor;
  this._fixedFramerate = options.fixedFramerate == null ? !/^v0\.8\./.test(process$1.version) : options.fixedFramerate;
  this._lastUpdateAt = null;
  this._updateInterval = options.updateInterval == null ? 50 : options.updateInterval;
  this._themes = options.themes || defaultThemes;
  this._theme = options.theme;
  var theme = this._computeTheme(options.theme);
  var template = options.template || [{
    type: 'progressbar',
    length: 20
  }, {
    type: 'activityIndicator',
    kerning: 1,
    length: 1
  }, {
    type: 'section',
    kerning: 1,
    default: ''
  }, {
    type: 'subsection',
    kerning: 1,
    default: ''
  }];
  this.setWriteTo(writeTo, options.tty);
  var PlumbingClass = options.Plumbing || Plumbing;
  this._gauge = new PlumbingClass(theme, template, this.getWidth());
  this._$$doRedraw = callWith(this, this._doRedraw);
  this._$$handleSizeChange = callWith(this, this._handleSizeChange);
  this._cleanupOnExit = options.cleanupOnExit == null || options.cleanupOnExit;
  this._removeOnExit = null;
  if (options.enabled || options.enabled == null && this._tty && this._tty.isTTY) {
    this.enable();
  } else {
    this.disable();
  }
}
Gauge.prototype = {};
Gauge.prototype.isEnabled = function () {
  return !this._disabled;
};
Gauge.prototype.setTemplate = function (template) {
  this._gauge.setTemplate(template);
  if (this._showing) {
    this._requestRedraw();
  }
};
Gauge.prototype._computeTheme = function (theme) {
  if (!theme) {
    theme = {};
  }
  if (typeof theme === 'string') {
    theme = this._themes.getTheme(theme);
  } else if (Object.keys(theme).length === 0 || theme.hasUnicode != null || theme.hasColor != null) {
    var useUnicode = theme.hasUnicode == null ? hasUnicode() : theme.hasUnicode;
    var useColor = theme.hasColor == null ? hasColor : theme.hasColor;
    theme = this._themes.getDefault({
      hasUnicode: useUnicode,
      hasColor: useColor,
      platform: theme.platform
    });
  }
  return theme;
};
Gauge.prototype.setThemeset = function (themes) {
  this._themes = themes;
  this.setTheme(this._theme);
};
Gauge.prototype.setTheme = function (theme) {
  this._gauge.setTheme(this._computeTheme(theme));
  if (this._showing) {
    this._requestRedraw();
  }
  this._theme = theme;
};
Gauge.prototype._requestRedraw = function () {
  this._needsRedraw = true;
  if (!this._fixedFramerate) {
    this._doRedraw();
  }
};
Gauge.prototype.getWidth = function () {
  return (this._tty && this._tty.columns || 80) - 1;
};
Gauge.prototype.setWriteTo = function (writeTo, tty) {
  var enabled = !this._disabled;
  if (enabled) {
    this.disable();
  }
  this._writeTo = writeTo;
  this._tty = tty || writeTo === process$1.stderr && process$1.stdout.isTTY && process$1.stdout || writeTo.isTTY && writeTo || this._tty;
  if (this._gauge) {
    this._gauge.setWidth(this.getWidth());
  }
  if (enabled) {
    this.enable();
  }
};
Gauge.prototype.enable = function () {
  if (!this._disabled) {
    return;
  }
  this._disabled = false;
  if (this._tty) {
    this._enableEvents();
  }
  if (this._showing) {
    this.show();
  }
};
Gauge.prototype.disable = function () {
  if (this._disabled) {
    return;
  }
  if (this._showing) {
    this._lastUpdateAt = null;
    this._showing = false;
    this._doRedraw();
    this._showing = true;
  }
  this._disabled = true;
  if (this._tty) {
    this._disableEvents();
  }
};
Gauge.prototype._enableEvents = function () {
  if (this._cleanupOnExit) {
    this._removeOnExit = onExit(callWith(this, this.disable));
  }
  this._tty.on('resize', this._$$handleSizeChange);
  if (this._fixedFramerate) {
    this.redrawTracker = setInterval$1(this._$$doRedraw, this._updateInterval);
    if (this.redrawTracker.unref) {
      this.redrawTracker.unref();
    }
  }
};
Gauge.prototype._disableEvents = function () {
  this._tty.removeListener('resize', this._$$handleSizeChange);
  if (this._fixedFramerate) {
    clearInterval(this.redrawTracker);
  }
  if (this._removeOnExit) {
    this._removeOnExit();
  }
};
Gauge.prototype.hide = function (cb) {
  if (this._disabled) {
    return cb && process$1.nextTick(cb);
  }
  if (!this._showing) {
    return cb && process$1.nextTick(cb);
  }
  this._showing = false;
  this._doRedraw();
  cb && setImmediate$1(cb);
};
Gauge.prototype.show = function (section, completed) {
  this._showing = true;
  if (typeof section === 'string') {
    this._status.section = section;
  } else if (typeof section === 'object') {
    var sectionKeys = Object.keys(section);
    for (var ii = 0; ii < sectionKeys.length; ++ii) {
      var key = sectionKeys[ii];
      this._status[key] = section[key];
    }
  }
  if (completed != null) {
    this._status.completed = completed;
  }
  if (this._disabled) {
    return;
  }
  this._requestRedraw();
};
Gauge.prototype.pulse = function (subsection) {
  this._status.subsection = subsection || '';
  this._status.spun++;
  if (this._disabled) {
    return;
  }
  if (!this._showing) {
    return;
  }
  this._requestRedraw();
};
Gauge.prototype._handleSizeChange = function () {
  this._gauge.setWidth(this._tty.columns - 1);
  this._requestRedraw();
};
Gauge.prototype._doRedraw = function () {
  if (this._disabled || this._paused) {
    return;
  }
  if (!this._fixedFramerate) {
    var now = Date.now();
    if (this._lastUpdateAt && now - this._lastUpdateAt < this._updateInterval) {
      return;
    }
    this._lastUpdateAt = now;
  }
  if (!this._showing && this._onScreen) {
    this._onScreen = false;
    var result = this._gauge.hide();
    if (this._hideCursor) {
      result += this._gauge.showCursor();
    }
    return this._writeTo.write(result);
  }
  if (!this._showing && !this._onScreen) {
    return;
  }
  if (this._showing && !this._onScreen) {
    this._onScreen = true;
    this._needsRedraw = true;
    if (this._hideCursor) {
      this._writeTo.write(this._gauge.hideCursor());
    }
  }
  if (!this._needsRedraw) {
    return;
  }
  if (!this._writeTo.write(this._gauge.show(this._status))) {
    this._paused = true;
    this._writeTo.on('drain', callWith(this, function () {
      this._paused = false;
      this._doRedraw();
    }));
  }
};

var setBlocking = function (blocking) {
  [process.stdout, process.stderr].forEach(function (stream) {
    if (stream._handle && stream.isTTY && typeof stream._handle.setBlocking === 'function') {
      stream._handle.setBlocking(blocking);
    }
  });
};

(function (module, exports) {

  var Progress = lib$1;
  var Gauge = lib;
  var EE = require$$2.EventEmitter;
  var log = module.exports = new EE();
  var util = require$$0$2;
  var setBlocking$1 = setBlocking;
  var consoleControl = consoleControlStrings;
  setBlocking$1(true);
  var stream = process.stderr;
  Object.defineProperty(log, 'stream', {
    set: function (newStream) {
      stream = newStream;
      if (this.gauge) {
        this.gauge.setWriteTo(stream, stream);
      }
    },
    get: function () {
      return stream;
    }
  });

  // by default, decide based on tty-ness.
  var colorEnabled;
  log.useColor = function () {
    return colorEnabled != null ? colorEnabled : stream.isTTY;
  };
  log.enableColor = function () {
    colorEnabled = true;
    this.gauge.setTheme({
      hasColor: colorEnabled,
      hasUnicode: unicodeEnabled
    });
  };
  log.disableColor = function () {
    colorEnabled = false;
    this.gauge.setTheme({
      hasColor: colorEnabled,
      hasUnicode: unicodeEnabled
    });
  };

  // default level
  log.level = 'info';
  log.gauge = new Gauge(stream, {
    enabled: false,
    // no progress bars unless asked
    theme: {
      hasColor: log.useColor()
    },
    template: [{
      type: 'progressbar',
      length: 20
    }, {
      type: 'activityIndicator',
      kerning: 1,
      length: 1
    }, {
      type: 'section',
      default: ''
    }, ':', {
      type: 'logline',
      kerning: 1,
      default: ''
    }]
  });
  log.tracker = new Progress.TrackerGroup();

  // we track this separately as we may need to temporarily disable the
  // display of the status bar for our own loggy purposes.
  log.progressEnabled = log.gauge.isEnabled();
  var unicodeEnabled;
  log.enableUnicode = function () {
    unicodeEnabled = true;
    this.gauge.setTheme({
      hasColor: this.useColor(),
      hasUnicode: unicodeEnabled
    });
  };
  log.disableUnicode = function () {
    unicodeEnabled = false;
    this.gauge.setTheme({
      hasColor: this.useColor(),
      hasUnicode: unicodeEnabled
    });
  };
  log.setGaugeThemeset = function (themes) {
    this.gauge.setThemeset(themes);
  };
  log.setGaugeTemplate = function (template) {
    this.gauge.setTemplate(template);
  };
  log.enableProgress = function () {
    if (this.progressEnabled || this._paused) {
      return;
    }
    this.progressEnabled = true;
    this.tracker.on('change', this.showProgress);
    this.gauge.enable();
  };
  log.disableProgress = function () {
    if (!this.progressEnabled) {
      return;
    }
    this.progressEnabled = false;
    this.tracker.removeListener('change', this.showProgress);
    this.gauge.disable();
  };
  var trackerConstructors = ['newGroup', 'newItem', 'newStream'];
  var mixinLog = function (tracker) {
    // mixin the public methods from log into the tracker
    // (except: conflicts and one's we handle specially)
    Object.keys(log).forEach(function (P) {
      if (P[0] === '_') {
        return;
      }
      if (trackerConstructors.filter(function (C) {
        return C === P;
      }).length) {
        return;
      }
      if (tracker[P]) {
        return;
      }
      if (typeof log[P] !== 'function') {
        return;
      }
      var func = log[P];
      tracker[P] = function () {
        return func.apply(log, arguments);
      };
    });
    // if the new tracker is a group, make sure any subtrackers get
    // mixed in too
    if (tracker instanceof Progress.TrackerGroup) {
      trackerConstructors.forEach(function (C) {
        var func = tracker[C];
        tracker[C] = function () {
          return mixinLog(func.apply(tracker, arguments));
        };
      });
    }
    return tracker;
  };

  // Add tracker constructors to the top level log object
  trackerConstructors.forEach(function (C) {
    log[C] = function () {
      return mixinLog(this.tracker[C].apply(this.tracker, arguments));
    };
  });
  log.clearProgress = function (cb) {
    if (!this.progressEnabled) {
      return cb && process.nextTick(cb);
    }
    this.gauge.hide(cb);
  };
  log.showProgress = function (name, completed) {
    if (!this.progressEnabled) {
      return;
    }
    var values = {};
    if (name) {
      values.section = name;
    }
    var last = log.record[log.record.length - 1];
    if (last) {
      values.subsection = last.prefix;
      var disp = log.disp[last.level] || last.level;
      var logline = this._format(disp, log.style[last.level]);
      if (last.prefix) {
        logline += ' ' + this._format(last.prefix, this.prefixStyle);
      }
      logline += ' ' + last.message.split(/\r?\n/)[0];
      values.logline = logline;
    }
    values.completed = completed || this.tracker.completed();
    this.gauge.show(values);
  }.bind(log); // bind for use in tracker's on-change listener

  // temporarily stop emitting, but don't drop
  log.pause = function () {
    this._paused = true;
    if (this.progressEnabled) {
      this.gauge.disable();
    }
  };
  log.resume = function () {
    if (!this._paused) {
      return;
    }
    this._paused = false;
    var b = this._buffer;
    this._buffer = [];
    b.forEach(function (m) {
      this.emitLog(m);
    }, this);
    if (this.progressEnabled) {
      this.gauge.enable();
    }
  };
  log._buffer = [];
  var id = 0;
  log.record = [];
  log.maxRecordSize = 10000;
  log.log = function (lvl, prefix, message) {
    var l = this.levels[lvl];
    if (l === undefined) {
      return this.emit('error', new Error(util.format('Undefined log level: %j', lvl)));
    }
    var a = new Array(arguments.length - 2);
    var stack = null;
    for (var i = 2; i < arguments.length; i++) {
      var arg = a[i - 2] = arguments[i];

      // resolve stack traces to a plain string.
      if (typeof arg === 'object' && arg instanceof Error && arg.stack) {
        Object.defineProperty(arg, 'stack', {
          value: stack = arg.stack + '',
          enumerable: true,
          writable: true
        });
      }
    }
    if (stack) {
      a.unshift(stack + '\n');
    }
    message = util.format.apply(util, a);
    var m = {
      id: id++,
      level: lvl,
      prefix: String(prefix || ''),
      message: message,
      messageRaw: a
    };
    this.emit('log', m);
    this.emit('log.' + lvl, m);
    if (m.prefix) {
      this.emit(m.prefix, m);
    }
    this.record.push(m);
    var mrs = this.maxRecordSize;
    var n = this.record.length - mrs;
    if (n > mrs / 10) {
      var newSize = Math.floor(mrs * 0.9);
      this.record = this.record.slice(-1 * newSize);
    }
    this.emitLog(m);
  }.bind(log);
  log.emitLog = function (m) {
    if (this._paused) {
      this._buffer.push(m);
      return;
    }
    if (this.progressEnabled) {
      this.gauge.pulse(m.prefix);
    }
    var l = this.levels[m.level];
    if (l === undefined) {
      return;
    }
    if (l < this.levels[this.level]) {
      return;
    }
    if (l > 0 && !isFinite(l)) {
      return;
    }

    // If 'disp' is null or undefined, use the lvl as a default
    // Allows: '', 0 as valid disp
    var disp = log.disp[m.level] != null ? log.disp[m.level] : m.level;
    this.clearProgress();
    m.message.split(/\r?\n/).forEach(function (line) {
      var heading = this.heading;
      if (heading) {
        this.write(heading, this.headingStyle);
        this.write(' ');
      }
      this.write(disp, log.style[m.level]);
      var p = m.prefix || '';
      if (p) {
        this.write(' ');
      }
      this.write(p, this.prefixStyle);
      this.write(' ' + line + '\n');
    }, this);
    this.showProgress();
  };
  log._format = function (msg, style) {
    if (!stream) {
      return;
    }
    var output = '';
    if (this.useColor()) {
      style = style || {};
      var settings = [];
      if (style.fg) {
        settings.push(style.fg);
      }
      if (style.bg) {
        settings.push('bg' + style.bg[0].toUpperCase() + style.bg.slice(1));
      }
      if (style.bold) {
        settings.push('bold');
      }
      if (style.underline) {
        settings.push('underline');
      }
      if (style.inverse) {
        settings.push('inverse');
      }
      if (settings.length) {
        output += consoleControl.color(settings);
      }
      if (style.beep) {
        output += consoleControl.beep();
      }
    }
    output += msg;
    if (this.useColor()) {
      output += consoleControl.color('reset');
    }
    return output;
  };
  log.write = function (msg, style) {
    if (!stream) {
      return;
    }
    stream.write(this._format(msg, style));
  };
  log.addLevel = function (lvl, n, style, disp) {
    // If 'disp' is null or undefined, use the lvl as a default
    if (disp == null) {
      disp = lvl;
    }
    this.levels[lvl] = n;
    this.style[lvl] = style;
    if (!this[lvl]) {
      this[lvl] = function () {
        var a = new Array(arguments.length + 1);
        a[0] = lvl;
        for (var i = 0; i < arguments.length; i++) {
          a[i + 1] = arguments[i];
        }
        return this.log.apply(this, a);
      }.bind(this);
    }
    this.disp[lvl] = disp;
  };
  log.prefixStyle = {
    fg: 'magenta'
  };
  log.headingStyle = {
    fg: 'white',
    bg: 'black'
  };
  log.style = {};
  log.levels = {};
  log.disp = {};
  log.addLevel('silly', -Infinity, {
    inverse: true
  }, 'sill');
  log.addLevel('verbose', 1000, {
    fg: 'cyan',
    bg: 'black'
  }, 'verb');
  log.addLevel('info', 2000, {
    fg: 'green'
  });
  log.addLevel('timing', 2500, {
    fg: 'green',
    bg: 'black'
  });
  log.addLevel('http', 3000, {
    fg: 'green',
    bg: 'black'
  });
  log.addLevel('notice', 3500, {
    fg: 'cyan',
    bg: 'black'
  });
  log.addLevel('warn', 4000, {
    fg: 'black',
    bg: 'yellow'
  }, 'WARN');
  log.addLevel('error', 5000, {
    fg: 'red',
    bg: 'black'
  }, 'ERR!');
  log.addLevel('silent', Infinity);

  // allow 'error' prefix
  log.on('error', function () {});
})(log$1);
var log = logExports;

var name = "guide-cli";
var version = "0.0.1";
var description = "";
var main = "index.js";
var bin = {
	"guide-cli": "dist/index.js"
};
var files = [
	"./dist"
];
var scripts = {
	dev: "rollup -w --config ./build/rollup.dev.js --bundleConfigAsCjs",
	build: "rollup --config ./build/rollup.dev.js --bundleConfigAsCjs",
	eslint: "eslint src --ext .ts"
};
var keywords = [
];
var author = "";
var license = "ISC";
var devDependencies = {
	"@babel/core": "^7.21.0",
	"@babel/plugin-proposal-class-properties": "^7.18.6",
	"@babel/preset-env": "^7.20.2",
	"@babel/preset-typescript": "^7.21.0",
	"@rollup/plugin-alias": "^4.0.3",
	"@rollup/plugin-babel": "^6.0.3",
	"@rollup/plugin-commonjs": "^24.0.1",
	"@rollup/plugin-eslint": "^9.0.3",
	"@rollup/plugin-json": "^6.0.0",
	"@rollup/plugin-node-resolve": "^15.0.1",
	"@rollup/plugin-replace": "^5.0.2",
	"@rollup/plugin-typescript": "^11.0.0",
	"@types/colors": "^1.2.1",
	"@types/import-local": "^3.1.0",
	"@types/node": "^18.13.0",
	"@types/npmlog": "^4.1.4",
	"@types/root-check": "^1.0.0",
	"@types/semver": "^7.3.13",
	"@types/user-home": "^2.0.0",
	eslint: "^8.34.0",
	"eslint-plugin-guide": "^0.0.3",
	rollup: "^3.17.2",
	"rollup-plugin-cleandir": "^2.0.0",
	"rollup-plugin-typescript2": "^0.34.1",
	tslib: "^2.5.0",
	typescript: "^4.9.5"
};
var dependencies = {
	colors: "^1.4.0",
	commander: "^10.0.0",
	"import-local": "^3.1.0",
	npmlog: "^7.0.1",
	"path-exists": "^5.0.0",
	"root-check": "^2.0.0",
	semver: "^7.3.8",
	"user-home": "^3.0.0"
};
var pkg = {
	name: name,
	version: version,
	description: description,
	main: main,
	bin: bin,
	files: files,
	scripts: scripts,
	keywords: keywords,
	author: author,
	license: license,
	devDependencies: devDependencies,
	dependencies: dependencies
};

const LOWEST_NODE_VERSION = '12.0.0';
const PKG_NAME = Object.keys(pkg.bin)[0];
const PKG_VERSION = pkg.version;

log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'; // 判断debug模式
log.heading = PKG_NAME; // 修改前缀
log.headingStyle = {
  fg: 'green',
  bg: 'black'
};
log.addLevel('success', 2000, {
  fg: 'green',
  bold: true
}); // 添加自定义命令

log.info('header', 'hello guide cli11145226');
if (importLocal(__filename)) {
  // 加载依赖
  log.info('cli', '您正在使用依赖版本');
} else {
  // 当前项目运行
  Promise.resolve().then(function () { return require('./index-2ea477b3.js'); }).then(({
    default: core
  }) => {
    core();
  });
}

exports.LOWEST_NODE_VERSION = LOWEST_NODE_VERSION;
exports.PKG_NAME = PKG_NAME;
exports.PKG_VERSION = PKG_VERSION;
exports.log = log;
