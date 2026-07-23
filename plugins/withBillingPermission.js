const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withBillingPermission(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }
    const already = manifest['uses-permission'].some(
      (p) => p.$?.['android:name'] === 'com.android.vending.BILLING'
    );
    if (!already) {
      manifest['uses-permission'].push({
        $: { 'android:name': 'com.android.vending.BILLING' },
      });
    }
    return config;
  });
};
