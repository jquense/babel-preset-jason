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

const defaultBrowsers = [
  '>= .25%',
  'not dead',
  'not op_mini all',
  'not Android 4.4.3-4.4.4',
  'not ios_saf < 10',
  'not Chrome < 50', // caniuse lastest is reporting chrome 29
  'firefox ESR',
]

function preset(_, options = {}) {
  const env = process.env.NODE_ENV || 'production' // default to prod

  const opts = Object.assign({}, defaultOptions, options)
  const target = opts.target

  const nodeTarget = {
    node: env === 'production' ? '8' : 'current',
  }

  const webTargets =
    env === 'production' ? { browsers: defaultBrowsers } : { esmodules: true }

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

preset.defaultBrowsers = defaultBrowsers

module.exports = preset
