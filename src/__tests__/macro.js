import plugin from 'babel-plugin-macros'

import { createMacroTests } from './helpers/create-macro-test'

createMacroTests({
  plugin,
  babelOptions: {
    filename: __filename,
  },
  tests: {
    'no usage': `import importAll from '../macro'`,
    'incorrect API usage': {
      error: true,
      code: `
        import importAll from '../macro'
        const x = importAll.defered('hi')
      `,
    },
    'non-static evaluate-able expression': {
      error: true,
      code: `
        import importAll from '../macro'
        const x = importAll(global.whatever)
      `,
    },
    'README:1 `importAll` uses dynamic import': `
      import importAll from '../macro'

      document.getElementById('load-stuff').addEventListener('click', () => {
        importAll('./fixtures/*.js').then(all => {
          console.log(all)
        })
      })
    `,
    'README:2 `importAll.sync` uses static imports': `
      import importAll from '../macro'

      const a = importAll.sync('./fixtures/*.js')
    `,
    'README:3 `importAll.deferred` gives an object with dynamic imports': `
      import importAll from '../macro'

      const routes = importAll.deferred('./fixtures/*.js')
    `,
  },
})
