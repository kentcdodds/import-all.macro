import plugin from 'babel-plugin-macros'

import { createMacroTests } from './helpers/create-macro-test'

createMacroTests({
  plugin: (babel, options) => {
    return plugin(babel, {
      importAll: {
        transformModulePath(modulePath) {
          return modulePath.replace(/\.js$/, '')
        },
      },
      ...options,
    })
  },
  babelOptions: {
    filename: __filename,
  },
  tests: {
    'README:4 configure `importAll` to transform import path before generating imports': `
      import importAll from '../macro'

      const a = importAll.sync('./fixtures/*.js')
    `,
  },
})