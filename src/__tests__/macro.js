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
    'import all files': `
      import importAll from '../macro'

      const a = importAll('./fixtures/*.js')
    `,
    'importAll.async uses dynamic import': `
      import importAll from '../macro'

      document.getElementById('load-stuff').addEventListener(() => {
        importAll.async('./fixtures/*.js').then(all => {
          console.log(all)
        })
      })
    `,
  },
})
