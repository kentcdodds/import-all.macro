import path from 'path'
import plugin from 'babel-plugin-macros'

import {createMacroTests} from './helpers/create-macro-test'

createMacroTests({
  plugin: (babel, options) => {
    return plugin(babel, {
      importAll: {
        transformModulePath(modulePath, importingPath) {
          const projectRoot = path.join(__dirname, '../../')
          const modulePathWithoutExt = modulePath.replace(/\.js$/, '')
          const absolutePath = path.resolve(
            path.dirname(importingPath),
            modulePathWithoutExt,
          )
          const pathRelativeToRoot = path.relative(projectRoot, absolutePath)
          return pathRelativeToRoot
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
