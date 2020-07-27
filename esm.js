const envPreset = require('@babel/preset-env')
const reactPreset = require('@babel/preset-react')

const builtinRegex = /^(es|es6|es7|esnext|web)\./

// these are polyfills that cover bugs or additions, and aren't
// likely to actually be needed but may cause bugs depending on usage
const loosePolyFills = [
  /^es\.promise$/,
  /^es\.array\.iterator/,
  /^es\.array\.sort/,
  /^es\.array\.splice/,
  /^es\.array\.slice/,
  /^es\.array\.index-of/,
  /^es\.array\.reverse/,
  /^es\.array\.last-index-of/,
  /^es\.object\.assign/,
  /^es\.array\.iterator/,
  /^es\.string\.match/,
  /^es\.string\.replace/,
  // this is always added and never used
  /^web\.dom-collections/,
]

function preset(api, options = {}) {
  const {
    debug,
    runtime,
    useBuiltIns,
    includePolyfills = false,
    modules = api.env() === 'test',
    development = api.env() === 'test',
  } = options

  const exclude = []
  if (useBuiltIns) {
    if (includePolyfills === 'loose') exclude.push(...loosePolyFills)
    else if (includePolyfills !== true) exclude.push(builtinRegex)
  }

  const presets = [
    [
      envPreset,
      {
        debug,
        exclude: exclude.length ? exclude : undefined,
        useBuiltIns,
        bugfixes: true,
        targets: { esmodules: true },
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
