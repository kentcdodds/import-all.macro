import path from 'path'
import pluginTester from 'babel-plugin-tester'
import plugin from 'babel-macros'

const projectRoot = path.join(__dirname, '../../')

expect.addSnapshotSerializer({
  print(val) {
    return val.split(projectRoot).join('<PROJECT_ROOT>/')
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
  tests: {
    'no usage': `import importAll from '../macro'`,
    'importAll.sync uses static imports': `
      import importAll from '../macro'

      const a = importAll.sync('./fixtures/*.js')
    `,
    'importAll uses dynamic import': `
      import importAll from '../macro'

      document.getElementById('load-stuff').addEventListener(() => {
        importAll('./fixtures/*.js').then(all => {
          console.log(all)
        })
      })
    `,
    'importAll.deferred gives an object with dynamic imports': `
      import importAll from '../macro'

      const routes = importAll.deferred('./fixtures/*.js')
    `,
  },
})
