const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withNdkVersion(config) {
  return withGradleProperties(config, (cfg) => {
    // Check if property exists first
    const index = cfg.modResults.findIndex(prop => prop.key === 'android.ndkVersion');
    if (index >= 0) {
      cfg.modResults[index].value = '27.1.12297006';
    } else {
      cfg.modResults.push({
        type: 'property',
        key: 'android.ndkVersion',
        value: '27.1.12297006',
      });
    }
    return cfg;
  });
};
