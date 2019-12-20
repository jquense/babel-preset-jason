const { loadConfig } = require('browserslist')
const pick = require('lodash/pick')
const path = require('path')
const envPreset = require('@babel/preset-env')
const modulesPreset = require('@babel/preset-modules')
const reactPreset = require('@babel/preset-react')

function preset(api, options = {}) {
  const {
    runtime,
    useBuiltins,
    debug,
    modules = api.env() === 'test',
    development = api.env() === 'test',
  } = options

  const presets = [
    [modulesPreset, { loose: true }],
    useBuiltins && [
      envPreset,
      {
        debug,
        targets: { esmodules: true },
        exclude: [/.*/],
        loose: true,
        modules: false,
        shippedProposals: true,
        useBuiltins: true,
        corejs: 3,
      },
    ],
    [reactPreset, { development }],
  ].filter(Boolean)

  return {
    presets,
    plugins: [
      !!modules && require.resolve('@babel/plugin-transform-modules-commonjs'),

      runtime && [
        require.resolve('@babel/plugin-transform-runtime'),
        {
          corejs: false,
          regenerator: false,
          useESModules: modules === false,
        },
      ],

      require.resolve('@babel/plugin-syntax-dynamic-import'),
      [
        require.resolve('@babel/plugin-proposal-class-properties'),
        { loose: true },
      ],

      require.resolve('@babel/plugin-proposal-export-default-from'),
      require.resolve('@babel/plugin-proposal-export-namespace-from'),

      // - convenience plugins --
      require.resolve('babel-plugin-dev-expression'),
      require.resolve('@babel/plugin-proposal-optional-chaining'),
      require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
    ].filter(Boolean),
  }
}

module.exports = preset
