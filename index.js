const runtimePlugin = require('babel-plugin-transform-runtime');
const envPreset = require('babel-preset-env');
const reactPreset = require('babel-preset-react');

const defaultOptions = {
  target: 'web', // | 'node'
  loose: true,
  modules: 'commonjs',
  useBuiltIns: false,
  runtime: false,
  debug: true,
};

const nodeTarget = {
  node: '6',
};

const webTargets = {
  browsers: [
    "> 1%",
    "last 2 versions"
  ],
};

module.exports = function preset(_, options = {}) {
  const opts = Object.assign({}, defaultOptions, options);
  const target = opts.target;

  if (target === 'web')
    opts.targets = opts.targets || webTargets;

  if (target === 'node')
    opts.targets = opts.targets || nodeTarget;


  // cjs in a TEST environment
  if (process.env.NODE_ENV === 'test' && options.modules == null)
    opts.modules = 'commonjs';

  const presets = [
    [envPreset, opts],
    target === 'web' && reactPreset,
  ].filter(Boolean);


  return {
    presets,
    plugins: [
      // - stage 3 --
      require.resolve('babel-plugin-transform-object-rest-spread'),
      // -----

      // - stage 2 --
      require.resolve('babel-plugin-syntax-dynamic-import'),
      require.resolve('babel-plugin-transform-class-properties'),
      // -----

      // - stage 1 --
      require.resolve('babel-plugin-transform-export-extensions'),
      // -----

      opts.runtime && [runtimePlugin, {
        polyfill: false,
        regenerator: false,
      }],

      // - convenience plugins --
      require.resolve('babel-plugin-jsx-fragment'),
      require.resolve('babel-plugin-dev-expression'),
    ]
    .filter(Boolean),
  };
};
