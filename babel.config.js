module.exports = api => {
  api.cache(true);

  const presets = [
    ['@babel/preset-env', {
      targets: {
        browsers: 'last 2 versions and not dead and not ie >= 11 and > 0.2%, firefox esr',
      },
      useBuiltIns: 'usage',
      corejs: 3,
    }],
  ];

  const plugins = [];

  return {
    presets,
    plugins,
  };
};
