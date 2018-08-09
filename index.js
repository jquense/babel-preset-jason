const runtimePlugin = require('@babel/plugin-transform-runtime')
const envPreset = require('@babel/preset-env')
const pick = require('lodash/pick')
const reactPreset = require('@babel/preset-react')

const r = p => (p && p.__esModule ? p.default : p)

const presetEnvOptions = [
  'configPath',
  'debug',
  'exclude',
  'forceAllTransforms',
  'ignoreBrowserslistConfig',
  'include',
  'loose',
  'modules',
  'shippedProposals',
  'spec',
  'targets',
  'useBuiltIns',
]

const defaultOptions = {
  target: 'web', // | 'node'
  loose: true,
  modules: 'commonjs',
  useBuiltIns: false,
  shippedProposals: true,
  debug: false,
  corejs: false,
  runtime: false,
}

const defaultBrowsers = ['> 1%', 'last 2 versions']

module.exports = function preset(_, options = {}) {
  const env = process.env.NODE_ENV || 'production' // default to prod

  const opts = Object.assign({}, defaultOptions, options)
  const target = opts.target

  const nodeTarget = {
    node: env === 'production' ? '6' : 'current',
  }

  const webTargets = {
    browsers:
      env === 'production' ? defaultBrowsers : ['last 2 Chrome versions'],
  }

  if (target === 'web') {
    opts.targets = opts.targets || webTargets
    opts.runtime = options.runtime == null ? true : options.runtime

    opts.include = ['proposal-object-rest-spread']
  } else if (target === 'node') {
    opts.targets = opts.targets || nodeTarget
  }

  // cjs in a TEST environment
  if (env === 'test' && options.modules == null) opts.modules = 'commonjs'

  return {
    presets: [
      [r(envPreset), pick(opts, presetEnvOptions)],
      [r(reactPreset), { development: env !== 'production' }],
    ],
    plugins: [
      [
        require.resolve('@babel/plugin-proposal-class-properties'),
        { loose: opts.loose },
      ],
      require.resolve('@babel/plugin-syntax-dynamic-import'),
      require.resolve('@babel/plugin-proposal-export-default-from'),
      require.resolve('@babel/plugin-proposal-export-namespace-from'),

      opts.useBuiltIns === false &&
        require.resolve('@babel/plugin-transform-object-assign'),

      opts.runtime && [
        r(runtimePlugin),
        {
          regenerator: false,
          corejs: opts.corejs,
          useESModules: opts.modules === false,
        },
      ],

      // - convenience plugins --
      require.resolve('babel-plugin-dev-expression'),
      opts.modules === 'commonjs' &&
        require.resolve('babel-plugin-add-module-exports'),
    ].filter(Boolean),
  }
}
