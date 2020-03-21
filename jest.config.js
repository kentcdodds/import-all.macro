const {jest: jestConfig} = require('kcd-scripts/config')

module.exports = {
  ...jestConfig,
  coverageThreshold: null,
}
