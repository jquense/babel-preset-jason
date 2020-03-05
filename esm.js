const envPreset = require('@babel/preset-env')
const modulesPreset = require('@babel/preset-modules')
const reactPreset = require('@babel/preset-react')

function preset(api, options = {}) {
  const {
    debug,
    runtime,
    useBuiltIns,
    modules = api.env() === 'test',
    development = api.env() === 'test',
  } = options

  const presets = [
    [modulesPreset, { loose: true }],
    [
      envPreset,
      {
        debug,
        useBuiltIns,
        targets: { esmodules: true },
        exclude: [/transform/],
        loose: true,
        modules: false,
        shippedProposals: true,
        corejs: useBuiltIns ? 3 : undefined,
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
    ].filter(Boolean),
  }
}

module.exports = preset
