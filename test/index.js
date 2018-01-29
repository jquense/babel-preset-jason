const assert = require('assert')
const fs = require('fs')
const path = require('path')

const { transformFileSync } = require('@babel/core')
const { stripIndent } = require('common-tags')

const transform = (fixture, options) =>
  transformFileSync(path.join(__dirname, `./fixtures/${fixture}.js`), {
    presets: [[require.resolve('..'), options || {}]],
    babelrc: false,
  })

const { code } = transform('file')

assert(code, 'It compiles code')

assert.equal(
  transform('add-exports').code,
  stripIndent`
    "use strict";

    exports.__esModule = true;
    exports.default = void 0;
    var _default = 'foo';
    exports.default = _default;
    module.exports = exports["default"];
  `,
  'It adds default CJS exports'
)

assert.equal(
  transform('add-exports', { modules: false }).code,
  stripIndent`
    export default 'foo';
  `,
  "It doesn't add CJS default export when not compiling modules"
)
