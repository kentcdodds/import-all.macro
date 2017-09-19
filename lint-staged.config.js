const lintStagedConfig = require('kcd-scripts/config').lintStaged

module.exports = Object.assign(lintStagedConfig.linters, {
  '**/__snapshots__/**': 'node other/snap-to-readme.js',
})
