// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Allow Metro to bundle .sql files as text (for Drizzle migrations)
config.resolver.sourceExts.push('sql');

module.exports = withNativeWind(config, {
  input: './app/global.css',
});