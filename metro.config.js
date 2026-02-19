
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize for stability and speed
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'mjs', 'cjs'],
  assetExts: [...config.resolver.assetExts.filter(ext => ext !== 'svg'), 'db'],
};

// Disable transformer worker count to prevent memory issues
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

// Optimize caching
config.cacheStores = [];

module.exports = config;
