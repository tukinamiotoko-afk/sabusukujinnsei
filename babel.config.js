module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // Use require() so Node resolves from this file's directory (project root).
      // 'babel-preset-expo' is nested inside expo/node_modules and not hoisted,
      // so a bare string reference fails when Babel resolves from the project root.
      require('expo/internal/babel-preset'),
    ],
    plugins: [
      // Explicitly add private-field transforms so they run as top-level plugins,
      // not inside @react-native/babel-preset's overrides block. This ensures they
      // apply to react-native core files (EventEmitter.js etc.) which use
      // #privateField syntax and are processed via babel.transformFromAstSync.
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    ],
  };
};
