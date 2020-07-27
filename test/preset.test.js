const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { format } = require('util')

const { transformFileSync } = require('@babel/core')
const { stripIndent } = require('common-tags')

const transform = (fixture, options) =>
  transformFileSync(path.join(__dirname, `./fixtures/${fixture}.js`), {
    presets: [[require.resolve('..'), options]],
    babelrc: false,
  })

const transformEsm = (fixture, options) =>
  transformFileSync(path.join(__dirname, `./fixtures/${fixture}.js`), {
    presets: [[require.resolve('../esm'), options]],
    babelrc: false,
  })

describe('preset', () => {
  it('it compiles', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {})

    let result = transform('file', { debug: true })

    expect(result.code).toMatchSnapshot('code')
    expect(spy.mock.calls.map((args) => format(...args))).toMatchSnapshot(
      'debug logs',
    )

    spy.mockRestore()
  })

  it('adds exports', () => {
    expect(transform('add-exports').code).toEqual(
      stripIndent`
        "use strict";

        exports.__esModule = true;
        exports.default = void 0;
        var _default = 'foo';
        exports.default = _default;
        module.exports = exports.default;
      `,
      'It adds default CJS exports',
    )
  })

  it("doesn't add exports", () => {
    expect(transform('add-exports').code).toEqual(
      stripIndent`
        "use strict";

        exports.__esModule = true;
        exports.default = void 0;
        var _default = 'foo';
        exports.default = _default;
        module.exports = exports.default;
      `,
      'It adds default CJS exports',
    )

    expect(transform('add-exports', { modules: false }).code).toEqual(
      stripIndent`
        export default 'foo';
      `,
      "It doesn't add CJS default export when not compiling modules",
    )
  })
})

describe('esm preset', () => {
  it('it compiles', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {})

    let result = transformEsm('file', { debug: true })

    expect(result.code).toMatchSnapshot('code')
    expect(spy.mock.calls.map((args) => format(...args))).toMatchSnapshot(
      'debug logs',
    )

    spy.mockRestore()
  })

  describe('useBuiltIns', () => {
    it("it uses builtins but doesn't polyfill", () => {
      let result = transformEsm('builtins', { useBuiltIns: 'usage' })

      expect(result.code).toContain('const bb = Object.assign({}, b);')
      expect(result.code).not.toContain('core-js')
    })

    it('it polyfills new things in loose', () => {
      let result = transformEsm('builtins', {
        useBuiltIns: 'usage',
        includePolyfills: 'loose',
      })

      expect(result.code).toContain(
        'core-js/modules/esnext.promise.all-settled',
      )
      expect(result.code).toContain('core-js/modules/es.promise.finally')

      expect(result.code).not.toContain('"core-js/modules/es.promise"')
      expect(result.code).not.toContain('es.array')
    })

    it('it polyfills all the things', () => {
      let result = transformEsm('builtins', {
        useBuiltIns: 'usage',
        includePolyfills: true,
      })

      expect(result.code).toContain('es.array')
      expect(result.code).toContain('"core-js/modules/es.promise"')
    })
  })
})
