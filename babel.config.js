// Babel Config - Babel-Konfiguration für JavaScript-Transpilation
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [],
    env: {
      test: {
        presets: ['babel-preset-expo']
      }
    }
  };
};
