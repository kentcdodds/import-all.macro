const {lintStaged: lintStagedConfig} = require('kcd-scripts/config')

module.exports = {
  ...lintStagedConfig,
  '**/__snapshots__/**': ['node other/snap-to-readme.js'],
}
