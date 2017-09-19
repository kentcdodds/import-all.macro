import path from 'path'
import pluginTester from 'babel-plugin-tester'
import plugin from 'babel-macros'
import prettier from 'prettier'
import {prettier as prettierConfig} from 'kcd-scripts/config'

const projectRoot = path.join(__dirname, '../../')

expect.addSnapshotSerializer({
  print(val) {
    return val
      .split(projectRoot)
      .join('<PROJECT_ROOT>/')
      .replace(/fixtures/g, 'my-files')
      .replace(/..\/macro/, 'import-all.macro')
  },
  test(val) {
    return typeof val === 'string'
  },
})

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: {
    filename: __filename,
  },
  formatResult(result) {
    return prettier.format(
      result,
      Object.assign({trailingComma: 'es5'}, prettierConfig),
    )
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
