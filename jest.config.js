const jestConfig = require('kcd-scripts/config').jest

delete jestConfig.coverageThreshold

module.exports = jestConfig
